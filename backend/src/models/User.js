const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'influencer', 'finance'], default: 'influencer' }
}, { timestamps: true });

module.exports = model('User', userSchema);
