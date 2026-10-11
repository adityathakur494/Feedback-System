// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/reviewDB')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('Database connection error:', err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Review Schema & Model
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ownerReply: { comment: String, repliedAt: Date }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

// Authentication Middleware
const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, 'supersecretkey123');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

// --- AUTH ROUTES ---

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id, role: user.role }, 'supersecretkey123', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'supersecretkey123', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- REVIEW ROUTES ---

// Get All Reviews with Average Rating
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name').sort({ createdAt: -1 });
    const total = reviews.length;
    const avgRating = total > 0 
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) 
      : 0;

    res.json({ reviews, avgRating, totalReviews: total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a New Review (Protected)
app.post('/api/reviews', protect, async (req, res) => {
  const { rating, title, comment } = req.body;
  try {
    const review = new Review({
      user: req.user.id,
      rating,
      title,
      comment
    });
    await review.save();
    const populatedReview = await review.populate('user', 'name');
    res.status(201).json(populatedReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Review (Protected)
app.delete('/api/reviews/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));