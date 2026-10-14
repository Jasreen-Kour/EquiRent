const express = require('express');
const router = express.Router();
const fileStore = require('../storage/fileStore');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/messages/conversations
router.get('/conversations', authenticateToken, (req, res) => {
  try {
    const userMessages = fileStore.getMessages({ userId: req.user._id });
    
    // Group by conversation partner
    const convMap = new Map();

    userMessages.forEach(msg => {
      const partnerId = msg.senderId === req.user._id ? msg.recipientId : msg.senderId;
      const partnerName = msg.senderId === req.user._id ? msg.recipientName : msg.senderName;

      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          partnerId,
          partnerName,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          equipmentTitle: msg.equipmentTitle || 'Rental Inquiry',
          unreadCount: (!msg.read && msg.recipientId === req.user._id) ? 1 : 0
        });
      } else {
        const existing = convMap.get(partnerId);
        existing.lastMessage = msg.text;
        existing.lastMessageTime = msg.createdAt;
        if (!msg.read && msg.recipientId === req.user._id) {
          existing.unreadCount += 1;
        }
      }
    });

    const conversations = Array.from(convMap.values());
    return res.json({ success: true, conversations });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
});

// GET /api/messages/thread/:partnerId
router.get('/thread/:partnerId', authenticateToken, (req, res) => {
  try {
    const partnerId = req.params.partnerId;
    const partner = fileStore.findUserById(partnerId) || { name: 'User' };

    const allMessages = fileStore.getMessages({ userId: req.user._id });
    const thread = allMessages.filter(
      m => (m.senderId === req.user._id && m.recipientId === partnerId) ||
           (m.senderId === partnerId && m.recipientId === req.user._id)
    );

    // Mark as read
    thread.forEach(m => {
      if (m.recipientId === req.user._id) {
        m.read = true;
      }
    });
    fileStore.save();

    return res.json({
      success: true,
      partner: {
        id: partner._id || partner.id,
        name: partner.name,
        company: partner.company || '',
        avatar: partner.avatar,
        role: partner.role
      },
      messages: thread
    });
  } catch (err) {
    console.error('Fetch thread error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch message thread.' });
  }
});

// POST /api/messages
router.post('/', authenticateToken, (req, res) => {
  try {
    const { recipientId, text, equipmentId, equipmentTitle } = req.body;

    if (!recipientId || !text) {
      return res.status(400).json({ success: false, message: 'Recipient ID and message text are required.' });
    }

    const recipient = fileStore.findUserById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    const conversationId = [req.user._id, recipientId].sort().join('_');

    const newMsg = fileStore.createMessage({
      conversationId,
      senderId: req.user._id,
      senderName: req.user.name,
      recipientId,
      recipientName: recipient.name,
      equipmentId: equipmentId || '',
      equipmentTitle: equipmentTitle || '',
      text
    });

    fileStore.createNotification({
      userId: recipientId,
      title: `Message from ${req.user.name}`,
      message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
      type: 'message',
      link: '#/messages'
    });

    return res.status(201).json({ success: true, message: newMsg });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

module.exports = router;
