const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  equipmentId: {
    type: String,
    required: true,
  },
  bookingId: {
    type: String,
    default: '',
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  equipmentConditionRating: {
    type: Number,
    default: 5,
  },
  communicationRating: {
    type: Number,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
