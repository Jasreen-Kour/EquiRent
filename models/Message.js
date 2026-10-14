const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  recipientId: {
    type: String,
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  equipmentId: {
    type: String,
    default: '',
  },
  equipmentTitle: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
