# 🍽️ FeedX — Smart Food Rescue Frontend

**FeedX** is an AI-powered smart food donation & redistribution platform that connects restaurants, hotels, hostels, grocery stores, and event organizers with NGOs, food banks, old age homes, and orphanages — helping reduce food wastage while fighting hunger.

> This repository contains the **React frontend** (Vite + Tailwind CSS + Recharts + Lucide Icons).
> The companion backend (Node.js + Express + MongoDB + Socket.io) is a separate project.

---

## ✨ Features

- **Beautiful dashboard** — Hero progress ring, live rescue counter, KPI cards
- **Food feed** — Search, category filters (bakery, produce, cooked meals, dairy, grains), status filters, urgency badges
- **Post donation** — Rich modal form with category picker, servings, expiry window
- **Claim food** — One-click claim on any listing with instant activity update
- **NGO directory** — Verified partner cards with contact & accepted categories
- **Leaderboard** — Top-3 podium + full rankings with tier badges
- **Live activity feed** — Real-time donations, claims, and deliveries
- **Charts** — Area chart (weekly trend) + donut (category breakdown) via Recharts
- **Fully responsive** — Mobile bottom-sheet modals, segmented pill tabs, frosted-glass header
- **Zaro-inspired brand** — Lilac / Amber / Teal / Coral / Green accent palette, hairline borders, subtle motion

---

## 🚀 Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

Requires **Node.js 18+**.

---

## 📁 Project structure

```
feedx-frontend/
├── index.html                  # Vite entry HTML
├── package.json
├── vite.config.js              # Vite + React config
├── tailwind.config.js          # Tailwind theme
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                # React root
    ├── index.css               # Tailwind + custom keyframes
    ├── App.jsx                 # Main app (all views, modals, cards)
    └── data/
        └── seed.js             # Local seed data (listings, NGOs, activity, leaderboard)
```

---

## 🔌 Wiring to your backend

The frontend currently uses local seed data from `src/data/seed.js`. To wire it to the **foodcycle-backend** (Node.js + Express + MongoDB) that inspired this UI, replace the seed imports in `App.jsx` with `fetch()` calls to your API:

| Endpoint                              | Purpose                                    |
|---------------------------------------|--------------------------------------------|
| `GET  /api/food?status=available`     | List food (used by Food Feed tab)          |
| `POST /api/food`                      | Post a donation (Donate modal)             |
| `POST /api/food/:id/claim`            | Claim a listing                            |
| `PATCH /api/food/:id/status`          | Mark delivered / cancelled                 |
| `GET  /api/ngos`                      | Partner NGOs                               |
| `GET  /api/leaderboard?range=all`     | Top donors                                 |
| `GET  /api/activity?limit=10`         | Live activity feed                         |
| `GET  /api/stats/overview?goal=1000`  | Hero ring + KPI cards                      |
| `POST /api/auth/register / login`     | Auth (JWT bearer tokens)                   |

For real-time activity, connect to the backend's **Socket.io** server and listen for the `activity:new` event.

Example — replace the `useState(seedListings)` with:

```jsx
const [listings, setListings] = useState([]);
useEffect(() => {
  fetch('http://localhost:5000/api/food?status=available')
    .then(r => r.json())
    .then(res => setListings(res.data));
}, []);
```

---

## 🎨 Design system

| Token       | Value       | Use                                    |
|-------------|-------------|----------------------------------------|
| Lilac       | `#B8A9E8`   | Primary CTA, grains, brand identity    |
| Amber       | `#F5A623`   | Bakery, warnings, "claimed"            |
| Teal        | `#4ECDC4`   | Dairy, secondary brand, "delivered"    |
| Coral       | `#FF6B6B`   | Cooked meals, urgency, destructive     |
| Green       | `#4ADE80`   | Produce, "available", success          |
| Ink         | `#1A1A1A`   | Primary text, header logo, dark button |
| Page bg     | `#FAFAF8`   | Warm off-white                         |
| Card border | `#F0F0F0`   | Hairline dividers                      |
| Meta text   | `#9B9B9B`   | Labels, timestamps                     |

Font: **Inter** (loaded from Google Fonts in `index.html`).

---

## 📄 Tech stack

- ⚛️ **React 18** + Vite 5
- 🎨 **Tailwind CSS 3**
- 📊 **Recharts** for beautiful data viz
- 🎯 **Lucide Icons** — clean, consistent iconography
- 🎭 **Inter** font family

---

## 🌱 Impact

FeedX supports **UN Sustainable Development Goal 2: Zero Hunger** by:
- Reducing food waste at scale
- Redistributing surplus food to those in need
- Cutting landfill CO₂ emissions
- Building a community of restaurants, NGOs, and volunteers

---

**Made with 🧡 by Quantum Coders**
