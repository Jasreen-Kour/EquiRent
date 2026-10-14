const mongoose = require('mongoose');

const specSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const equipmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Agricultural machinery',
      'Construction machinery',
      'Industrial equipment',
      'Power tools',
      'Event equipment',
    ],
  },
  description: {
    type: String,
    required: true,
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 1,
  },
  securityDeposit: {
    type: Number,
    default: 0,
  },
  location: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    enum: ['Brand New', 'Excellent', 'Good', 'Fair'],
    default: 'Excellent',
  },
  brand: {
    type: String,
    default: '',
  },
  modelYear: {
    type: Number,
    default: 2023,
  },
  specs: [specSchema],
  images: [{
    type: String,
  }],
  primaryImage: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerRating: {
    type: Number,
    default: 4.9,
  },
  ownerReviewsCount: {
    type: Number,
    default: 18,
  },
  availability: {
    type: String,
    enum: ['Available', 'Rented', 'Maintenance'],
    default: 'Available',
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  reviewsCount: {
    type: Number,
    default: 12,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);
