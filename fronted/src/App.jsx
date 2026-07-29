import { getListings } from "./api/api";
import React, { useState, useMemo, useEffect } from 'react';
import {
  Utensils, MapPin, Users, Award, TrendingUp, Activity, Search, Plus, Bell,
  Home, Package, Building2, Trophy, Zap, CheckCircle2, Loader2, Truck, Heart,
  Sparkles, Leaf, Phone, Mail, Shield, ChevronRight, Star, Filter, X,
  Cookie, Apple, Milk, Wheat, ChefHat, Timer, PartyPopper, Flame, ArrowUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import { seedListings, seedNgos, seedLeaderboard, seedActivity } from './data/seed.js';

// Zaro-inspired playful brand palette
const ACCENT = {
  lilac: '#B8A9E8', amber: '#F5A623', teal: '#4ECDC4',
  coral: '#FF6B6B', green: '#4ADE80', ink: '#1A1A1A'
};

const CATEGORY = {
  'cooked-meals': { color: ACCENT.coral, textColor: '#DC2626', icon: ChefHat,  label: 'Cooked Meals' },
  'bakery':       { color: ACCENT.amber, textColor: '#92400E', icon: Cookie,   label: 'Bakery' },
  'produce':      { color: ACCENT.green, textColor: '#166534', icon: Apple,    label: 'Produce' },
  'dairy':        { color: ACCENT.teal,  textColor: '#115E59', icon: Milk,     label: 'Dairy' },
  'grains':       { color: ACCENT.lilac, textColor: '#5B21B6', icon: Wheat,    label: 'Grains' },
  'other':        { color: '#9B9B9B',    textColor: '#6B6B6B', icon: Package,  label: 'Other' },
};

const STATUS = {
  available: { color: ACCENT.green, textColor: '#166534', label: 'Available' },
  claimed:   { color: ACCENT.amber, textColor: '#92400E', label: 'Claimed' },
  completed: { color: ACCENT.teal,  textColor: '#115E59', label: 'Delivered' },
  expired:   { color: ACCENT.coral, textColor: '#DC2626', label: 'Expired' },
  cancelled: { color: '#9B9B9B',    textColor: '#6B6B6B', label: 'Cancelled' },
};

const safe = (v) => String(v ?? '').trim();

const fmtExpires = (mins) => {
  if (mins == null) return '—';
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h`;
};

const fmtAgo = (mins) => {
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
};

export default function App() {
  const [listings, setListings] = useState(seedListings);
  const [ngos]                  = useState(seedNgos);
  const [leaders]               = useState(seedLeaderboard);
  const [activity, setActivity] = useState(seedActivity);

  const [activeTab, setActiveTab]     = useState('home');
  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('available');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Aggregates
  const totals = useMemo(() => {
    const available = listings.filter(l => l.status === 'available').length;
    const rescuedMeals = listings
      .filter(l => l.status === 'completed' || l.status === 'claimed')
      .reduce((s, l) => s + (l.servings || 0), 0);
    const co2Saved = Math.round(rescuedMeals * 2.5);
    const peopleFed = Math.round(rescuedMeals * 0.8);
    return { available, rescuedMeals, co2Saved, peopleFed };
  }, [listings]);

  const goal = 1000;
  const progressPct = Math.min((totals.rescuedMeals / goal) * 100, 100);

  const catBreakdown = useMemo(() => {
    const map = {};
    listings.forEach(l => { map[l.category] = (map[l.category] || 0) + (l.servings || 0); });
    return Object.entries(map).map(([k, v]) => ({
      name: CATEGORY[k]?.label || k,
      value: v,
      color: CATEGORY[k]?.color || ACCENT.lilac
    }));
  }, [listings]);

  const weeklyTrend = [
    { day: 'Mon', meals: 180 },
    { day: 'Tue', meals: 240 },
    { day: 'Wed', meals: 210 },
    { day: 'Thu', meals: 320 },
    { day: 'Fri', meals: 410 },
    { day: 'Sat', meals: 520 },
    { day: 'Sun', meals: 480 },
  ];

  const filteredListings = useMemo(() => {
    const q = search.toLowerCase();
    return listings.filter(l => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (catFilter !== 'all' && l.category !== catFilter) return false;
      if (q && !safe(l.name).toLowerCase().includes(q) && !safe(l.donorName).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [listings, search, catFilter, statusFilter]);

  function handleClaim(l) {
    if (l.status !== 'available' || claimingId) return;
    setClaimingId(l.id);
    setTimeout(() => {
      setListings(prev => prev.map(x => x.id === l.id ? { ...x, status: 'claimed', claimedBy: 'You (Robin Hood Army)' } : x));
      setActivity(prev => [
        { id: 'a' + Date.now(), actor: 'You (Robin Hood Army)', action: 'claimed', foodName: l.name, meals: l.servings || 0, minutesAgo: 0 },
        ...prev
      ]);
      setToast(`Claimed ${l.servings} meals from ${l.donorName}!`);
      setClaimingId(null);
    }, 600);
  }

  function handleDonate(form) {
    const id = 'f' + Date.now();
    const newListing = {
      id,
      name: form.name,
      category: form.category,
      servings: parseInt(form.servings, 10),
      description: form.description,
      donorName: 'You (Donor)',
      donorType: 'Restaurant',
      address: form.address,
      distanceKm: 0.5,
      expiresInMinutes: parseInt(form.expiresInMinutes, 10),
      status: 'available',
      claimedBy: '',
    };
    setListings(prev => [newListing, ...prev]);
    setActivity(prev => [
      { id: 'a' + Date.now(), actor: 'You (Donor)', action: 'donated', foodName: form.name, meals: parseInt(form.servings, 10), minutesAgo: 0 },
      ...prev
    ]);
    setShowDonateModal(false);
    setToast(`Posted ${form.servings} meals — AI is matching NGOs now!`);
    setActiveTab('listings');
  }

  const tabs = [
    { id: 'home',        label: 'Dashboard',   icon: Home },
    { id: 'listings',    label: 'Food Feed',   icon: Utensils },
    { id: 'ngos',        label: 'Partners',    icon: Building2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'activity',    label: 'Live Feed',   icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Frosted sticky header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shadow-sm">
                  <Utensils size={18} className="text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#4ADE80] border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">FeedX</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#B8A9E8]/15 text-[#5B21B6] border border-[#B8A9E8]/30">
                    AI-Powered
                  </span>
                </div>
                <p className="text-[11px] text-[#9B9B9B] mt-0.5">Smart Food Rescue · SDG 2: Zero Hunger</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 rounded-full hover:bg-[#F0F0F0] transition-colors">
                <Bell size={16} className="text-[#6B6B6B]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B6B]" />
              </button>
              <button
                onClick={() => setShowDonateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#B8A9E8] text-[#1A1A1A] text-sm font-semibold hover:bg-[#A89AD8] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus size={14} strokeWidth={2.5} />
                Post Donation
              </button>
              <div className="w-9 h-9 rounded-full bg-[#F5A623]/15 flex items-center justify-center text-[11px] font-bold text-[#92400E] border border-[#F5A623]/30">
                HJ
              </div>
            </div>
          </div>

          <div className="flex gap-1 mt-4 bg-[#F0F0F0]/60 rounded-full p-1 w-fit overflow-x-auto">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${active ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}>
                  <Icon size={14} />{t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div key={activeTab} className="animate-[fadeIn_300ms_ease-out]">

          {activeTab === 'home' && (
            <DashboardView
              totals={totals} goal={goal} progressPct={progressPct}
              catBreakdown={catBreakdown} weeklyTrend={weeklyTrend}
              activity={activity}
              onDonateClick={() => setShowDonateModal(true)}
              onBrowseClick={() => setActiveTab('listings')}
              onSeeAllActivity={() => setActiveTab('activity')}
            />
          )}

          {activeTab === 'listings' && (
            <ListingsView
              listings={filteredListings} allCount={filteredListings.length}
              search={search} setSearch={setSearch}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              catFilter={catFilter} setCatFilter={setCatFilter}
              onOpen={setSelectedListing}
              onClaim={handleClaim}
              claimingId={claimingId}
            />
          )}

          {activeTab === 'ngos' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Partner Organizations</h2>
                <p className="text-sm text-[#6B6B6B] mt-1">Verified NGOs, food banks, and shelters distributing rescued meals.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {ngos.map(n => <NgoCard key={n.id} n={n} />)}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && <LeaderboardView leaders={leaders} />}

          {activeTab === 'activity' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
                  Live Activity Feed <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                </h2>
                <p className="text-sm text-[#6B6B6B] mt-1">Every donation, claim, and delivery — happening now.</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
                <div className="divide-y divide-[#F0F0F0]">
                  {activity.map(a => <ActivityRow key={a.id} a={a} />)}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {showDonateModal && (
        <DonateModal
          onClose={() => setShowDonateModal(false)}
          onSubmit={handleDonate}
        />
      )}

      {selectedListing && (
        <ListingDetailModal
          l={listings.find(x => x.id === selectedListing.id) || selectedListing}
          onClose={() => setSelectedListing(null)}
          onClaim={() => { handleClaim(selectedListing); setSelectedListing(null); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_300ms_ease-out]">
          <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#1A1A1A] text-white text-sm shadow-lg">
            <CheckCircle2 size={16} className="text-[#4ADE80]" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Dashboard ================= */

function DashboardView({ totals, goal, progressPct, catBreakdown, weeklyTrend, activity, onDonateClick, onBrowseClick, onSeeAllActivity }) {
  return (
    <div className="space-y-8">
      {/* HERO */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-[#F0F0F0] p-8 md:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, #B8A9E8 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #4ADE80 0%, transparent 70%)' }} />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#166534]">LIVE · {totals.available} rescues available now</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
              Rescue food.<br />
              <span className="text-[#5B21B6]">Feed hope.</span>
            </h2>
            <p className="mt-4 text-[15px] text-[#6B6B6B] leading-relaxed max-w-md">
              FeedX uses AI to connect restaurants, hotels, and grocers with nearby NGOs — so surplus food fights hunger instead of filling landfills.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <button onClick={onDonateClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B8A9E8] text-[#1A1A1A] text-sm font-semibold hover:bg-[#A89AD8] shadow-sm hover:shadow-md transition-all duration-200">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#1A1A1A]">
                  <Plus size={10} className="text-white" strokeWidth={3} />
                </span>
                Donate Food
              </button>
              <button onClick={onBrowseClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-[#333] shadow-sm hover:shadow-md transition-all duration-200">
                <Search size={14} /> Find Food
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-52 h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#F0F0F0" strokeWidth="14" />
                <circle cx="100" cy="100" r="85" fill="none" stroke="url(#ringGrad)" strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(progressPct / 100) * 534} 534`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#B8A9E8" />
                    <stop offset="100%" stopColor="#4ADE80" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-medium text-[#9B9B9B] uppercase tracking-wide">Meals Today</span>
                <span className="text-4xl font-bold text-[#1A1A1A]">{totals.rescuedMeals}</span>
                <span className="text-xs text-[#6B6B6B] mt-1">of {goal} goal</span>
                <div className="mt-2 px-2.5 py-0.5 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20">
                  <span className="text-[10px] font-bold text-[#166534] flex items-center gap-1">
                    <ArrowUp size={9} /> {Math.round(progressPct)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Available Now',  v: totals.available,    i: Utensils, c: ACCENT.green, sub: 'listings live' },
          { l: 'Meals Rescued',  v: totals.rescuedMeals, i: Heart,    c: ACCENT.coral, sub: 'served today' },
          { l: 'People Fed',     v: totals.peopleFed,    i: Users,    c: ACCENT.lilac, sub: 'estimated' },
          { l: 'CO₂ Saved (kg)', v: totals.co2Saved,     i: Leaf,     c: ACCENT.teal,  sub: 'landfill diverted' },
        ].map((s, i) => {
          const Icon = s.i;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#F0F0F0] p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.c + '22' }}>
                  <Icon size={14} style={{ color: s.c }} />
                </div>
                <span className="text-2xl font-bold text-[#1A1A1A]">{s.v.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-[#1A1A1A] font-semibold">{s.l}</p>
              <p className="text-[10px] text-[#9B9B9B] mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F0F0F0] p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                <TrendingUp size={14} className="text-[#F5A623]" /> Weekly Rescue Trend
              </h3>
              <p className="text-[11px] text-[#9B9B9B] mt-0.5">Meals rescued per day this week</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#4ADE80]/10 text-[#166534] border border-[#4ADE80]/20">
              ↑ 24% vs last week
            </span>
          </div>
          <div className="h-56 mt-4">
            <ResponsiveContainer>
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="mealsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B8A9E8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#B8A9E8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9B9B9B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9B9B9B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0F0F0', fontSize: 12 }} />
                <Area type="monotone" dataKey="meals" stroke="#B8A9E8" strokeWidth={2.5} fill="url(#mealsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6">
          <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2 mb-1">
            <PartyPopper size={14} className="text-[#B8A9E8]" /> By Category
          </h3>
          <p className="text-[11px] text-[#9B9B9B] mb-3">Meals across food types</p>
          <div className="h-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={68} paddingAngle={3} dataKey="value">
                  {catBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0F0F0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {catBreakdown.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-[#1A1A1A]">{c.name}</span>
                </div>
                <span className="font-semibold text-[#6B6B6B]">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-[#F5A623]" /> How FeedX Works
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Plus,  c: ACCENT.lilac, title: '1. Donate',             desc: 'Restaurants & hotels post surplus food with a photo, quantity and pickup window.' },
            { icon: Zap,   c: ACCENT.amber, title: '2. AI Matches',         desc: 'Our AI finds the nearest verified NGO based on distance, freshness, and demand.' },
            { icon: Truck, c: ACCENT.green, title: '3. Volunteer Picks Up', desc: 'GPS-guided volunteers pick up and deliver — every step tracked live.' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-[#F0F0F0] p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: f.c + '22' }}>
                  <Icon size={18} style={{ color: f.c }} />
                </div>
                <h4 className="text-sm font-bold text-[#1A1A1A]">{f.title}</h4>
                <p className="text-[12px] text-[#6B6B6B] mt-1 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity preview */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
            <Activity size={14} className="text-[#4ADE80]" />
            Live Activity
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse ml-1" />
          </h3>
          <button onClick={onSeeAllActivity}
            className="text-[11px] font-medium text-[#5B21B6] hover:text-[#4C1D95] flex items-center gap-0.5">
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-[#F0F0F0]">
          {activity.slice(0, 5).map((a) => (
            <ActivityRow key={a.id} a={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= Listings ================= */

function ListingsView({ listings, search, setSearch, statusFilter, setStatusFilter, catFilter, setCatFilter, onOpen, onClaim, claimingId }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Food Feed</h2>
        <p className="text-sm text-[#6B6B6B] mt-1">Fresh surplus food from restaurants, hotels, and grocers near you.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#F0F0F0] rounded-full bg-white placeholder:text-[#9B9B9B] focus:outline-none focus:border-[#E0E0E0] focus:ring-2 focus:ring-[#1A1A1A]/5"
            placeholder="Search food or donor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="text-sm border border-[#F0F0F0] rounded-full px-4 py-2.5 bg-white text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="claimed">Claimed</option>
          <option value="completed">Delivered</option>
        </select>
        <span className="text-[11px] text-[#9B9B9B] font-medium ml-auto">{listings.length} listings</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryChip active={catFilter === 'all'} onClick={() => setCatFilter('all')} icon={Filter} color={ACCENT.ink} label="All Categories" />
        {Object.entries(CATEGORY).map(([key, c]) => (
          <CategoryChip
            key={key}
            active={catFilter === key}
            onClick={() => setCatFilter(key)}
            icon={c.icon}
            color={c.color}
            label={c.label}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(l => (
          <FoodCard
            key={l.id}
            l={l}
            onClick={() => onOpen(l)}
            onClaim={() => onClaim(l)}
            claiming={claimingId === l.id}
            claimed={l.status !== 'available'}
          />
        ))}
        {listings.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl border border-[#F0F0F0]">
            <Utensils size={32} className="mx-auto mb-3 text-[#E0E0E0]" />
            <p className="text-sm text-[#9B9B9B]">No listings match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Leaderboard ================= */

function LeaderboardView({ leaders }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
          Top Food Rescuers <Trophy size={22} className="text-[#F5A623]" />
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1">Recognizing the donors who are feeding our city — one meal at a time.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[leaders[1], leaders[0], leaders[2]].filter(Boolean).map((u, idx) => {
          const pos = [2, 1, 3][idx];
          const isFirst = pos === 1;
          const color = pos === 1 ? ACCENT.amber : pos === 2 ? ACCENT.lilac : ACCENT.coral;
          const bg    = pos === 1 ? '#FEF3C7' : pos === 2 ? '#EDE9FE' : '#FEE2E2';
          return (
            <div key={u.id}
              className={`bg-white rounded-2xl border border-[#F0F0F0] p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${isFirst ? 'md:-mt-4' : ''}`}>
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2" style={{ backgroundColor: bg, color: color, borderColor: color }}>
                  {safe(u.initials) || safe(u.name).slice(0, 2)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: color }}>
                  {pos}
                </div>
              </div>
              <h4 className="text-sm font-bold text-[#1A1A1A] mt-3 truncate">{u.name}</h4>
              <p className="text-[10px] text-[#9B9B9B] mt-0.5">{u.role}</p>
              <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
                <p className="text-2xl font-bold" style={{ color }}>{u.meals.toLocaleString()}</p>
                <p className="text-[10px] text-[#9B9B9B] font-medium uppercase tracking-wide">meals rescued</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
            <Award size={14} className="text-[#B8A9E8]" /> Full Rankings
          </h3>
          <span className="text-[10px] text-[#9B9B9B] font-medium">All-time</span>
        </div>
        <div className="divide-y divide-[#F0F0F0]">
          {leaders.map(u => <LeaderRow key={u.id} u={u} />)}
        </div>
      </div>
    </div>
  );
}

/* ================= Small components ================= */

function CategoryChip({ active, onClick, icon: Icon, color, label }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 ${active ? 'shadow-sm' : 'hover:-translate-y-0.5'}`}
      style={{
        backgroundColor: active ? color + '22' : 'white',
        borderColor: active ? color + '55' : '#F0F0F0',
        color: active ? '#1A1A1A' : '#6B6B6B',
      }}
    >
      <Icon size={12} style={{ color }} />
      {label}
    </button>
  );
}

function FoodCard({ l, onClick, onClaim, claiming, claimed }) {
  const cat = CATEGORY[l.category] || CATEGORY.other;
  const CatIcon = cat.icon;
  const stat = STATUS[l.status] || STATUS.available;
  const urgent = (l.expiresInMinutes || 0) < 120 && l.status === 'available';

  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
      <div className="relative h-32 flex items-center justify-center overflow-hidden" style={{ backgroundColor: cat.color + '15' }}>
        <CatIcon size={44} style={{ color: cat.color }} className="opacity-70 group-hover:scale-110 transition-transform duration-200" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border bg-white"
            style={{ color: cat.textColor, borderColor: cat.color + '55' }}>
            {cat.label}
          </span>
          {urgent && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border bg-white flex items-center gap-1"
              style={{ color: '#DC2626', borderColor: '#FF6B6B55' }}>
              <Flame size={9} /> Urgent
            </span>
          )}
        </div>
        <span className="absolute top-3 right-3 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide border"
          style={{ backgroundColor: stat.color + '22', color: stat.textColor, borderColor: stat.color + '55' }}>
          {stat.label}
        </span>
      </div>

      <div className="p-4 cursor-pointer" onClick={onClick}>
        <h4 className="text-[14px] font-bold text-[#1A1A1A] leading-tight">{l.name}</h4>
        <p className="text-[11px] text-[#6B6B6B] mt-1 line-clamp-2">{l.description}</p>

        <div className="mt-3 flex items-center gap-2 text-[11px]">
          <div className="inline-flex items-center gap-1 text-[#5B21B6] font-semibold">
            <Users size={11} /> {l.servings} meals
          </div>
          <span className="text-[#E0E0E0]">•</span>
          <div className="inline-flex items-center gap-1 text-[#92400E] font-semibold">
            <Timer size={11} /> {fmtExpires(l.expiresInMinutes)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
          <p className="text-[11px] font-semibold text-[#1A1A1A] truncate">{l.donorName}</p>
          <p className="text-[10px] text-[#9B9B9B] flex items-center gap-1 truncate">
            <MapPin size={9} className="text-[#B8A9E8] shrink-0" />
            {l.distanceKm}km · {l.address}
          </p>
        </div>

        <button
          onClick={e => { e.stopPropagation(); if (!claimed) onClaim(); }}
          disabled={claimed || claiming}
          className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-[12px] font-semibold transition-all duration-200 ${
            claimed
              ? 'bg-[#F0F0F0] text-[#9B9B9B] cursor-not-allowed'
              : 'bg-[#B8A9E8] text-[#1A1A1A] hover:bg-[#A89AD8] shadow-sm hover:shadow-md'
          }`}
        >
          {claiming ? (
            <><Loader2 size={12} className="animate-spin" /> Claiming…</>
          ) : claimed ? (
            <><CheckCircle2 size={12} /> {stat.label}</>
          ) : (
            <>Claim Now <ChevronRight size={12} /></>
          )}
        </button>
      </div>
    </div>
  );
}

function NgoCard({ n }) {
  const cats = safe(n.acceptedCategories).split(',').map(s => s.trim()).filter(Boolean);
  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: ACCENT.lilac + '22' }}>
          <Building2 size={18} style={{ color: ACCENT.lilac }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-[#1A1A1A]">{n.name}</h4>
            {n.verified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#4ADE80]/10 text-[#166534] border border-[#4ADE80]/20">
                <Shield size={9} /> Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#9B9B9B] mt-0.5">{n.type} · {n.distanceKm}km away</p>
          <p className="text-[11px] text-[#6B6B6B] mt-2 flex items-center gap-1">
            <MapPin size={10} className="text-[#B8A9E8]" /> {n.address}
          </p>

          <div className="flex flex-wrap gap-1 mt-3">
            {cats.map(c => {
              const cat = CATEGORY[c] || CATEGORY.other;
              return (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                  style={{ backgroundColor: cat.color + '15', color: cat.textColor, borderColor: cat.color + '40' }}>
                  {cat.label}
                </span>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-2.5 rounded-xl bg-[#FAFAF8]">
              <p className="text-[10px] text-[#9B9B9B] font-medium uppercase">Meals</p>
              <p className="text-sm font-bold text-[#1A1A1A]">{n.mealsReceived.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAFAF8]">
              <p className="text-[10px] text-[#9B9B9B] font-medium uppercase">Served</p>
              <p className="text-sm font-bold text-[#1A1A1A]">{n.peopleServed.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F0F0F0] flex-wrap">
            <a href={`mailto:${n.contactEmail}`} className="text-[11px] text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-1">
              <Mail size={10} className="text-[#F5A623]" /> {n.contactEmail}
            </a>
            <a href={`tel:${n.contactPhone}`} className="text-[11px] text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-1">
              <Phone size={10} className="text-[#4ECDC4]" /> Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderRow({ u }) {
  const rankColor = u.rank === 1 ? ACCENT.amber : u.rank === 2 ? ACCENT.lilac : u.rank === 3 ? ACCENT.coral : '#E0E0E0';
  const badgeColor = u.badge === 'Gold Rescuer' ? ACCENT.amber : u.badge === 'Silver Rescuer' ? ACCENT.lilac : u.badge === 'Bronze Rescuer' ? ACCENT.coral : ACCENT.teal;
  const badgeText  = u.badge === 'Gold Rescuer' ? '#92400E' : u.badge === 'Silver Rescuer' ? '#5B21B6' : u.badge === 'Bronze Rescuer' ? '#DC2626' : '#115E59';

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAF8] transition-colors duration-150">
      <div className="w-8 text-center">
        {u.rank <= 3 ? (
          <Trophy size={16} style={{ color: rankColor }} className="mx-auto" />
        ) : (
          <span className="text-[13px] font-bold text-[#9B9B9B]">#{u.rank}</span>
        )}
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: rankColor + '22', color: rankColor }}>
        {u.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{u.name}</p>
        <p className="text-[10px] text-[#9B9B9B]">{u.role} · {u.donations} donations</p>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide border hidden sm:inline-flex items-center gap-1"
        style={{ backgroundColor: badgeColor + '15', color: badgeText, borderColor: badgeColor + '40' }}>
        <Star size={9} /> {u.badge}
      </span>
      <div className="text-right">
        <p className="text-sm font-bold text-[#1A1A1A]">{u.meals.toLocaleString()}</p>
        <p className="text-[10px] text-[#9B9B9B]">meals</p>
      </div>
    </div>
  );
}

function ActivityRow({ a }) {
  const actionMap = {
    donated:   { icon: Plus,         color: ACCENT.green, text: '#166534', verb: 'donated' },
    claimed:   { icon: Package,      color: ACCENT.amber, text: '#92400E', verb: 'claimed' },
    delivered: { icon: CheckCircle2, color: ACCENT.teal,  text: '#115E59', verb: 'delivered' },
    cancelled: { icon: X,            color: ACCENT.coral, text: '#DC2626', verb: 'cancelled' },
  };
  const cfg = actionMap[a.action] || actionMap.donated;
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#FAFAF8] transition-colors duration-150">
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.color + '22' }}>
        <Icon size={14} style={{ color: cfg.color }} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1A1A1A]">
          <span className="font-semibold">{a.actor}</span>{' '}
          <span style={{ color: cfg.text }} className="font-medium">{cfg.verb}</span>{' '}
          <span className="font-semibold">{a.meals} meals</span>
          <span className="text-[#6B6B6B]"> — {a.foodName}</span>
        </p>
        <p className="text-[10px] text-[#9B9B9B] mt-0.5">{fmtAgo(a.minutesAgo)}</p>
      </div>
      {a.minutesAgo < 5 && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
      )}
    </div>
  );
}

/* ================= Modals ================= */

function DonateModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '', category: 'cooked-meals', servings: 10,
    description: '', address: '', expiresInMinutes: 120,
  });
  const [error, setError] = useState('');

  function submit() {
    if (!form.name || !form.servings || !form.address) {
      setError('Name, servings, and address are required.');
      return;
    }
    setError('');
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 animate-[fadeIn_200ms_ease-out]">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[92vh] overflow-y-auto animate-[slideUp_300ms_ease-out]">
        <div className="sticky top-0 bg-white border-b border-[#F0F0F0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#B8A9E8]/20 flex items-center justify-center">
              <Plus size={14} className="text-[#5B21B6]" strokeWidth={2.5} />
            </div>
            <h3 className="text-base font-bold text-[#1A1A1A]">Post a Donation</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F0F0F0]"><X size={16} className="text-[#6B6B6B]" /></button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Food name" required>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Veg Biryani (12 boxes)"
              className="w-full px-4 py-2.5 text-sm border border-[#F0F0F0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#E0E0E0]" />
          </Field>

          <Field label="Category">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORY).map(([key, c]) => {
                const CIcon = c.icon;
                const active = form.category === key;
                return (
                  <button key={key} onClick={() => setForm({ ...form, category: key })}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-2xl border text-[11px] font-medium transition-all duration-200"
                    style={{
                      backgroundColor: active ? c.color + '22' : 'white',
                      borderColor: active ? c.color + '55' : '#F0F0F0',
                      color: active ? '#1A1A1A' : '#6B6B6B',
                    }}
                  >
                    <CIcon size={16} style={{ color: c.color }} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Servings" required>
              <input type="number" min="1" value={form.servings} onChange={e => setForm({ ...form, servings: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-[#F0F0F0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5" />
            </Field>
            <Field label="Available for">
              <select value={form.expiresInMinutes} onChange={e => setForm({ ...form, expiresInMinutes: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-[#F0F0F0] rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5">
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
                <option value="480">8 hours</option>
                <option value="1440">1 day</option>
                <option value="2880">2 days</option>
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Freshness, packaging, allergens…" rows={3}
              className="w-full px-4 py-2.5 text-sm border border-[#F0F0F0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 resize-none" />
          </Field>

          <Field label="Pickup address" required>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. MG Road, Bengaluru"
              className="w-full px-4 py-2.5 text-sm border border-[#F0F0F0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5" />
          </Field>

          {error && (
            <div className="text-[12px] text-[#DC2626] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-2xl px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#B8A9E8]/10 border border-[#B8A9E8]/20">
            <Sparkles size={14} className="text-[#5B21B6] shrink-0" />
            <p className="text-[11px] text-[#5B21B6]">Our AI will instantly match your donation with the nearest verified NGO.</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#F0F0F0] px-6 py-4 flex gap-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-medium text-[#6B6B6B] hover:bg-[#F0F0F0] transition-colors">
            Cancel
          </button>
          <button onClick={submit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#B8A9E8] text-[#1A1A1A] text-sm font-semibold hover:bg-[#A89AD8] shadow-sm hover:shadow-md transition-all duration-200">
            Post Donation <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#1A1A1A] mb-1.5 block">
        {label} {required && <span className="text-[#DC2626]">*</span>}
      </label>
      {children}
    </div>
  );
}

function ListingDetailModal({ l, onClose, onClaim }) {
  const cat = CATEGORY[l.category] || CATEGORY.other;
  const CatIcon = cat.icon;
  const stat = STATUS[l.status] || STATUS.available;
  const claimed = l.status !== 'available';

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 animate-[fadeIn_200ms_ease-out]">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[92vh] overflow-y-auto animate-[slideUp_300ms_ease-out]">
        <div className="relative h-40 flex items-center justify-center" style={{ backgroundColor: cat.color + '22' }}>
          <CatIcon size={56} style={{ color: cat.color }} className="opacity-80" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white transition-colors">
            <X size={16} className="text-[#1A1A1A]" />
          </button>
          <span className="absolute top-4 left-4 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide border bg-white"
            style={{ color: stat.textColor, borderColor: stat.color + '55' }}>
            {stat.label}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">{l.name}</h3>
            <p className="text-[13px] text-[#6B6B6B] mt-1">{l.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatMini icon={Users} color={ACCENT.lilac} label="Servings" value={l.servings} />
            <StatMini icon={Timer} color={ACCENT.amber} label="Expires in" value={fmtExpires(l.expiresInMinutes)} />
            <StatMini icon={MapPin} color={ACCENT.teal} label="Distance" value={`${l.distanceKm}km`} />
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#F0F0F0]">
            <p className="text-[10px] font-semibold text-[#9B9B9B] uppercase tracking-wide">Donor</p>
            <p className="text-sm font-bold text-[#1A1A1A] mt-1">{l.donorName}</p>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">{l.donorType}</p>
            <p className="text-[11px] text-[#6B6B6B] mt-2 flex items-center gap-1">
              <MapPin size={10} className="text-[#B8A9E8]" /> {l.address}
            </p>
          </div>

          {l.claimedBy && (
            <div className="p-4 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20">
              <p className="text-[10px] font-semibold text-[#92400E] uppercase tracking-wide">Claimed by</p>
              <p className="text-sm font-bold text-[#92400E] mt-1">{l.claimedBy}</p>
            </div>
          )}

          <button
            onClick={onClaim}
            disabled={claimed}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
              claimed
                ? 'bg-[#F0F0F0] text-[#9B9B9B] cursor-not-allowed'
                : 'bg-[#B8A9E8] text-[#1A1A1A] hover:bg-[#A89AD8] shadow-sm hover:shadow-md'
            }`}
          >
            {claimed ? <><CheckCircle2 size={16} /> Already claimed</> : <>Claim This Donation <ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatMini({ icon: Icon, color, label, value }) {
  return (
    <div className="p-3 rounded-2xl border border-[#F0F0F0] bg-white text-center">
      <div className="w-7 h-7 rounded-xl mx-auto flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
        <Icon size={12} style={{ color }} />
      </div>
      <p className="text-sm font-bold text-[#1A1A1A] mt-2">{value}</p>
      <p className="text-[10px] text-[#9B9B9B] font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
