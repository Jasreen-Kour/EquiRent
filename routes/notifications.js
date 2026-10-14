const express = require('express');
const router = express.Router();
const fileStore = require('../storage/fileStore');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/notifications
router.get('/', authenticateToken, (req, res) => {
  try {
    const notifications = fileStore.getNotifications(req.user._id);
    const unreadCount = notifications.filter(n => !n.read).length;
    return res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, (req, res) => {
  try {
    const updated = fileStore.markNotificationRead(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    return res.json({ success: true, notification: updated });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticateToken, (req, res) => {
  try {
    const count = fileStore.markAllNotificationsRead(req.user._id);
    return res.json({ success: true, message: `Marked ${count} notifications as read.` });
  } catch (err) {
    console.error('Mark all notifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
});

module.exports = router;
