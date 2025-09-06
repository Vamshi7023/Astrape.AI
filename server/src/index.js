import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_shop';

app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));

// Mongo models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  cart: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
      quantity: { type: Number, required: true, min: 1, default: 1 },
    },
  ],
}, { timestamps: true });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0, index: true },
  category: { type: String, index: true },
  imageUrl: { type: String },
  stock: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);

// Seed a few default items if database is empty
async function seedItems() {
  try {
    const count = await Item.countDocuments();
    if (count > 0) return; // already have items
    const items = [
      {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling Bluetooth over-ear headphones',
        price: 99.99,
        category: 'electronics',
        imageUrl: 'https://as2.ftcdn.net/jpg/13/51/79/99/1000_F_1351799931_l5t4oPt30SQg9gYi4q3xfoWNCXqHA0b2.webp',
        stock: 25,
      },
      {
        name: 'Smartwatch Series 5',
        description: 'Fitness tracking, heart-rate monitor, notifications',
        price: 149.0,
        category: 'electronics',
        imageUrl: 'https://t3.ftcdn.net/jpg/00/85/51/56/240_F_85515668_dbMmOjChn3nNgpl8vKlQ7IXtHgboiuPB.jpg',
        stock: 30,
      },
      {
        name: 'Modern Desk Lamp',
        description: 'LED lamp with adjustable arm and brightness',
        price: 39.5,
        category: 'home',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShF5orblI4whGp8wB_BMSAJMH-IqQK40R9lA&s',
        stock: 40,
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Premium cotton tee, classic fit',
        price: 19.99,
        category: 'clothing',
        imageUrl: 'https://t3.ftcdn.net/jpg/03/37/48/98/240_F_337489890_imUZsO8hprZyr5VryTUuCg3O4WkQpN7O.jpg',
        stock: 100,
      },
      {
        name: 'Cooking Essentials Cookbook',
        description: '100+ recipes for everyday cooking',
        price: 24.99,
        category: 'books',
        imageUrl: 'https://t4.ftcdn.net/jpg/00/38/29/53/240_F_38295340_lelB8VrDWCp3RUJFShsIWdraJ8puvyHW.jpg',
        stock: 60,
      },
      {
        name: 'Ergonomic Mouse',
        description: 'Wireless ergonomic mouse with programmable buttons',
        price: 29.99,
        category: 'electronics',
        imageUrl: 'https://t3.ftcdn.net/jpg/13/65/92/16/240_F_1365921690_C5aawx8PxkvAFoHN2VaajtVWbINCPqxl.jpg',
        stock: 50,
      },
    ];
    await Item.insertMany(items);
    console.log(`Seeded ${items.length} items`);
  } catch (err) {
    console.error('Failed to seed items:', err);
  }
}

// Auth utilities
function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Invalid Authorization header' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, cart: [] });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('_id name email');
  res.json({ user });
});

// Items CRUD with filters
// Create item
app.post('/api/items', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;
    if (!name || price == null) return res.status(400).json({ message: 'Name and price are required' });
    const item = await Item.create({ name, description, price, category, imageUrl, stock });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Read list with filters
app.get('/api/items', async (req, res) => {
  try {
    const { q, category, categories, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (q) {
      filter.name = { $regex: new RegExp(q, 'i') };
    }

    const cats = categories ? String(categories).split(',') : category ? [category] : [];
    if (cats.length) {
      filter.category = { $in: cats };
    }

    const priceFilter = {};
    if (minPrice != null) priceFilter.$gte = Number(minPrice);
    if (maxPrice != null) priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length) filter.price = priceFilter;

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Number(limit) || 12, 100);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Item.countDocuments(filter),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Read one
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Invalid id' });
  }
});

// Update
app.put('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const update = req.body;
    const item = await Item.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Invalid id or payload' });
  }
});

// Delete
app.delete('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Invalid id' });
  }
});

// Cart APIs
app.get('/api/cart', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.item');
  const validCart = (user?.cart || []).filter((c) => c.item);
  const cart = validCart.map((c) => ({
    item: c.item,
    quantity: c.quantity,
    subtotal: c.item.price * c.quantity,
  }));
  const total = cart.reduce((sum, c) => sum + c.subtotal, 0);
  // Clean up any invalid (orphaned) references in DB
  if (user && validCart.length !== (user.cart || []).length) {
    user.cart = validCart;
    await user.save();
  }
  res.json({ cart, total });
});

app.post('/api/cart/add', authMiddleware, async (req, res) => {
  const { itemId, quantity = 1 } = req.body;
  if (!itemId) return res.status(400).json({ message: 'itemId is required' });
  const qty = Math.max(1, Number(quantity));
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const existing = user.cart.find((c) => c.item.toString() === itemId);
  if (existing) existing.quantity += qty;
  else user.cart.push({ item: itemId, quantity: qty });
  await user.save();

  const populated = await user.populate('cart.item');
  const cart = populated.cart
    .filter((c) => c.item)
    .map((c) => ({ item: c.item, quantity: c.quantity, subtotal: c.item.price * c.quantity }));
  const total = cart.reduce((sum, c) => sum + c.subtotal, 0);
  res.json({ cart, total });
});

app.post('/api/cart/remove', authMiddleware, async (req, res) => {
  const { itemId, quantity } = req.body;
  if (!itemId) return res.status(400).json({ message: 'itemId is required' });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const idx = user.cart.findIndex((c) => c.item.toString() === itemId);
  if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });

  if (quantity == null) {
    // remove entirely
    user.cart.splice(idx, 1);
  } else {
    const qty = Math.max(1, Number(quantity));
    user.cart[idx].quantity -= qty;
    if (user.cart[idx].quantity <= 0) user.cart.splice(idx, 1);
  }
  await user.save();

  const populated = await user.populate('cart.item');
  const cart = populated.cart
    .filter((c) => c.item)
    .map((c) => ({ item: c.item, quantity: c.quantity, subtotal: c.item.price * c.quantity }));
  const total = cart.reduce((sum, c) => sum + c.subtotal, 0);
  res.json({ cart, total });
});

app.delete('/api/cart/clear', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.cart = [];
  await user.save();
  res.json({ cart: [], total: 0 });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: new URL(MONGO_URI).pathname.replace('/', '') || 'mern_shop' });
    await seedItems();
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
