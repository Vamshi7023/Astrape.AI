# MERN E‑commerce (Auth, Items with Filters, Cart)

A minimal MERN project implementing:
- Backend (Node/Express + MongoDB/Mongoose)
  - JWT Authentication (Signup/Login)
  - Items CRUD with filters (q, category/categories, price range, sorting, pagination)
  - Cart APIs (add, remove, decrement, clear)
  - Auto-seeding of a few products on first run
- Frontend (React + Vite)
  - Pages: Signup, Login, Items Listing with filters, Cart
  - Category dropdown + price range sliders
  - Cart persists on the server after logout


## Tech Stack
- Node.js 20+
- Express 4
- Mongoose 8 (MongoDB)
- JSON Web Tokens (jwt)
- React 18 + React Router 6
- Vite 5


## Project Structure
```
.
├─ server/
│  ├─ package.json
│  ├─ .env.example
│  └─ src/
│     └─ index.js              # Express API with Auth, Items, Cart, and seed
└─ client/
   ├─ package.json
   ├─ vite.config.js
   ├─ .env                     # VITE_API_BASE (created by you)
   └─ src/
      ├─ main.jsx
      ├─ App.jsx
      ├─ styles.css
      ├─ lib/api.js
      ├─ components/
      │  ├─ Navbar.jsx
      │  └─ Filters.jsx
      └─ pages/
         ├─ Login.jsx
         ├─ Signup.jsx
         ├─ Items.jsx
         └─ Cart.jsx
```


## Prerequisites
- Node.js 18+ (tested with Node v20.16.0)
- MongoDB running locally (service) or via Docker

Run MongoDB via Docker (from project root):
```
Docker (Windows CMD):
  docker run -d --name mongo -p 27017:27017 -v %cd%\mongo-data:/data/db mongo:7
```


## Backend Setup (server)
1) Copy environment example and edit if needed:
```
copy server\.env.example server\.env
```
- PORT=4000
- JWT_SECRET=your-long-random-secret
- MONGO_URI=mongodb://127.0.0.1:27017/mern_shop
- CLIENT_ORIGIN=http://localhost:5173

2) Install dependencies and start the API:
```
cd server
npm install
npm run dev
```
- Health check: http://localhost:4000/api/health
- On first run, a few sample items are auto-seeded if none exist.


## Frontend Setup (client)
1) Create client/.env (if missing):
```
VITE_API_BASE=http://localhost:4000
```

2) Install and run the dev server:
```
cd client
npm install
npm install react-router-dom
npm run dev
```
- Open: http://localhost:5173


## Using the App
1) Signup or Login.
2) Browse Items: use search, category dropdown, price range sliders, and sorting; click “Apply filters”.
3) Add to cart from the listing.
4) Open Cart to increment, decrement, remove items, or clear cart.
5) Logout and login again; cart persists (it is stored server-side).


## API Overview
Base URL: http://localhost:4000

Auth
- POST /api/auth/signup
  - body: { name, email, password }
  - returns: { token, user }
- POST /api/auth/login
  - body: { email, password }
  - returns: { token, user }
- GET /api/me (auth)
  - headers: Authorization: Bearer <token>

Items CRUD and Filters
- POST /api/items (auth) — create item
- GET /api/items — list with filters
  - query: q, category, categories, minPrice, maxPrice, sort(newest|price_asc|price_desc), page, limit
- GET /api/items/:id — get one
- PUT /api/items/:id (auth) — update
- DELETE /api/items/:id (auth) — delete

Cart
- GET /api/cart (auth) — returns { cart: [{ item, quantity, subtotal }], total }
- POST /api/cart/add (auth) — body: { itemId, quantity? }
- POST /api/cart/remove (auth) — body: { itemId, quantity? }, removes entire entry if quantity omitted
- DELETE /api/cart/clear (auth) — clears cart

## Data Model (simplified)
User
- name: String
- email: String (unique)
- passwordHash: String (bcrypt)
- cart: [ { item: ObjectId<Item>, quantity: Number } ]

Item
- name: String
- description: String
- price: Number
- category: String
- imageUrl: String
- stock: Number


## Notes on Persistence and Auth
- Cart data is stored in the User document; logging out only clears token in the browser.
- JWTs are stateless; the backend validates them using JWT_SECRET and does not store tokens server-side.


## Seeding
- On API start, if no items exist, a predefined set (electronics, home, clothing, books) is inserted.


## CORS
- Development CORS is permissive: `app.use(cors({ origin: true }))` which accepts Vite (http://localhost:5173) and file://.
- For production, restrict to known origins and set proper credentials policy as needed.


## Security & Production Considerations
- Always set a strong JWT_SECRET in production.
- Validate and sanitize inputs thoroughly.
- Lock down CORS to known origins.
- Add proper logging, rate limiting, and HTTPS.
- Store images in a CDN/object storage; current sample URLs are for demonstration.


## License
Unlicensed sample project for learning/demo purposes.
