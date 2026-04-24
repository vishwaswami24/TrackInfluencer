const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Influencer = require('../models/Influencer');

const router = express.Router();

// Public endpoint — tells frontend if an admin already exists
router.get('/admin-exists', async (req, res) => {
  const exists = await User.exists({ role: 'admin' });
  res.json({ exists: !!exists });
});

router.post('/register', async (req, res) => {
  const { email, password, name, role = 'influencer' } = req.body;
  try {
    // Block a second admin from being created
    if (role === 'admin') {
      const adminExists = await User.exists({ role: 'admin' });
      if (adminExists) return res.status(400).json({ error: 'An admin account already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name, role });

    if (role === 'influencer') {
      const code = `${name.toUpperCase().replace(/\s+/g, '')}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await Influencer.create({ user_id: user._id, referral_code: code });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
