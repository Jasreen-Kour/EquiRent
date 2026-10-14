const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  equipmentId: {
    type: String,
    required: true,
  },
  equipmentTitle: {
    type: String,
    required: true,
  },
  equipmentImage: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
  renterId: {
    type: String,
    required: true,
  },
  renterName: {
    type: String,
    required: true,
  },
  renterEmail: {
    type: String,
    default: '',
  },
  renterPhone: {
    type: String,
    default: '',
  },
  ownerId: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  dailyPrice: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  securityDeposit: {
    type: Number,
    default: 0,
  },
  serviceFee: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  ownerEarnings: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Simulated Escrow', 'Paid', 'Refunded', 'Released'],
    default: 'Simulated Escrow',
  },
  deliveryType: {
    type: String,
    enum: ['Pickup', 'Delivery Requested'],
    default: 'Pickup',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
