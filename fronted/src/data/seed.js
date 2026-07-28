// Seed data for FeedX frontend — stand-in for the backend responses.
// Each object matches the shape returned by the Node/Express + MongoDB API.

export const seedListings = [
  { id: "f001", name: "Veg Biryani (12 boxes)", category: "cooked-meals", servings: 24, description: "Freshly cooked veg biryani from tonight's event buffet. Packed hot in sealed containers.", donorName: "Spice Garden Restaurant", donorType: "Restaurant", address: "MG Road, Bengaluru", distanceKm: 1.2, expiresInMinutes: 90, status: "available", claimedBy: "" },
  { id: "f002", name: "Assorted Bakery Bread", category: "bakery", servings: 40, description: "End-of-day bread, buns and croissants. Great for morning distribution.", donorName: "The Daily Loaf", donorType: "Bakery", address: "Koramangala 5th Block", distanceKm: 2.4, expiresInMinutes: 720, status: "available", claimedBy: "" },
  { id: "f003", name: "Fresh Fruit Baskets", category: "produce", servings: 60, description: "Apples, bananas, oranges from wholesale surplus. Clean and edible.", donorName: "Farmers Market Co-op", donorType: "Grocery", address: "Indiranagar 100ft Rd", distanceKm: 3.8, expiresInMinutes: 1440, status: "available", claimedBy: "" },
  { id: "f004", name: "Wedding Buffet Surplus", category: "cooked-meals", servings: 120, description: "Full vegetarian wedding menu — rice, dal, sabzi, roti, sweets. Sealed steel trays.", donorName: "Grand Palace Hotel", donorType: "Hotel", address: "Whitefield", distanceKm: 8.1, expiresInMinutes: 180, status: "claimed", claimedBy: "Akshaya Patra" },
  { id: "f005", name: "Milk & Yogurt (chilled)", category: "dairy", servings: 30, description: "Unopened 1L milk cartons and yogurt cups, refrigerated.", donorName: "FreshMart Grocery", donorType: "Grocery", address: "HSR Layout Sector 2", distanceKm: 4.6, expiresInMinutes: 2880, status: "available", claimedBy: "" },
  { id: "f006", name: "Rice & Lentils Bulk", category: "grains", servings: 200, description: "20kg rice + 10kg toor dal from over-purchased inventory. Sealed and dry.", donorName: "Hostel Mess — IIIT-B", donorType: "Hostel", address: "Electronic City Phase 1", distanceKm: 12.3, expiresInMinutes: 4320, status: "available", claimedBy: "" },
  { id: "f007", name: "Sandwiches & Wraps", category: "cooked-meals", servings: 45, description: "Corporate event leftover — veg & paneer sandwiches, individually wrapped.", donorName: "TechPark Cafe", donorType: "Cafe", address: "Manyata Tech Park", distanceKm: 6.7, expiresInMinutes: 240, status: "available", claimedBy: "" },
  { id: "f008", name: "Birthday Cake Slices", category: "bakery", servings: 25, description: "Fresh chocolate cake, sliced and boxed. Best consumed today.", donorName: "Sweet Crumbs Bakery", donorType: "Bakery", address: "Jayanagar 4th Block", distanceKm: 5.2, expiresInMinutes: 300, status: "completed", claimedBy: "Shishu Bal Ashram" },
  { id: "f009", name: "Vegetable Curry & Rice", category: "cooked-meals", servings: 80, description: "Full lunch service surplus — mixed veg curry, jeera rice, dal, papad.", donorName: "Annapurna Canteen", donorType: "Canteen", address: "MG Road Metro", distanceKm: 1.9, expiresInMinutes: 60, status: "available", claimedBy: "" },
  { id: "f010", name: "Fresh Vegetables Mix", category: "produce", servings: 90, description: "Tomatoes, onions, potatoes, greens — end-of-market fresh produce.", donorName: "Green Valley Grocers", donorType: "Grocery", address: "BTM Layout 2nd Stage", distanceKm: 4.1, expiresInMinutes: 1440, status: "available", claimedBy: "" },
  { id: "f011", name: "Pizza & Pasta", category: "cooked-meals", servings: 35, description: "Party leftover from birthday event. Vegetarian pizzas and pasta.", donorName: "La Pizzeria", donorType: "Restaurant", address: "Church Street", distanceKm: 2.1, expiresInMinutes: 120, status: "completed", claimedBy: "Helping Hands NGO" },
  { id: "f012", name: "Chapatis & Dry Sabzi", category: "cooked-meals", servings: 55, description: "Home-style meal from a community kitchen — rotis, aloo-gobi, dal.", donorName: "Community Kitchen Trust", donorType: "Community", address: "Rajajinagar", distanceKm: 7.3, expiresInMinutes: 180, status: "available", claimedBy: "" }
];

export const seedNgos = [
  { id: "n001", name: "Akshaya Patra Foundation", type: "Food Bank", contactEmail: "contact@akshayapatra.org", contactPhone: "+91 80 2547 8000", acceptedCategories: "cooked-meals, grains, produce", address: "Vasanthapura, Bengaluru", distanceKm: 5.4, verified: true, mealsReceived: 12480, peopleServed: 8500 },
  { id: "n002", name: "Shishu Bal Ashram", type: "Orphanage", contactEmail: "help@shishubal.org", contactPhone: "+91 98450 12345", acceptedCategories: "cooked-meals, dairy, bakery", address: "Jayanagar 7th Block", distanceKm: 3.2, verified: true, mealsReceived: 4210, peopleServed: 120 },
  { id: "n003", name: "Helping Hands NGO", type: "NGO", contactEmail: "info@helpinghands.in", contactPhone: "+91 99009 87654", acceptedCategories: "cooked-meals, bakery, produce", address: "Indiranagar", distanceKm: 2.8, verified: true, mealsReceived: 6850, peopleServed: 3200 },
  { id: "n004", name: "Anandashram Old Age Home", type: "Old Age Home", contactEmail: "care@anandashram.org", contactPhone: "+91 80 4123 9900", acceptedCategories: "cooked-meals, dairy, bakery", address: "Malleshwaram", distanceKm: 6.1, verified: true, mealsReceived: 2380, peopleServed: 85 },
  { id: "n005", name: "Robin Hood Army — Bengaluru", type: "Volunteer Network", contactEmail: "blr@robinhoodarmy.com", contactPhone: "+91 98800 55123", acceptedCategories: "cooked-meals, bakery, produce, dairy", address: "Koramangala", distanceKm: 2.5, verified: true, mealsReceived: 15200, peopleServed: 11400 },
  { id: "n006", name: "Sadhu Vaswani Mission", type: "Community Kitchen", contactEmail: "seva@svm.org", contactPhone: "+91 80 2334 5678", acceptedCategories: "grains, produce, dairy", address: "Basavanagudi", distanceKm: 4.7, verified: true, mealsReceived: 3400, peopleServed: 1800 },
  { id: "n007", name: "Feeding India", type: "NGO", contactEmail: "hello@feedingindia.org", contactPhone: "+91 96500 42100", acceptedCategories: "cooked-meals, bakery", address: "HSR Layout", distanceKm: 4.3, verified: true, mealsReceived: 9600, peopleServed: 6100 },
  { id: "n008", name: "Karuna Trust Shelter", type: "Shelter Home", contactEmail: "shelter@karuna.org", contactPhone: "+91 80 2678 4400", acceptedCategories: "cooked-meals, grains, dairy", address: "RT Nagar", distanceKm: 7.9, verified: false, mealsReceived: 1250, peopleServed: 220 }
];

export const seedLeaderboard = [
  { id: "l01", rank: 1, name: "Grand Palace Hotel", initials: "GP", role: "Hotel", meals: 3420, donations: 148, points: 6840, badge: "Gold Rescuer" },
  { id: "l02", rank: 2, name: "Spice Garden Restaurant", initials: "SG", role: "Restaurant", meals: 2180, donations: 92, points: 4360, badge: "Silver Rescuer" },
  { id: "l03", rank: 3, name: "The Daily Loaf", initials: "DL", role: "Bakery", meals: 1950, donations: 210, points: 3900, badge: "Silver Rescuer" },
  { id: "l04", rank: 4, name: "TechPark Cafe", initials: "TC", role: "Cafe", meals: 1620, donations: 74, points: 3240, badge: "Bronze Rescuer" },
  { id: "l05", rank: 5, name: "Farmers Market Co-op", initials: "FM", role: "Grocery", meals: 1480, donations: 56, points: 2960, badge: "Bronze Rescuer" },
  { id: "l06", rank: 6, name: "Annapurna Canteen", initials: "AC", role: "Canteen", meals: 1240, donations: 82, points: 2480, badge: "Bronze Rescuer" },
  { id: "l07", rank: 7, name: "FreshMart Grocery", initials: "FG", role: "Grocery", meals: 980, donations: 41, points: 1960, badge: "Rising Star" },
  { id: "l08", rank: 8, name: "Hostel Mess IIIT-B", initials: "HI", role: "Hostel", meals: 860, donations: 22, points: 1720, badge: "Rising Star" },
  { id: "l09", rank: 9, name: "Sweet Crumbs Bakery", initials: "SC", role: "Bakery", meals: 720, donations: 88, points: 1440, badge: "Rising Star" },
  { id: "l10", rank: 10, name: "La Pizzeria", initials: "LP", role: "Restaurant", meals: 640, donations: 34, points: 1280, badge: "Rising Star" }
];

export const seedActivity = [
  { id: "a001", actor: "Spice Garden Restaurant", action: "donated",  foodName: "Veg Biryani (12 boxes)", meals: 24,  minutesAgo: 2 },
  { id: "a002", actor: "Akshaya Patra Foundation", action: "claimed", foodName: "Wedding Buffet Surplus", meals: 120, minutesAgo: 8 },
  { id: "a003", actor: "The Daily Loaf",           action: "donated", foodName: "Assorted Bakery Bread",  meals: 40,  minutesAgo: 15 },
  { id: "a004", actor: "Helping Hands NGO",        action: "delivered", foodName: "Pizza & Pasta",        meals: 35,  minutesAgo: 22 },
  { id: "a005", actor: "Community Kitchen Trust",  action: "donated", foodName: "Chapatis & Dry Sabzi",   meals: 55,  minutesAgo: 28 },
  { id: "a006", actor: "Robin Hood Army",          action: "claimed", foodName: "Sandwiches & Wraps",     meals: 45,  minutesAgo: 35 },
  { id: "a007", actor: "Shishu Bal Ashram",        action: "delivered", foodName: "Birthday Cake Slices", meals: 25,  minutesAgo: 47 },
  { id: "a008", actor: "Farmers Market Co-op",     action: "donated", foodName: "Fresh Fruit Baskets",    meals: 60,  minutesAgo: 55 },
  { id: "a009", actor: "Feeding India",            action: "claimed", foodName: "Milk & Yogurt",          meals: 30,  minutesAgo: 68 },
  { id: "a010", actor: "Annapurna Canteen",        action: "donated", foodName: "Vegetable Curry & Rice", meals: 80,  minutesAgo: 82 }
];
