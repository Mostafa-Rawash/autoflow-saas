const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all team members
// @access  Private (Admin)
router.get('/', auth, authorize('admin', 'owner'), async (req, res) => {
  try {
    const users = await User.find({ _id: { $in: req.user.team.map(t => t.user) } })
      .select('-password');
    
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const { name, phone, avatar, settings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, avatar, settings },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/:id/password
// @desc    Update password
// @access  Private
router.put('/:id/password', auth, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.params.id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users/invite
// @desc    Invite team member
// @access  Private (Admin)
router.post('/invite', auth, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // TODO: Send invitation email
    
    res.json({ success: true, message: 'Invitation sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;