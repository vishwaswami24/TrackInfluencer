const express = require('express');
const Sale = require('../models/Sale');
const Influencer = require('../models/Influencer');
const Click = require('../models/Click');
const auth = require('../middleware/auth');

const router = express.Router();

// Record a sale — emits real-time event
router.post('/', auth(['admin']), async (req, res) => {
  const { referral_code, amount, product_name, customer_email, brand_id } = req.body;
  try {
    const inf = await Influencer.findOne({ referral_code });
    if (!inf) return res.status(404).json({ error: 'Influencer not found' });

    const commission_amount = (amount * inf.commission_rate) / 100;
    const sale = await Sale.create({
      influencer_id: inf._id,
      brand_id: brand_id || inf.brand_id,
      amount, product_name, customer_email, commission_amount
    });

    await Click.findOneAndUpdate(
      { influencer_id: inf._id, converted: false },
      { converted: true },
      { sort: { clicked_at: -1 } }
    );

    // Emit real-time update to all admins and the brand room
    const io = req.app.get('io');
    const payload = { sale, influencer_name: inf.referral_code, commission_amount };
    io.to('admins').emit('new_sale', payload);
    if (brand_id) io.to(`brand_${brand_id}`).emit('new_sale', payload);

    res.json(sale);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get sales
router.get('/', auth(['admin', 'influencer', 'finance']), async (req, res) => {
  try {
    const { from, to, brand_id } = req.query;
    const match = {};

    if (req.user.role === 'influencer') {
      const inf = await Influencer.findOne({ user_id: req.user.id });
      if (!inf) return res.json([]);
      match.influencer_id = inf._id;
    }
    if (brand_id) match.brand_id = brand_id;
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const sales = await Sale.find(match)
      .populate({ path: 'influencer_id', populate: { path: 'user_id', select: 'name' } })
      .populate('brand_id', 'name')
      .sort({ date: -1 })
      .lean();

    res.json(sales.map(s => ({
      ...s,
      referral_code: s.influencer_id?.referral_code,
      influencer_name: s.influencer_id?.user_id?.name,
      brand_name: s.brand_id?.name
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Sales over time
router.get('/over-time', auth(['admin', 'influencer', 'finance']), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const match = { date: { $gte: since } };

    if (req.user.role === 'influencer') {
      const inf = await Influencer.findOne({ user_id: req.user.id });
      if (inf) match.influencer_id = inf._id;
    }
    if (req.query.brand_id) match.brand_id = req.query.brand_id;

    const data = await Sale.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        revenue: { $sum: '$amount' }, sales_count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', revenue: 1, sales_count: 1 } }
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
