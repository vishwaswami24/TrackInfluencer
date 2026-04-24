const express = require('express');
const Influencer = require('../models/Influencer');
const Sale = require('../models/Sale');
const Click = require('../models/Click');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all influencers with aggregated stats (admin/finance)
router.get('/', auth(['admin', 'finance']), async (req, res) => {
  try {
    const influencers = await Influencer.find().populate('user_id', 'name email').lean();
    const result = await Promise.all(influencers.map(async inf => {
      const sales = await Sale.aggregate([
        { $match: { influencer_id: inf._id } },
        { $group: { _id: null, total_revenue: { $sum: '$amount' }, total_commission: { $sum: '$commission_amount' }, total_sales: { $sum: 1 } } }
      ]);
      const s = sales[0] || { total_revenue: 0, total_commission: 0, total_sales: 0 };
      return { ...inf, name: inf.user_id?.name, email: inf.user_id?.email, ...s };
    }));
    result.sort((a, b) => b.total_revenue - a.total_revenue);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Own profile (influencer)
router.get('/me', auth(['influencer']), async (req, res) => {
  try {
    const inf = await Influencer.findOne({ user_id: req.user.id }).populate('user_id', 'name email').lean();
    if (!inf) return res.status(404).json({ error: 'Influencer not found' });
    const sales = await Sale.aggregate([
      { $match: { influencer_id: inf._id } },
      { $group: { _id: null, total_revenue: { $sum: '$amount' }, total_commission: { $sum: '$commission_amount' }, total_sales: { $sum: 1 } } }
    ]);
    const s = sales[0] || { total_revenue: 0, total_commission: 0, total_sales: 0 };
    res.json({ ...inf, name: inf.user_id?.name, email: inf.user_id?.email, ...s });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Track affiliate click
router.get('/track/:code', async (req, res) => {
  const { code } = req.params;
  const { redirect } = req.query;
  try {
    const inf = await Influencer.findOne({ referral_code: code });
    if (!inf) return res.status(404).json({ error: 'Invalid referral code' });

    const ip = req.ip;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await Click.countDocuments({ influencer_id: inf._id, ip_address: ip, clicked_at: { $gte: oneHourAgo } });

    if (recentCount < 10) {
      await Click.create({ influencer_id: inf._id, ip_address: ip, user_agent: req.headers['user-agent'] });
      await Influencer.findByIdAndUpdate(inf._id, { $inc: { total_clicks: 1 } });
    }

    if (redirect) return res.redirect(redirect);
    res.json({ tracked: true, code });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update commission rate (admin)
router.patch('/:id/commission', auth(['admin']), async (req, res) => {
  try {
    const inf = await Influencer.findByIdAndUpdate(req.params.id, { commission_rate: req.body.rate }, { new: true });
    res.json(inf);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
