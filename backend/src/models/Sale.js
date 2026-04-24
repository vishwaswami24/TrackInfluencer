const { Schema, model } = require('mongoose');

const saleSchema = new Schema({
  brand_id: { type: Schema.Types.ObjectId, ref: 'Brand' },
  influencer_id: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
  amount: { type: Number, required: true },
  product_name: String,
  customer_email: String,
  commission_amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = model('Sale', saleSchema);
