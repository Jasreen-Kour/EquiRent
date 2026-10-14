const express = require('express');
const router = express.Router();
const fileStore = require('../storage/fileStore');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// GET /api/equipment/categories
router.get('/categories', (req, res) => {
  const allEquipment = fileStore.getEquipment();
  const categories = [
    'Agricultural machinery',
    'Construction machinery',
    'Industrial equipment',
    'Power tools',
    'Event equipment'
  ];

  const counts = categories.map(cat => ({
    name: cat,
    count: allEquipment.filter(e => e.category === cat).length
  }));

  return res.json({ success: true, categories: counts });
});

// GET /api/equipment
router.get('/', optionalAuth, (req, res) => {
  try {
    const { category, search, location, availability, minPrice, maxPrice, sort, ownerId } = req.query;
    const items = fileStore.getEquipment({
      category,
      search,
      location,
      availability,
      minPrice,
      maxPrice,
      sort,
      ownerId
    });

    return res.json({
      success: true,
      count: items.length,
      equipment: items
    });
  } catch (err) {
    console.error('Fetch equipment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch equipment listings.' });
  }
});

// GET /api/equipment/:id
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const item = fileStore.findEquipmentById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment listing not found.' });
    }

    const reviews = fileStore.getReviews(item._id);
    const owner = fileStore.findUserById(item.ownerId) || {
      name: item.ownerName,
      phone: '+1 (512) 555-0144',
      verified: true
    };

    return res.json({
      success: true,
      equipment: {
        ...item,
        reviews,
        owner: {
          id: owner._id || owner.id,
          name: owner.name,
          phone: owner.phone,
          avatar: owner.avatar,
          company: owner.company,
          verified: owner.verified !== false,
          location: owner.location || item.location,
          rating: item.ownerRating || 4.9
        }
      }
    });
  } catch (err) {
    console.error('Fetch single equipment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch equipment details.' });
  }
});

// POST /api/equipment (Create listing)
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      category,
      description,
      pricePerDay,
      securityDeposit,
      location,
      condition,
      brand,
      modelYear,
      specs,
      primaryImage,
      images
    } = req.body;

    if (!title || !category || !description || !pricePerDay || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, description, daily rental price, and location are required.'
      });
    }

    const defaultImg = primaryImage || (images && images[0]) || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1000&q=80';

    const newItem = fileStore.createEquipment({
      title,
      category,
      description,
      pricePerDay: Number(pricePerDay),
      securityDeposit: Number(securityDeposit || 0),
      location,
      condition: condition || 'Excellent',
      brand: brand || '',
      modelYear: Number(modelYear || new Date().getFullYear()),
      specs: Array.isArray(specs) ? specs : [],
      primaryImage: defaultImg,
      images: Array.isArray(images) && images.length > 0 ? images : [defaultImg],
      ownerId: req.user._id,
      ownerName: req.user.name,
      ownerRating: 4.9,
      ownerReviewsCount: 1,
      availability: 'Available',
      featured: false
    });

    return res.status(201).json({
      success: true,
      message: 'Equipment listing published successfully.',
      equipment: newItem
    });
  } catch (err) {
    console.error('Create equipment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create equipment listing.' });
  }
});

// PUT /api/equipment/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const existing = fileStore.findEquipmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Equipment listing not found.' });
    }

    // Check ownership
    if (existing.ownerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this listing.' });
    }

    const {
      title,
      category,
      description,
      pricePerDay,
      securityDeposit,
      location,
      condition,
      brand,
      modelYear,
      specs,
      primaryImage,
      images,
      availability
    } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (category) updates.category = category;
    if (description) updates.description = description;
    if (pricePerDay !== undefined) updates.pricePerDay = Number(pricePerDay);
    if (securityDeposit !== undefined) updates.securityDeposit = Number(securityDeposit);
    if (location) updates.location = location;
    if (condition) updates.condition = condition;
    if (brand !== undefined) updates.brand = brand;
    if (modelYear !== undefined) updates.modelYear = Number(modelYear);
    if (specs) updates.specs = specs;
    if (primaryImage) updates.primaryImage = primaryImage;
    if (images) updates.images = images;
    if (availability) updates.availability = availability;

    const updated = fileStore.updateEquipment(req.params.id, updates);

    return res.json({
      success: true,
      message: 'Equipment listing updated successfully.',
      equipment: updated
    });
  } catch (err) {
    console.error('Update equipment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update equipment.' });
  }
});

// DELETE /api/equipment/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const existing = fileStore.findEquipmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Equipment listing not found.' });
    }

    if (existing.ownerId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this listing.' });
    }

    const deleted = fileStore.deleteEquipment(req.params.id);
    if (deleted) {
      return res.json({ success: true, message: 'Equipment listing deleted successfully.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to delete equipment.' });
  } catch (err) {
    console.error('Delete equipment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete equipment.' });
  }
});

module.exports = router;
