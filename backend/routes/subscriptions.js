const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { auth, checkSubscription, hasPermission } = require('../middleware/auth');

const getScope = (req) => req.user.organization || req.user.id;

// Plan pricing
const planPricing = {
  free: { monthly: 0, yearly: 0 },
  basic: { monthly: 299, yearly: 2990 }, // ~20% discount
  standard: { monthly: 599, yearly: 5990 },
  premium: { monthly: 999, yearly: 9990 }
};

// @route   GET /api/subscriptions/plans
// @desc    Get all available plans
// @access  Public
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: [
      {
        name: 'free',
        displayName: 'مجاني',
        price: 0,
        features: [
          '100 محادثة شهرياً',
          '1000 رسالة شهرياً',
          '2 أعضاء فريق',
          '10 قوالب',
          'قناة واحدة',
          'دعم عبر البريد'
        ],
        limits: { conversations: 100, messages: 1000, teamMembers: 2, templates: 10, channels: 1 }
      },
      {
        name: 'basic',
        displayName: 'أساسي',
        price: 299,
        yearlyPrice: 2990,
        features: [
          '1000 محادثة شهرياً',
          '10000 رسالة شهرياً',
          '5 أعضاء فريق',
          '50 قالب',
          '3 قنوات',
          'دعم عبر الواتس آب'
        ],
        limits: { conversations: 1000, messages: 10000, teamMembers: 5, templates: 50, channels: 3 },
        popular: false
      },
      {
        name: 'standard',
        displayName: 'قياسي',
        price: 599,
        yearlyPrice: 5990,
        features: [
          '5000 محادثة شهرياً',
          '50000 رسالة شهرياً',
          '10 أعضاء فريق',
          '100 قالب',
          '5 قنوات',
          'دعم على مدار الساعة',
          'تقارير متقدمة'
        ],
        limits: { conversations: 5000, messages: 50000, teamMembers: 10, templates: 100, channels: 5 },
        popular: true
      },
      {
        name: 'premium',
        displayName: 'مميز',
        price: 999,
        yearlyPrice: 9990,
        features: [
          'محادثات غير محدودة',
          'رسائل غير محدودة',
          'فريق غير محدود',
          'قوالب غير محدودة',
          '8 قنوات',
          'دعم VIP',
          'API مخصص',
          'تكامل مخصص'
        ],
        limits: { conversations: Infinity, messages: Infinity, teamMembers: Infinity, templates: Infinity, channels: 8 }
      }
    ],
    discount: {
      yearly: 20,
      anniversary: 60 // Special anniversary discount
    }
  });
});

// @route   GET /api/subscriptions/current
// @desc    Get current subscription
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ $or: [{ organization: getScope(req) }, { user: req.user.id }] });
    
    if (!subscription) {
      // Create free trial
      subscription = new Subscription({
        user: req.user.id,
      organization: getScope(req),
      plan: 'free',
        status: 'trialing',
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        amount: 0
      });
      await subscription.save();
    }
    
    res.json({
      success: true,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        trialEndsAt: subscription.trialEndsAt,
        isActive: subscription.isActive(),
        limits: subscription.limits,
        usage: subscription.usage,
        usagePercentage: {
          conversations: subscription.getUsagePercentage('conversations'),
          messages: subscription.getUsagePercentage('messages'),
          teamMembers: subscription.getUsagePercentage('teamMembers'),
          templates: subscription.getUsagePercentage('templates'),
          channels: subscription.getUsagePercentage('channels')
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/subscriptions/upgrade
// @desc    Upgrade subscription
// @access  Private
router.post('/upgrade', auth, hasPermission('manageBilling'), async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethod } = req.body;
    
    const pricing = planPricing[plan];
    if (!pricing) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    const amount = billingCycle === 'yearly' ? pricing.yearly : pricing.monthly;
    
    // Apply anniversary discount (60%)
    const discountAmount = amount * 0.6;
    const finalAmount = amount - discountAmount;
    
    let subscription = await Subscription.findOne({ $or: [{ organization: getScope(req) }, { user: req.user.id }] });
    
    if (subscription) {
      subscription.plan = plan;
      subscription.billingCycle = billingCycle;
      subscription.amount = finalAmount;
      subscription.discount = {
        code: 'ANNIVERSARY60',
        percentage: 60,
        amount: discountAmount
      };
      subscription.paymentMethod = paymentMethod;
      subscription.status = 'active';
      subscription.endDate = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
    } else {
      subscription = new Subscription({
        user: req.user.id,
        organization: getScope(req),
        plan,
        billingCycle,
        amount: finalAmount,
        discount: {
          code: 'ANNIVERSARY60',
          percentage: 60,
          amount: discountAmount
        },
        paymentMethod,
        status: 'active',
        endDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      });
    }
    
    await subscription.save();
    
    // Update user subscription info
    await User.findByIdAndUpdate(req.user.id, {
      subscription: {
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isActive: true
      }
    });
    
    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        amount: finalAmount,
        originalAmount: amount,
        discount: subscription.discount,
        endDate: subscription.endDate
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel', auth, hasPermission('manageBilling'), async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ $or: [{ organization: getScope(req) }, { user: req.user.id }] });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();
    
    res.json({
      success: true,
      message: 'Subscription cancelled. You can continue using the service until the end of your billing period.',
      endDate: subscription.endDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/subscriptions/invoices
// @desc    Get invoices
// @access  Private
router.get('/invoices', auth, hasPermission('viewBilling'), async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ $or: [{ organization: getScope(req) }, { user: req.user.id }] });
    
    if (!subscription) {
      return res.json({ success: true, invoices: [] });
    }
    
    res.json({
      success: true,
      invoices: subscription.invoices
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;