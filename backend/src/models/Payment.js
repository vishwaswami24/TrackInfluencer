const { Schema, model } = require('mongoose');

const paymentSchema = new Schema({
  brand_id: { type: Schema.Types.ObjectId, ref: 'Brand' },
  influencer_id: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
  period_start: Date,
  period_end: Date,
  paid_at: Date,
  razorpay_payment_id: String
}, { timestamps: true });

module.exports = model('Payment', paymentSchema);
