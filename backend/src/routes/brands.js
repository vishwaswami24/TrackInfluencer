const express = require('express');
const Brand = require('../models/Brand');
const auth = require('../middleware/auth');

const router = express.Router();

// List brands for current admin
router.get('/', auth(['admin']), async (req, res) => {
  const brands = await Brand.find({ owner_id: req.user.id });
  res.json(brands);
});

// Create brand
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
    const brand = await Brand.create({ name, slug, owner_id: req.user.id });
    res.json(brand);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete brand
router.delete('/:id', auth(['admin']), async (req, res) => {
  await Brand.findOneAndDelete({ _id: req.params.id, owner_id: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
