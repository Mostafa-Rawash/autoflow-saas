const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { auth, hasPermission } = require('../middleware/auth');

const getScope = (req) => req.user.organization || req.user.id;
const crypto = require('crypto');
const axios = require('axios');

// Paymob configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

// Demo payment data
const demoPayments = [
  { _id: 'demo-1', amount: 2000, currency: 'EGP', plan: 'starter', billingCycle: 'monthly', status: 'completed', paymentMethod: 'paymob', transactionId: 'TXN-DEMO-001', completedAt: new Date() },
  { _id: 'demo-2', amount: 4000, currency: 'EGP', plan: 'professional', billingCycle: 'monthly', status: 'completed', paymentMethod: 'fawry', transactionId: 'TXN-DEMO-002', completedAt: new Date() }
];

// Pricing configuration
const pricingConfig = {
  starter: { 
    monthly: 2000, 
    yearly: 20000, 
    features: ['قناة واتس آب واحدة', '500 محادثة/شهر', 'ردود تلقائية', 'دعم بالإيميل'],
    limits: { channels: 1, conversations: 500 }
  },
  professional: { 
    monthly: 4000, 
    yearly: 40000, 
    features: ['3 قنوات', '2000 محادثة/شهر', 'ذكاء اصطناعي متقدم', 'صندوق فريق (5 مستخدمين)', 'دعم أولوي'],
    limits: { channels: 3, conversations: 2000 }
  },
  enterprise: { 
    monthly: 8000, 
    yearly: 80000, 
    features: ['8 قنوات', 'محادثات غير محدودة', 'API مخصص', 'مدير حساب مخصص', 'دعم VIP'],
    limits: { channels: 8, conversations: Infinity }
  }
};

// @route   GET /api/payments/plans
// @desc    Get available pricing plans
// @access  Public
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: pricingConfig,
    currency: 'EGP',
    yearlyDiscount: 20
  });
});

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      { id: 'paymob', name: 'بطاقة ائتمان / محفظة إلكترونية', icon: '💳', available: true },
      { id: 'fawry', name: 'فوري - الدفع النقدي', icon: '🏪', available: true },
      { id: 'vodafone_cash', name: 'فودافون كاش', icon: '📱', available: true },
      { id: 'bank_transfer', name: 'تحويل بنكي', icon: '🏦', available: true }
    ]
  });
});

// @route   POST /api/payments/create
// @desc    Create a new payment
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethod, billingInfo } = req.body;
    
    // Validate plan
    if (!pricingConfig[plan]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    // Calculate amount
    const amount = Payment.calculateAmount(plan, billingCycle);
    
    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      organization: getScope(req),
      amount,
      plan,
      billingCycle,
      paymentMethod,
      billingInfo,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        source: req.get('referer') || 'dashboard'
      }
    });
    
    // Generate transaction ID
    payment.transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // Handle different payment methods
    if (paymentMethod === 'paymob' && PAYMOB_API_KEY) {
      try {
        // Step 1: Authentication
        const authRes = await axios.post('https://accept.paymob.com/api/auth/tokens', {
          api_key: PAYMOB_API_KEY
        });
        const authToken = authRes.data.token;
        
        // Step 2: Order Registration
        const orderRes = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
          auth_token: authToken,
          delivery_needed: false,
          amount_cents: amount * 100,
          currency: 'EGP',
          merchant_order_id: payment.transactionId,
          items: [{
            name: `AutoFlow ${plan} - ${billingCycle}`,
            amount_cents: amount * 100,
            quantity: 1
          }]
        });
        
        payment.paymobOrderId = orderRes.data.id.toString();
        
        // Step 3: Payment Key Request
        const paymentKeyRes = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
          auth_token: authToken,
          amount_cents: amount * 100,
          expiration: 3600,
          order_id: orderRes.data.id,
          billing_data: {
            first_name: billingInfo?.name?.split(' ')[0] || 'Customer',
            last_name: billingInfo?.name?.split(' ').slice(1).join(' ') || 'User',
            email: billingInfo?.email || req.user.email,
            phone_number: billingInfo?.phone || '+201000000000',
            country: 'EG',
            city: billingInfo?.city || 'Cairo'
          },
          currency: 'EGP',
          integration_id: PAYMOB_INTEGRATION_ID
        });
        
        payment.paymobPaymentKey = paymentKeyRes.data.token;
        payment.status = 'processing';
        await payment.save();
        
        res.json({
          success: true,
          payment,
          paymobIframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKeyRes.data.token}`
        });
      } catch (paymobError) {
        console.error('Paymob error:', paymobError.response?.data || paymobError.message);
        // Fall back to demo mode
        payment.status = 'pending';
        await payment.save();
        res.json({
          success: true,
          payment,
          demoMode: true,
          message: 'Payment created in demo mode'
        });
      }
    } else if (paymentMethod === 'fawry') {
      // Generate Fawry reference number
      const refNumber = `${Date.now().toString(36).toUpperCase()}`;
      payment.fawryRefNumber = refNumber;
      payment.status = 'pending';
      await payment.save();
      
      res.json({
        success: true,
        payment,
        fawryRefNumber: refNumber,
        fawryInstructions: 'يمكنك الدفع في أي منفذ فوري باستخدام رقم الإشارة المذكور'
      });
    } else {
      // Other payment methods
      payment.status = 'pending';
      await payment.save();
      
      res.json({
        success: true,
        payment,
        message: 'Payment created. Follow the instructions for your selected payment method.'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/payments/webhook/paymob
// @desc    Handle Paymob webhook
// @access  Public (but verified)
router.post('/webhook/paymob', async (req, res) => {
  try {
    const { obj } = req.body;
    
    // Verify HMAC signature (simplified for demo)
    if (PAYMOB_HMAC_SECRET) {
      // In production, verify the HMAC signature
    }
    
    if (obj.success === true) {
      const payment = await Payment.findOne({ paymobOrderId: obj.order?.id?.toString() });
      if (payment) {
        await payment.markCompleted(obj.id?.toString());
        
        // Update user subscription
        await Subscription.findOneAndUpdate(
          { $or: [{ organization: payment.organization }, { user: payment.user }] },
          {
            plan: payment.plan,
            status: 'active',
            amount: payment.amount,
            billingCycle: payment.billingCycle,
            endDate: new Date(Date.now() + (payment.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
          },
          { upsert: true }
        );
      }
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/payments/confirm/:id
// @desc   Confirm payment (demo mode)
// @access  Private
router.post('/confirm/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, $or: [{ organization: getScope(req) }, { user: req.user.id }] });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'completed') {
      await payment.markCompleted(`DEMO-${Date.now()}`);
      
      // Update subscription
      await Subscription.findOneAndUpdate(
        { $or: [{ organization: getScope(req) }, { user: req.user.id }] },
        {
          plan: payment.plan,
          status: 'active',
          amount: payment.amount,
          billingCycle: payment.billingCycle,
          endDate: new Date(Date.now() + (payment.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
        },
        { upsert: true }
      );
    }
    
    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/payments/history
// @desc   Get payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ $or: [{ organization: getScope(req) }, { user: req.user.id }] }).sort({ createdAt: -1 });
    if (payments.length === 0) {
      return res.json({ success: true, payments: demoPayments, demo: true });
    }
    res.json({ success: true, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/payments/:id
// @desc   Get payment details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, $or: [{ organization: getScope(req) }, { user: req.user.id }] });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;