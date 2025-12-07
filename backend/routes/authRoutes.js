// routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Family from '../models/Family.js';

const router = express.Router();

// Register (creates family and admin user)
router.post('/register', async (req, res) => {
  const { name, email, password, familyName } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    const family = await Family.create({ name: familyName });
    const user = await User.create({ name, email, password: hashed, role: 'admin', familyId: family._id, permissions: {
      viewExpenses: true, addExpenses: true, editExpenses: true, deleteExpenses: true, viewSavings: true, addSavings: true, viewBills: true, viewDebts: true, viewAnalytics: true
    }});

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid creds' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid creds' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
