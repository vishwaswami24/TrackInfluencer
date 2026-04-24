const { Schema, model } = require('mongoose');

const brandSchema = new Schema({
  name: { type: String, required: true },
  owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  slug: { type: String, unique: true },
  logo_url: String,
}, { timestamps: true });

module.exports = model('Brand', brandSchema);
