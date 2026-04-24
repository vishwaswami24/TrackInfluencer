const { Schema, model } = require('mongoose');

const clickSchema = new Schema({
  influencer_id: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
  ip_address: String,
  user_agent: String,
  converted: { type: Boolean, default: false },
  clicked_at: { type: Date, default: Date.now }
});

module.exports = model('Click', clickSchema);
