const express = require('express');
const router = express.Router();
const fileStore = require('../storage/fileStore');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/reviews
router.get('/', (req, res) => {
  try {
    const { equipmentId } = req.query;
    const reviews = fileStore.getReviews(equipmentId || null);
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// POST /api/reviews
router.post('/', authenticateToken, (req, res) => {
  try {
    const { equipmentId, bookingId, rating, comment, equipmentConditionRating, communicationRating } = req.body;

    if (!equipmentId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Equipment ID, rating (1-5), and comment are required.' });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const equipment = fileStore.findEquipmentById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    const newReview = fileStore.createReview({
      equipmentId,
      bookingId: bookingId || '',
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      rating: numRating,
      comment,
      equipmentConditionRating: Number(equipmentConditionRating || 5),
      communicationRating: Number(communicationRating || 5)
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review: newReview
    });
  } catch (err) {
    console.error('Create review error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

module.exports = router;
