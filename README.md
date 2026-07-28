# FoodCycle Backend

Node.js + Express + MongoDB (Mongoose) API for the FoodCycle food-rescue app,
with Socket.io for the real-time activity feed. Built to match the features
in `foodcycle.html`: donation posting, claiming, nearby search, NGO listing,
leaderboard tabs, live feed, and hero stats.

## 1. Setup

```bash
cd foodcycle-backend
npm install
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET
```

You need a MongoDB instance — either local (`mongod`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster. Paste its connection
string into `.env` as `MONGO_URI`.

```bash
npm run seed     # optional: creates a demo donor, volunteer, NGO, listing
npm run dev       # starts on http://localhost:5000 with nodemon
# or: npm start
```

Health check: `GET http://localhost:5000/api/health`

## 2. Project structure

```
foodcycle-backend/
├── server.js              # Express + Socket.io entry point
├── config/db.js           # Mongo connection
├── models/                # User, FoodListing, Ngo, Activity
├── controllers/           # Route handlers / business logic
├── routes/                # Express routers
├── middleware/auth.js      # JWT protect() / authorize()
├── middleware/errorHandler.js
└── utils/
    ├── generateToken.js
    ├── activityFeed.js     # writes Activity + emits socket event
    └── seed.js             # demo data
```

## 3. Auth

JWT bearer tokens. Register/login return a `token`; send it as
`Authorization: Bearer <token>` on protected routes.

| Method | Route              | Access  | Purpose                        |
|--------|--------------------|---------|---------------------------------|
| POST   | /api/auth/register | Public  | Create account                 |
| POST   | /api/auth/login    | Public  | Log in                         |
| GET    | /api/auth/me        | Private | Current user (top bar avatar)  |

## 4. Food listings (the food cards + donation sheet)

| Method | Route                  | Access  | Purpose |
|--------|------------------------|---------|---------|
| GET    | /api/food              | Public  | List/search. Query params: `query`, `category`, `lat`, `lng`, `radiusKm`, `status` |
| GET    | /api/food/:id          | Public  | Single listing |
| POST   | /api/food              | Private | Post a donation (the FAB / bottom sheet) |
| POST   | /api/food/:id/claim    | Private | "Claim" button on a food card |
| PATCH  | /api/food/:id/status   | Private | Mark `completed` or `cancelled` |

`POST /api/food` body:
```json
{
  "name": "Veg Biryani (12 boxes)",
  "category": "cooked-meals",
  "servings": 12,
  "description": "Packed at 6pm",
  "lat": 22.7196,
  "lng": 75.8577,
  "address": "MG Road, Indore",
  "expiresInMinutes": 180
}
```
`category` is one of `bakery | produce | cooked-meals | dairy | grains | other`
— maps directly onto the `.cat-chip` filters in the UI. `expiresInMinutes` is
what drives the `data-timer` countdown on each food card.

## 5. Live activity feed

`GET /api/activity?limit=5` returns recent events for the initial render.
For live updates (replacing the frontend's `setInterval` simulation), connect
via Socket.io on the client and listen for `activity:new`:

```js
const socket = io('http://localhost:5000');
socket.on('activity:new', (activity) => {
  // prepend to #feedList, same shape as pushFeedItem() in the HTML
});
```

Every donation, claim, or delivery automatically writes an `Activity` doc and
emits this event server-side — no extra wiring needed per action.

## 6. Leaderboard

`GET /api/leaderboard?range=week|month|all&limit=10` — matches the `.lb-tab`
tabs in the UI. `week`/`month` are computed from the `Activity` log;
`all` uses the rolled-up `User.stats.mealsDonated`.

## 7. Hero stats / rescue ring

`GET /api/stats/overview?goal=1000` returns `mealsRescuedToday`, `goal`,
`progressPct` (drives `ring-progress` stroke-dashoffset), `activeListings`,
and `totalMealsRescued` — feeds the ring, the count-up numbers, and the
hero-stat carousel.

## 8. NGOs

| Method | Route     | Access  | Purpose |
|--------|-----------|---------|---------|
| GET    | /api/ngos | Public  | List, optionally `?lat=&lng=&radiusKm=` |
| POST   | /api/ngos | Private | Register an NGO |

## 9. Wiring this to `foodcycle.html`

The current HTML is a static prototype with hardcoded data and
`setInterval`-based fakes. To connect it:

1. Replace the hardcoded food cards with a `fetch('/api/food')` on load,
   rendering `.food-card` markup per item.
2. Point `claim-btn` click handlers at `POST /api/food/:id/claim`.
3. Point the donation sheet's submit button at `POST /api/food` using the
   chip-select category and text-field values.
4. Replace the `setInterval` feed simulation with the Socket.io listener
   above.
5. Replace the hardcoded `812` / `78%` ring values with a call to
   `GET /api/stats/overview`.
6. Wire the `.lb-tab` click handlers to re-fetch
   `GET /api/leaderboard?range=...`.

## 10. Notes / next steps

- Add rate limiting (`express-rate-limit`) before production use.
- Add input validation with `express-validator` on the write routes.
- Consider image upload (e.g. S3/Cloudinary) for real food photos —
  currently the UI uses icon placeholders, so no image field was added.
- Add a cron/worker to auto-flip listings to `expired` once `expiresAt`
  passes, and to trim the `Activity` collection over time.
