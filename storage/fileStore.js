const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const SEED_PATH = path.join(__dirname, '..', 'data', 'seedData.json');

class FileStore {
  constructor() {
    this.data = {
      users: [],
      equipment: [],
      bookings: [],
      reviews: [],
      messages: [],
      notifications: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('[FileStore] Loaded persistent data from data/db.json');
      } else if (fs.existsSync(SEED_PATH)) {
        const raw = fs.readFileSync(SEED_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        this.save();
        console.log('[FileStore] Initialized data/db.json from seedData.json');
      } else {
        console.warn('[FileStore] Neither db.json nor seedData.json found!');
      }
    } catch (err) {
      console.error('[FileStore] Error initializing storage:', err);
    }
  }

  save() {
    try {
      const dataDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[FileStore] Error saving to db.json:', err);
    }
  }

  reset() {
    if (fs.existsSync(SEED_PATH)) {
      const raw = fs.readFileSync(SEED_PATH, 'utf-8');
      this.data = JSON.parse(raw);
      this.save();
      return true;
    }
    return false;
  }

  // --- Users ---
  getUsers() {
    return this.data.users || [];
  }

  findUserById(id) {
    return this.getUsers().find(u => u._id === id || u.id === id);
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user) {
    const id = user._id || user.id || `usr_${Date.now()}`;
    const newUser = {
      _id: id,
      id,
      verified: true,
      createdAt: new Date().toISOString(),
      ...user
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Equipment ---
  getEquipment(filters = {}) {
    let list = [...(this.data.equipment || [])];

    if (filters.category && filters.category !== 'all') {
      list = list.filter(e => e.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.brand && e.brand.toLowerCase().includes(q)) ||
        e.location.toLowerCase().includes(q)
      );
    }

    if (filters.location && filters.location !== 'all') {
      const loc = filters.location.toLowerCase();
      list = list.filter(e => e.location.toLowerCase().includes(loc));
    }

    if (filters.availability && filters.availability !== 'all') {
      list = list.filter(e => e.availability.toLowerCase() === filters.availability.toLowerCase());
    }

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      list = list.filter(e => e.pricePerDay >= Number(filters.minPrice));
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      list = list.filter(e => e.pricePerDay <= Number(filters.maxPrice));
    }

    if (filters.ownerId) {
      list = list.filter(e => e.ownerId === filters.ownerId);
    }

    // Sorting
    if (filters.sort === 'price_asc') {
      list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (filters.sort === 'price_desc') {
      list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (filters.sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default: featured first, then newest
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }

  findEquipmentById(id) {
    return (this.data.equipment || []).find(e => e._id === id || e.id === id);
  }

  createEquipment(item) {
    const id = item._id || item.id || `eq_${Date.now()}`;
    const newItem = {
      _id: id,
      id,
      rating: 5.0,
      reviewsCount: 0,
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ...item
    };
    this.data.equipment.unshift(newItem);
    this.save();
    return newItem;
  }

  updateEquipment(id, updates) {
    const idx = (this.data.equipment || []).findIndex(e => e._id === id || e.id === id);
    if (idx === -1) return null;
    this.data.equipment[idx] = { ...this.data.equipment[idx], ...updates };
    this.save();
    return this.data.equipment[idx];
  }

  deleteEquipment(id) {
    const initialLen = this.data.equipment.length;
    this.data.equipment = this.data.equipment.filter(e => e._id !== id && e.id !== id);
    if (this.data.equipment.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Bookings ---
  getBookings(filters = {}) {
    let list = [...(this.data.bookings || [])];

    if (filters.renterId) {
      list = list.filter(b => b.renterId === filters.renterId);
    }
    if (filters.ownerId) {
      list = list.filter(b => b.ownerId === filters.ownerId);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter(b => b.status.toLowerCase() === filters.status.toLowerCase());
    }

    // Newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }

  findBookingById(id) {
    return (this.data.bookings || []).find(b => b._id === id || b.id === id || b.bookingId === id);
  }

  createBooking(item) {
    const id = item._id || item.id || `bk_${Date.now()}`;
    const bookingCode = `EQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      _id: id,
      id,
      bookingId: bookingCode,
      status: 'Pending',
      paymentStatus: 'Simulated Escrow',
      createdAt: new Date().toISOString(),
      ...item
    };
    this.data.bookings.unshift(newBooking);
    this.save();
    return newBooking;
  }

  updateBooking(id, updates) {
    const idx = (this.data.bookings || []).findIndex(b => b._id === id || b.id === id || b.bookingId === id);
    if (idx === -1) return null;
    this.data.bookings[idx] = { ...this.data.bookings[idx], ...updates };
    this.save();
    return this.data.bookings[idx];
  }

  // --- Reviews ---
  getReviews(equipmentId = null) {
    let list = [...(this.data.reviews || [])];
    if (equipmentId) {
      list = list.filter(r => r.equipmentId === equipmentId);
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }

  createReview(review) {
    const id = review._id || review.id || `rev_${Date.now()}`;
    const newReview = {
      _id: id,
      id,
      createdAt: new Date().toISOString(),
      ...review
    };
    this.data.reviews.unshift(newReview);

    // Update equipment average rating
    const eq = this.findEquipmentById(review.equipmentId);
    if (eq) {
      const eqReviews = this.getReviews(review.equipmentId);
      const totalScore = eqReviews.reduce((acc, r) => acc + Number(r.rating), 0);
      const avg = Number((totalScore / eqReviews.length).toFixed(1));
      this.updateEquipment(review.equipmentId, {
        rating: avg,
        reviewsCount: eqReviews.length
      });
    }

    this.save();
    return newReview;
  }

  // --- Messages ---
  getMessages(filters = {}) {
    let list = [...(this.data.messages || [])];
    if (filters.conversationId) {
      list = list.filter(m => m.conversationId === filters.conversationId);
    }
    if (filters.userId) {
      list = list.filter(m => m.senderId === filters.userId || m.recipientId === filters.userId);
    }
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return list;
  }

  createMessage(msg) {
    const id = msg._id || msg.id || `msg_${Date.now()}`;
    const newMsg = {
      _id: id,
      id,
      read: false,
      createdAt: new Date().toISOString(),
      ...msg
    };
    this.data.messages.push(newMsg);
    this.save();
    return newMsg;
  }

  // --- Notifications ---
  getNotifications(userId) {
    let list = (this.data.notifications || []).filter(n => n.userId === userId);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }

  createNotification(notif) {
    const id = notif._id || notif.id || `notif_${Date.now()}`;
    const newNotif = {
      _id: id,
      id,
      read: false,
      createdAt: new Date().toISOString(),
      ...notif
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationRead(id) {
    const idx = (this.data.notifications || []).findIndex(n => n._id === id || n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx].read = true;
      this.save();
      return this.data.notifications[idx];
    }
    return null;
  }

  markAllNotificationsRead(userId) {
    let updated = 0;
    (this.data.notifications || []).forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        updated++;
      }
    });
    if (updated > 0) this.save();
    return updated;
  }
}

const fileStore = new FileStore();
module.exports = fileStore;
