const express = require('express');
const Sale = require('../models/Sale');
const Influencer = require('../models/Influencer');
const Click = require('../models/Click');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Admin overview
router.get('/overview', auth(['admin', 'finance']), async (req, res) => {
  try {
    const [summary, topInfluencers, totalClicks, totalConversions, revenueByInfluencer] = await Promise.all([
      Sale.aggregate([{ $group: { _id: null, total_revenue: { $sum: '$amount' }, total_commission: { $sum: '$commission_amount' }, total_sales: { $sum: 1 } } }]),
      Influencer.aggregate([
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
        { $lookup: { from: 'sales', localField: '_id', foreignField: 'influencer_id', as: 'sales' } },
        { $project: {
          name: { $arrayElemAt: ['$user.name', 0] },
          referral_code: 1, total_clicks: 1,
          revenue: { $sum: '$sales.amount' },
          sales_count: { $size: '$sales' },
          conversion_rate: {
            $cond: [{ $gt: ['$total_clicks', 0] },
              { $round: [{ $multiply: [{ $divide: [{ $size: '$sales' }, '$total_clicks'] }, 100] }, 2] }, 0]
          }
        }},
        { $sort: { revenue: -1 } }, { $limit: 10 }
      ]),
      Click.countDocuments(),
      Click.countDocuments({ converted: true }),
      Influencer.aggregate([
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
        { $lookup: { from: 'sales', localField: '_id', foreignField: 'influencer_id', as: 'sales' } },
        { $project: { name: { $arrayElemAt: ['$user.name', 0] }, revenue: { $sum: '$sales.amount' } } },
        { $sort: { revenue: -1 } }, { $limit: 6 }
      ])
    ]);

    res.json({
      summary: summary[0] || { total_revenue: 0, total_commission: 0, total_sales: 0 },
      topInfluencers,
      conversion: { total_clicks: totalClicks, total_conversions: totalConversions },
      revenueByInfluencer
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fraud detection
router.get('/fraud', auth(['admin']), async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fraud = await Click.aggregate([
      { $match: { clicked_at: { $gte: since } } },
      { $group: { _id: { influencer_id: '$influencer_id', ip_address: '$ip_address' }, click_count: { $sum: 1 }, first_click: { $min: '$clicked_at' }, last_click: { $max: '$clicked_at' } } },
      { $match: { click_count: { $gt: 5 } } },
      { $lookup: { from: 'influencers', localField: '_id.influencer_id', foreignField: '_id', as: 'influencer' } },
      { $lookup: { from: 'users', localField: 'influencer.user_id', foreignField: '_id', as: 'user' } },
      { $project: {
        ip_address: '$_id.ip_address', click_count: 1, first_click: 1, last_click: 1,
        referral_code: { $arrayElemAt: ['$influencer.referral_code', 0] },
        name: { $arrayElemAt: ['$user.name', 0] }
      }},
      { $sort: { click_count: -1 } }
    ]);
    res.json(fraud);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI insights proxy
router.get('/ai-insights', auth(['admin', 'finance']), async (req, res) => {
  try {
    const since60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const [salesData, influencerData] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: since60 } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, revenue: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, day: '$_id', revenue: 1 } }
      ]),
      Influencer.aggregate([
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
        { $lookup: { from: 'sales', localField: '_id', foreignField: 'influencer_id', as: 'sales' } },
        { $project: {
          name: { $arrayElemAt: ['$user.name', 0] },
          referral_code: 1, total_clicks: 1,
          revenue: { $sum: '$sales.amount' },
          sales_count: { $size: '$sales' },
          day_of_week: { $avg: { $map: { input: '$sales', as: 's', in: { $dayOfWeek: '$$s.date' } } } }
        }}
      ])
    ]);

    const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/insights`, {
      sales_history: salesData,
      influencer_data: influencerData
    }, { timeout: 10000 });
    res.json(aiRes.data);
  } catch (err) { res.status(500).json({ error: 'AI service unavailable', details: err.message }); }
});

// Sales prediction proxy
router.get('/predict', auth(['admin', 'finance']), async (req, res) => {
  const { days = 7 } = req.query;
  try {
    const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const salesData = await Sale.aggregate([
      { $match: { date: { $gte: since90 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', revenue: 1 } }
    ]);

    const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, {
      sales_history: salesData,
      forecast_days: parseInt(days)
    }, { timeout: 10000 });
    res.json(aiRes.data);
  } catch (err) { res.status(500).json({ error: 'AI service unavailable', details: err.message }); }
});

module.exports = router;
