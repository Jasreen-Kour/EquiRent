const express = require('express');
const router = express.Router();
const fileStore = require('../storage/fileStore');
const { authenticateToken } = require('../middleware/authMiddleware');

const COMMISSION_RATE = Number(process.env.COMMISSION_RATE || 0.10);

// Helper: Calculate days between two dates
function calculateDays(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// GET /api/bookings (renter bookings or owner bookings depending on role / query)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { role, status } = req.query;
    let bookings = [];

    if (role === 'owner' || (req.user.role === 'owner' && !role)) {
      bookings = fileStore.getBookings({ ownerId: req.user._id, status });
    } else if (role === 'all') {
      // Both renter & owner if applicable
      const asRenter = fileStore.getBookings({ renterId: req.user._id, status });
      const asOwner = fileStore.getBookings({ ownerId: req.user._id, status });
      const map = new Map();
      [...asRenter, ...asOwner].forEach(b => map.set(b._id, b));
      bookings = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default to renter bookings
      bookings = fileStore.getBookings({ renterId: req.user._id, status });
    }

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/owner (incoming requests for equipment owner)
router.get('/owner-requests', authenticateToken, (req, res) => {
  try {
    const bookings = fileStore.getBookings({ ownerId: req.user._id });
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('Fetch owner bookings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch owner bookings.' });
  }
});

// GET /api/bookings/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const booking = fileStore.findBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Authorization: User must be renter, owner, or admin
    if (booking.renterId !== req.user._id && booking.ownerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have access to view this booking.' });
    }

    return res.json({ success: true, booking });
  } catch (err) {
    console.error('Fetch booking by ID error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch booking.' });
  }
});

// POST /api/bookings (Create booking request)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { equipmentId, startDate, endDate, deliveryType, notes } = req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID, rental start date, and end date are required.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
    }

    if (start < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
    }

    const totalDays = calculateDays(startDate, endDate);
    if (totalDays < 1) {
      return res.status(400).json({ success: false, message: 'End date must be at least 1 day after start date.' });
    }

    const equipment = fileStore.findEquipmentById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment listing not found.' });
    }

    if (equipment.availability !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `This equipment is currently marked as ${equipment.availability} and cannot be booked.`
      });
    }

    if (equipment.ownerId === req.user._id) {
      return res.status(400).json({ success: false, message: 'You cannot book your own equipment.' });
    }

    // Check for conflicting overlapping active/confirmed bookings
    const existingBookings = fileStore.getBookings({ equipmentId }).filter(
      b => ['Pending', 'Confirmed', 'Active'].includes(b.status)
    );

    const hasOverlap = existingBookings.some(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return (start <= bEnd && end >= bStart);
    });

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'This equipment already has a confirmed booking for the selected dates. Please choose different dates.'
      });
    }

    // Calculations
    const dailyPrice = equipment.pricePerDay;
    const subtotal = dailyPrice * totalDays;
    const securityDeposit = equipment.securityDeposit || 0;
    const serviceFee = Math.round(subtotal * COMMISSION_RATE);
    const totalPrice = subtotal + securityDeposit + serviceFee;
    const ownerEarnings = Math.round(subtotal * (1 - COMMISSION_RATE));

    const newBooking = fileStore.createBooking({
      equipmentId: equipment._id,
      equipmentTitle: equipment.title,
      equipmentImage: equipment.primaryImage,
      category: equipment.category,
      renterId: req.user._id,
      renterName: req.user.name,
      renterEmail: req.user.email,
      renterPhone: req.user.phone,
      ownerId: equipment.ownerId,
      ownerName: equipment.ownerName,
      startDate,
      endDate,
      totalDays,
      dailyPrice,
      subtotal,
      securityDeposit,
      serviceFee,
      totalPrice,
      ownerEarnings,
      status: 'Pending',
      paymentStatus: 'Simulated Escrow',
      deliveryType: deliveryType || 'Pickup',
      notes: notes || ''
    });

    // Create Notification for the equipment owner
    fileStore.createNotification({
      userId: equipment.ownerId,
      title: 'New Booking Request',
      message: `${req.user.name} requested to rent "${equipment.title}" for ${totalDays} days (₹${totalPrice.toLocaleString('en-IN')} total).`,
      type: 'booking_request',
      link: '#/dashboard'
    });

    // Create Notification for the renter
    fileStore.createNotification({
      userId: req.user._id,
      title: 'Booking Request Submitted',
      message: `Your booking request for "${equipment.title}" is pending owner approval.`,
      type: 'booking_status',
      link: '#/bookings'
    });

    return res.status(201).json({
      success: true,
      message: 'Booking request created successfully. Awaiting owner confirmation.',
      booking: newBooking
    });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create booking.' });
  }
});

// PATCH /api/bookings/:id/status (Accept, Reject, Cancel, Complete)
router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const booking = fileStore.findBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isOwner = booking.ownerId === req.user._id;
    const isRenter = booking.renterId === req.user._id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isRenter && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to change this booking status.' });
    }

    // Role-specific permission logic
    if (status === 'Confirmed' && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the equipment owner can confirm a booking.' });
    }

    if (status === 'Active' && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the equipment owner can mark a booking as active (handed over).' });
    }

    if (status === 'Completed' && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the equipment owner can mark a rental as completed (returned).' });
    }

    if (status === 'Cancelled') {
      if (booking.status === 'Completed') {
        return res.status(400).json({ success: false, message: 'Cannot cancel an already completed rental.' });
      }
    }

    const updates = { status };
    if (cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }

    if (status === 'Completed') {
      updates.paymentStatus = 'Released';
    } else if (status === 'Cancelled') {
      updates.paymentStatus = 'Refunded';
    }

    const updatedBooking = fileStore.updateBooking(booking._id, updates);

    // Send notifications to appropriate parties
    if (isOwner) {
      fileStore.createNotification({
        userId: booking.renterId,
        title: `Booking ${status}`,
        message: `Your booking for "${booking.equipmentTitle}" is now ${status}.`,
        type: 'booking_status',
        link: '#/bookings'
      });
    } else if (isRenter && status === 'Cancelled') {
      fileStore.createNotification({
        userId: booking.ownerId,
        title: 'Booking Cancelled by Renter',
        message: `${booking.renterName} cancelled their booking for "${booking.equipmentTitle}".`,
        type: 'booking_status',
        link: '#/dashboard'
      });
    }

    return res.json({
      success: true,
      message: `Booking has been updated to ${status}.`,
      booking: updatedBooking
    });
  } catch (err) {
    console.error('Update booking status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
});

module.exports = router;
