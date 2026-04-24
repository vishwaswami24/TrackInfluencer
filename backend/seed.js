require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Influencer = require('./src/models/Influencer');
const Sale = require('./src/models/Sale');
const Payment = require('./src/models/Payment');
const Click = require('./src/models/Click');

const influencerProfiles = [
  { name: 'Priya Sharma',    code: 'PRIYASH',  rate: 12 },
  { name: 'Rahul Verma',     code: 'RAHULV',   rate: 10 },
  { name: 'Ananya Singh',    code: 'ANANYASI', rate: 15 },
  { name: 'Karan Mehta',     code: 'KARANM',   rate: 8  },
  { name: 'Sneha Patel',     code: 'SNEHAP',   rate: 11 },
  { name: 'Arjun Nair',      code: 'ARJUNN',   rate: 13 },
  { name: 'Divya Reddy',     code: 'DIVYAR',   rate: 9  },
  { name: 'Vikram Joshi',    code: 'VIKRAMJ',  rate: 14 },
];

const products = [
  'Wireless Earbuds', 'Yoga Mat', 'Protein Powder', 'Skincare Kit',
  'Running Shoes', 'Smart Watch', 'Laptop Stand', 'Water Bottle',
  'Face Serum', 'Resistance Bands', 'Bluetooth Speaker', 'Hair Dryer',
];

const ips = ['103.21.4.1','182.64.12.5','49.36.8.22','117.55.3.9','203.88.7.14','45.112.6.3','106.51.2.8','157.32.9.17'];

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));
const pick = arr => arr[randInt(0, arr.length)];
const daysAgo = d => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Influencer.deleteMany({}), Sale.deleteMany({}), Payment.deleteMany({}), Click.deleteMany({})]);
  console.log('Cleared existing data');

  const hash = await bcrypt.hash('admin123', 10);

  // Create admin + finance users
  const admin = await User.create({ email: 'admin@influtrack.com', password: hash, name: 'Admin User', role: 'admin' });
  await User.create({ email: 'finance@influtrack.com', password: await bcrypt.hash('finance123', 10), name: 'Finance Team', role: 'finance' });
  console.log('Created admin & finance users');

  // Create influencer users + influencer docs
  const influencers = [];
  for (const p of influencerProfiles) {
    const user = await User.create({
      email: `${p.code.toLowerCase()}@influtrack.com`,
      password: await bcrypt.hash('pass123', 10),
      name: p.name,
      role: 'influencer'
    });
    const inf = await Influencer.create({ user_id: user._id, referral_code: p.code, commission_rate: p.rate, total_clicks: 0 });
    influencers.push(inf);
  }
  console.log(`Created ${influencers.length} influencers`);

  // Generate clicks (150 per influencer spread over 90 days)
  const clickDocs = [];
  for (const inf of influencers) {
    const count = randInt(120, 200);
    for (let i = 0; i < count; i++) {
      clickDocs.push({
        influencer_id: inf._id,
        ip_address: pick(ips),
        user_agent: 'Mozilla/5.0 (seed)',
        converted: false,
        clicked_at: daysAgo(randInt(0, 90))
      });
    }
  }
  await Click.insertMany(clickDocs);
  // Update total_clicks on each influencer
  for (const inf of influencers) {
    const count = await Click.countDocuments({ influencer_id: inf._id });
    await Influencer.findByIdAndUpdate(inf._id, { total_clicks: count });
  }
  console.log(`Created ${clickDocs.length} clicks`);

  // Generate sales (15–25 per influencer spread over 90 days)
  const saleDocs = [];
  for (const inf of influencers) {
    const infDoc = await Influencer.findById(inf._id);
    const count = randInt(15, 26);
    for (let i = 0; i < count; i++) {
      const amount = parseFloat(rand(299, 4999).toFixed(2));
      const commission_amount = parseFloat((amount * infDoc.commission_rate / 100).toFixed(2));
      saleDocs.push({
        influencer_id: inf._id,
        amount,
        product_name: pick(products),
        customer_email: `customer${randInt(1, 999)}@example.com`,
        commission_amount,
        date: daysAgo(randInt(0, 90))
      });
    }
  }
  await Sale.insertMany(saleDocs);
  console.log(`Created ${saleDocs.length} sales`);

  // Mark some clicks as converted
  for (const inf of influencers) {
    const sales = await Sale.find({ influencer_id: inf._id });
    for (const sale of sales) {
      await Click.findOneAndUpdate(
        { influencer_id: inf._id, converted: false, clicked_at: { $lte: sale.date } },
        { converted: true },
        { sort: { clicked_at: -1 } }
      );
    }
  }

  // Generate payments — 3 monthly batches
  const batches = [
    { start: daysAgo(90), end: daysAgo(61), statuses: ['paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid'] },
    { start: daysAgo(60), end: daysAgo(31), statuses: ['paid', 'paid', 'paid', 'approved', 'approved', 'paid', 'approved', 'paid'] },
    { start: daysAgo(30), end: daysAgo(1),  statuses: ['pending', 'pending', 'approved', 'pending', 'pending', 'approved', 'pending', 'pending'] },
  ];

  for (const batch of batches) {
    for (let i = 0; i < influencers.length; i++) {
      const inf = influencers[i];
      const sales = await Sale.find({ influencer_id: inf._id, date: { $gte: batch.start, $lte: batch.end } });
      if (!sales.length) continue;
      const amount = parseFloat(sales.reduce((s, x) => s + x.commission_amount, 0).toFixed(2));
      const status = batch.statuses[i];
      await Payment.create({
        influencer_id: inf._id,
        amount,
        status,
        period_start: batch.start,
        period_end: batch.end,
        paid_at: status === 'paid' ? new Date(batch.end.getTime() + 3 * 24 * 60 * 60 * 1000) : undefined
      });
    }
  }
  console.log('Created payment batches');

  // Summary
  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Admin login:   admin@influtrack.com   / admin123');
  console.log('Finance login: finance@influtrack.com / finance123');
  console.log('Influencer logins (all password: pass123):');
  for (const p of influencerProfiles) {
    console.log(`  ${p.code.toLowerCase()}@influtrack.com`);
  }
  console.log('─────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
