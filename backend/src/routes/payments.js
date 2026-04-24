const express = require('express');
const Payment = require('../models/Payment');
const Influencer = require('../models/Influencer');
const Sale = require('../models/Sale');
const auth = require('../middleware/auth');
const { createObjectCsvWriter } = require('csv-writer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const Razorpay = require('razorpay');

const router = express.Router();

const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

// Get payments
router.get('/', auth(['admin', 'influencer', 'finance']), async (req, res) => {
  try {
    const match = {};
    if (req.user.role === 'influencer') {
      const inf = await Influencer.findOne({ user_id: req.user.id });
      if (inf) match.influencer_id = inf._id;
    }
    if (req.query.brand_id) match.brand_id = req.query.brand_id;

    const payments = await Payment.find(match)
      .populate({ path: 'influencer_id', populate: { path: 'user_id', select: 'name email' } })
      .populate('brand_id', 'name')
      .sort({ createdAt: -1 }).lean();

    res.json(payments.map(p => ({
      ...p,
      influencer_name: p.influencer_id?.user_id?.name,
      referral_code: p.influencer_id?.referral_code,
      brand_name: p.brand_id?.name
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate payment batch
router.post('/generate', auth(['admin']), async (req, res) => {
  const { period_start, period_end, brand_id } = req.body;
  try {
    const matchSales = { date: { $gte: new Date(period_start), $lte: new Date(period_end) } };
    if (brand_id) matchSales.brand_id = brand_id;

    const commissions = await Sale.aggregate([
      { $match: matchSales },
      { $group: { _id: '$influencer_id', total: { $sum: '$commission_amount' } } }
    ]);

    const inserted = await Promise.all(commissions.map(c =>
      Payment.create({ influencer_id: c._id, brand_id, amount: c.total, period_start, period_end })
    ));

    const io = req.app.get('io');
    io.to('admins').emit('payments_generated', { count: inserted.length, period_start, period_end });

    res.json(inserted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update payment status + emit event
router.patch('/:id/status', auth(['admin', 'finance']), async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'paid') update.paid_at = new Date();
    const payment = await Payment.findByIdAndUpdate(req.params.id, update, { new: true });

    const io = req.app.get('io');
    io.to('admins').emit('payment_updated', { id: req.params.id, status: req.body.status });

    res.json(payment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── RAZORPAY: Create payout order ──
router.post('/:id/razorpay', auth(['admin', 'finance']), async (req, res) => {
  if (!razorpay) return res.status(400).json({ error: 'Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env' });
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'influencer_id', populate: { path: 'user_id', select: 'name email' } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const order = await razorpay.orders.create({
      amount: Math.round(payment.amount * 100), // paise
      currency: 'INR',
      receipt: `pay_${payment._id}`,
      notes: {
        influencer: payment.influencer_id?.user_id?.name,
        payment_id: payment._id.toString()
      }
    });

    res.json({ order, key: process.env.RAZORPAY_KEY_ID, payment });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── RAZORPAY: Verify payment ──
router.post('/:id/razorpay/verify', auth(['admin', 'finance']), async (req, res) => {
  const crypto = require('crypto');
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

  if (expected !== razorpay_signature) return res.status(400).json({ error: 'Invalid signature' });

  const payment = await Payment.findByIdAndUpdate(req.params.id, { status: 'paid', paid_at: new Date(), razorpay_payment_id }, { new: true });
  const io = req.app.get('io');
  io.to('admins').emit('payment_updated', { id: req.params.id, status: 'paid' });
  res.json(payment);
});

// ── EXPORT CSV ──
router.get('/export/csv', auth(['admin', 'finance']), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({ path: 'influencer_id', populate: { path: 'user_id', select: 'name email' } })
      .populate('brand_id', 'name').lean();

    const records = payments.map(p => ({
      name: p.influencer_id?.user_id?.name, email: p.influencer_id?.user_id?.email,
      referral_code: p.influencer_id?.referral_code, brand: p.brand_id?.name || 'Default',
      amount: p.amount, status: p.status,
      period_start: p.period_start?.toISOString().slice(0, 10),
      period_end: p.period_end?.toISOString().slice(0, 10),
      paid_at: p.paid_at?.toISOString() || ''
    }));

    const filePath = path.join(__dirname, '../../tmp_export.csv');
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Influencer' }, { id: 'email', title: 'Email' },
        { id: 'referral_code', title: 'Code' }, { id: 'brand', title: 'Brand' },
        { id: 'amount', title: 'Amount' }, { id: 'status', title: 'Status' },
        { id: 'period_start', title: 'Period Start' }, { id: 'period_end', title: 'Period End' },
        { id: 'paid_at', title: 'Paid At' }
      ]
    });
    await csvWriter.writeRecords(records);
    res.download(filePath, 'payments_export.csv', () => fs.unlinkSync(filePath));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── EXPORT EXCEL ──
router.get('/export/excel', auth(['admin', 'finance']), async (req, res) => {
  try {
    const [payments, sales] = await Promise.all([
      Payment.find()
        .populate({ path: 'influencer_id', populate: { path: 'user_id', select: 'name email' } })
        .populate('brand_id', 'name').lean(),
      Sale.find()
        .populate({ path: 'influencer_id', populate: { path: 'user_id', select: 'name' } })
        .populate('brand_id', 'name').lean()
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'TrackInfluencer';

    // ── Payments sheet ──
    const ws1 = wb.addWorksheet('Payments');
    ws1.columns = [
      { header: 'Influencer', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Code', key: 'code', width: 14 },
      { header: 'Brand', key: 'brand', width: 16 },
      { header: 'Amount (₹)', key: 'amount', width: 14 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Period Start', key: 'period_start', width: 14 },
      { header: 'Period End', key: 'period_end', width: 14 },
      { header: 'Paid At', key: 'paid_at', width: 20 },
    ];
    ws1.getRow(1).font = { bold: true };
    ws1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111111' } };
    ws1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    payments.forEach(p => {
      const row = ws1.addRow({
        name: p.influencer_id?.user_id?.name, email: p.influencer_id?.user_id?.email,
        code: p.influencer_id?.referral_code, brand: p.brand_id?.name || 'Default',
        amount: p.amount, status: p.status,
        period_start: p.period_start?.toISOString().slice(0, 10),
        period_end: p.period_end?.toISOString().slice(0, 10),
        paid_at: p.paid_at?.toISOString() || ''
      });
      const statusCell = row.getCell('status');
      if (p.status === 'paid') statusCell.font = { color: { argb: 'FF16a34a' } };
      else if (p.status === 'approved') statusCell.font = { color: { argb: 'FF2563eb' } };
      else statusCell.font = { color: { argb: 'FFb45309' } };
    });

    // ── Sales sheet ──
    const ws2 = wb.addWorksheet('Sales');
    ws2.columns = [
      { header: 'Influencer', key: 'name', width: 20 },
      { header: 'Brand', key: 'brand', width: 16 },
      { header: 'Product', key: 'product', width: 22 },
      { header: 'Amount (₹)', key: 'amount', width: 14 },
      { header: 'Commission (₹)', key: 'commission', width: 16 },
      { header: 'Date', key: 'date', width: 18 },
    ];
    ws2.getRow(1).font = { bold: true };
    ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111111' } };
    ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    sales.forEach(s => ws2.addRow({
      name: s.influencer_id?.user_id?.name, brand: s.brand_id?.name || 'Default',
      product: s.product_name, amount: s.amount, commission: s.commission_amount,
      date: new Date(s.date).toLocaleDateString('en-IN')
    }));

    // ── Summary sheet ──
    const ws3 = wb.addWorksheet('Summary');
    const totalRevenue = sales.reduce((s, x) => s + x.amount, 0);
    const totalCommission = sales.reduce((s, x) => s + x.commission_amount, 0);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    ws3.addRow(['Metric', 'Value']);
    ws3.getRow(1).font = { bold: true };
    ws3.addRow(['Total Revenue (₹)', totalRevenue.toFixed(2)]);
    ws3.addRow(['Total Commission (₹)', totalCommission.toFixed(2)]);
    ws3.addRow(['Total Paid Out (₹)', totalPaid.toFixed(2)]);
    ws3.addRow(['Total Sales', sales.length]);
    ws3.addRow(['Total Payments', payments.length]);
    ws3.columns = [{ width: 24 }, { width: 18 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=trackinfluencer_report.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
