const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['renter', 'owner', 'both'],
    default: 'renter',
  },
  phone: {
    type: String,
    default: '+1 (555) 234-5678',
  },
  company: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: 'Austin, TX',
  },
  verified: {
    type: Boolean,
    default: true,
  },
  bio: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
