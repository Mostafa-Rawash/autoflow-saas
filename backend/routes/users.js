const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const TeamInvitation = require('../models/TeamInvitation');
const { auth, authorize, hasPermission, checkSubscription, canAdd } = require('../middleware/auth');

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array() 
    });
  }
  next();
};

// @route   GET /api/users
// @desc    Get all team members
// @access  Private (Admin/Owner)
router.get('/', auth, hasPermission('viewTeam'), async (req, res) => {
  try {
    // Get team members from user's team array
    const teamMemberIds = req.user.team?.map(t => t.user) || [];
    
    // Also include the owner
    teamMemberIds.push(req.user._id);
    
    const users = await User.find({ _id: { $in: teamMemberIds } })
      .select('-password');
    
    // Add role information
    const teamWithRoles = users.map(u => {
      const teamEntry = req.user.team?.find(t => t.user.toString() === u._id.toString());
      return {
        ...u.toObject(),
        teamRole: teamEntry?.role || 'owner'
      };
    });
    
    res.json({ success: true, users: teamWithRoles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (Self or Admin)
router.put('/:id', [
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ max: 50 }),
  body('phone').optional().trim(),
  body('avatar').optional().isURL().withMessage('Avatar must be a URL'),
  body('settings.language').optional().isIn(['ar', 'en']),
  body('settings.timezone').optional().isString(),
  body('settings.notifications').optional().isObject()
], validate, auth, async (req, res) => {
  try {
    // Only allow self-update or admin
    if (req.params.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized',
        code: 'FORBIDDEN'
      });
    }
    
    const { name, phone, avatar, settings } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (settings) updateData.settings = settings;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   PUT /api/users/:id/password
// @desc    Update password
// @access  Private (Self only)
router.put('/:id/password', [
  param('id').isMongoId(),
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, auth, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        error: 'Can only update your own password',
        code: 'FORBIDDEN'
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.params.id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   POST /api/users/invite
// @desc    Invite team member
// @access  Private (Admin/Owner/Manager)
router.post('/invite', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').isIn(['admin', 'manager', 'agent', 'viewer']).withMessage('Valid role required')
], validate, auth, hasPermission('inviteMembers'), checkSubscription, canAdd('teamMembers'), async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Check if already in team
      const alreadyInTeam = req.user.team?.some(t => t.user.toString() === existingUser._id.toString());
      if (alreadyInTeam) {
        return res.status(400).json({ 
          success: false,
          error: 'User already in team',
          code: 'ALREADY_IN_TEAM'
        });
      }
      
      // Add to team directly
      req.user.team = req.user.team || [];
      req.user.team.push({
        user: existingUser._id,
        role
      });
      await req.user.save();
      
      // Update subscription usage
      await Subscription.findOneAndUpdate(
        { user: req.user._id },
        { $inc: { 'usage.teamMembers': 1 } }
      );
      
      return res.json({ 
        success: true, 
        message: 'User added to team',
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email
        }
      });
    }
    
    // Check for existing pending invitation
    const existingInvitation = await TeamInvitation.findOne({
      team: req.user._id,
      email,
      status: 'pending'
    });
    
    if (existingInvitation) {
      return res.status(400).json({ 
        success: false,
        error: 'Invitation already sent',
        code: 'INVITATION_EXISTS'
      });
    }
    
    // Create invitation
    const token = TeamInvitation.generateToken();
    const invitation = new TeamInvitation({
      team: req.user._id,
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    await invitation.save();
    
    // TODO: Send invitation email
    // For now, return the token for testing
    const inviteUrl = `${process.env.FRONTEND_URL}/register?invite=${token}`;
    
    res.json({ 
      success: true, 
      message: 'Invitation sent',
      invite: {
        email,
        role,
        // Include URL for testing (remove in production)
        url: inviteUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   GET /api/users/invite/:token
// @desc    Get invitation details
// @access  Public
router.get('/invite/:token', [
  param('token').isLength({ min: 10 })
], validate, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findOne({
      token: req.params.token,
      status: 'pending'
    }).populate('team', 'name email');
    
    if (!invitation) {
      return res.status(404).json({ 
        success: false,
        error: 'Invitation not found or expired',
        code: 'INVITATION_NOT_FOUND'
      });
    }
    
    if (invitation.isExpired()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ 
        success: false,
        error: 'Invitation expired',
        code: 'INVITATION_EXPIRED'
      });
    }
    
    res.json({
      success: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        teamOwner: invitation.team
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   POST /api/users/invite/:token/accept
// @desc    Accept team invitation
// @access  Public (new user registration)
router.post('/invite/:token/accept', [
  param('token').isLength({ min: 10 }),
  body('name').trim().notEmpty().withMessage('Name required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
], validate, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findOne({
      token: req.params.token,
      status: 'pending'
    });
    
    if (!invitation || invitation.isExpired()) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid or expired invitation',
        code: 'INVALID_INVITATION'
      });
    }
    
    const { name, password } = req.body;
    
    // Create new user
    const user = new User({
      name,
      email: invitation.email,
      password,
      role: invitation.role,
      subscription: {
        plan: 'free',
        isActive: false
      }
    });
    
    await user.save();
    
    // Add to team
    const teamOwner = await User.findById(invitation.team);
    if (teamOwner) {
      teamOwner.team = teamOwner.team || [];
      teamOwner.team.push({
        user: user._id,
        role: invitation.role
      });
      await teamOwner.save();
      
      // Update subscription usage
      await Subscription.findOneAndUpdate(
        { user: teamOwner._id },
        { $inc: { 'usage.teamMembers': 1 } }
      );
    }
    
    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = user._id;
    await invitation.save();
    
    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Account created and joined team',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   DELETE /api/users/invite/:token
// @desc   Cancel/decline invitation
// @access  Private
router.delete('/invite/:token', [
  param('token').isLength({ min: 10 })
], validate, auth, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findOne({
      token: req.params.token
    });
    
    if (!invitation) {
      return res.status(404).json({ 
        success: false,
        error: 'Invitation not found',
        code: 'INVITATION_NOT_FOUND'
      });
    }
    
    // Only team owner or invited email can cancel
    if (invitation.team.toString() !== req.user._id.toString() && 
        invitation.email !== req.user.email) {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized',
        code: 'FORBIDDEN'
      });
    }
    
    invitation.status = 'declined';
    await invitation.save();
    
    res.json({ success: true, message: 'Invitation cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @route   DELETE /api/users/:id/team
// @desc    Remove team member
// @access  Private (Admin/Owner)
router.delete('/:id/team', [
  param('id').isMongoId()
], validate, auth, hasPermission('removeMembers'), async (req, res) => {
  try {
    // Remove from team array
    req.user.team = req.user.team.filter(t => t.user.toString() !== req.params.id);
    await req.user.save();
    
    // Update subscription usage
    await Subscription.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { 'usage.teamMembers': -1 } }
    );
    
    res.json({ success: true, message: 'Team member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;