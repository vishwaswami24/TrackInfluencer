const { Schema, model } = require('mongoose');

const influencerSchema = new Schema({
  brand_id: { type: Schema.Types.ObjectId, ref: 'Brand' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referral_code: { type: String, required: true, unique: true },
  commission_rate: { type: Number, default: 10 },
  total_clicks: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = model('Influencer', influencerSchema);
