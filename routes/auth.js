const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fileStore = require('../storage/fileStore');
const { authenticateToken, JWT_SECRET } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, company, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existing = fileStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = fileStore.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'renter',
      phone: phone || '+1 (555) 000-0000',
      company: company || '',
      location: location || 'Austin, TX',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
      verified: true
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = fileStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// POST /api/auth/demo-login (instant role-based demo login)
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body; // 'renter' or 'owner' or 'both'
    const targetEmail = role === 'owner' ? 'owner@equirent.com' : (role === 'both' ? 'alex@equirent.com' : 'renter@equirent.com');

    const user = fileStore.findUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${role} not found.` });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Signed in as Demo ${user.role.toUpperCase()}: ${user.name}`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({ success: false, message: 'Demo login error.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  return res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, company, location, bio, role, currentPassword, newPassword } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (company !== undefined) updates.company = company;
    if (location) updates.location = location;
    if (bio !== undefined) updates.bio = bio;
    if (role && ['renter', 'owner', 'both'].includes(role)) updates.role = role;

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }
      const rawUser = fileStore.findUserById(req.user._id);
      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, rawUser.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password does not match.' });
        }
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    const updated = fileStore.updateUser(req.user._id, updates);
    const { password: _, ...safeUser } = updated;

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// POST /api/auth/reset-demo
router.post('/reset-demo', (req, res) => {
  const ok = fileStore.reset();
  if (ok) {
    return res.json({ success: true, message: 'Demo data has been reset to default state.' });
  }
  return res.status(500).json({ success: false, message: 'Failed to reset demo data.' });
});

module.exports = router;
