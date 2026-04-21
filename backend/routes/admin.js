/**
 * Admin Routes
 * 
 * All routes require:
 * - Authentication (auth middleware)
 * - Admin privileges (owner/admin/manager role)
 * 
 * Permission: ADMIN_ONLY
 * 
 * @see middleware/auth.js - adminOnly middleware
 * @see models/Role.js - Role definitions and permissions
 */

const express = require('express');
const router = express.Router();
const { auth, hasPermission, authorize } = require('../middleware/auth');

/**
 * Middleware: adminOnly
 * 
 * Restricts access to users with owner, admin, or manager roles.
 * 
 * Allowed roles: ['owner', 'admin', 'manager']
 * Denied roles: ['agent', 'viewer']
 * 
 * @returns 403 FORBIDDEN if user lacks admin privileges
 */
const adminOnly = (req, res, next) => {
  const allowedRoles = ['owner', 'admin', 'manager'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      error: 'This action requires admin privileges',
      code: 'ADMIN_ONLY'
    });
  }
  next();
};

// ====== ARTICLES ======
/**
 * Articles Management
 * Permission: adminOnly (owner/admin/manager)
 * Required permission: 'content' or 'all'
 */
/**
 * Articles Management
 * Permission: adminOnly (owner/admin/manager)
 * Required permission: 'content' or 'all'
 */

// GET /api/admin/articles - List all articles
// Permission: owner, admin, manager
router.get('/articles', auth, adminOnly, async (req, res) => {
  try {
    // TODO: Get from database
    res.json({
      articles: [
        { id: 1, title: 'دليل أتمتة واتس آب الشامل', slug: 'whatsapp-automation-guide', category: 'تعليمي', status: 'published', lang: 'ar', views: 1234, date: '2026-04-05', image: '📱' },
        { id: 2, title: 'واتس آب بزنس vs واتس آب شخصي', slug: 'whatsapp-business-vs-personal', category: 'مقارنات', status: 'published', lang: 'ar', views: 856, date: '2026-04-04', image: '⚖️' },
        { id: 3, title: 'دليل المطاعم لزيادة الحجوزات', slug: 'restaurant-whatsapp-guide', category: 'مطاعم', status: 'published', lang: 'ar', views: 654, date: '2026-04-03', image: '🍽️' },
        { id: 4, title: 'زيادة المبيعات عبر واتس آب', slug: 'increase-sales-whatsapp', category: 'مبيعات', status: 'draft', lang: 'ar', views: 0, date: '2026-04-02', image: '💰' },
        { id: 5, title: 'Complete Guide to WhatsApp Automation', slug: 'whatsapp-automation-guide-en', category: 'Tutorial', status: 'published', lang: 'en', views: 456, date: '2026-04-05', image: '📱' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/articles', auth, adminOnly, async (req, res) => {
  try {
    const article = { id: Date.now(), ...req.body, date: new Date().toISOString().split('T')[0], views: 0 };
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/articles/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true, article: { id: req.params.id, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/articles/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== DOCS ======
/**
 * Documentation Management
 * Permission: adminOnly (owner/admin/manager)
 * Required permission: 'content' or 'all'
 */
router.get('/docs', auth, adminOnly, async (req, res) => {
  try {
    res.json({
      docs: [
        { id: 1, title: 'البدء مع AutoFlow', slug: 'getting-started', section: 'quick-start', status: 'published', lang: 'ar', readTime: '5 دقائق', order: 1 },
        { id: 2, title: 'إعداد الحساب', slug: 'account-setup', section: 'quick-start', status: 'published', lang: 'ar', readTime: '4 دقائق', order: 2 },
        { id: 3, title: 'أساسيات الردود التلقائية', slug: 'auto-reply-basics', section: 'auto-replies', status: 'published', lang: 'ar', readTime: '7 دقائق', order: 1 },
        { id: 4, title: 'أنواع المطابقة', slug: 'keyword-matching', section: 'auto-replies', status: 'published', lang: 'ar', readTime: '6 دقائق', order: 2 },
        { id: 5, title: 'خطط الأسعار', slug: 'pricing-plans', section: 'billing', status: 'published', lang: 'ar', readTime: '5 دقائق', order: 1 },
        { id: 6, title: 'Getting Started', slug: 'getting-started-en', section: 'quick-start', status: 'published', lang: 'en', readTime: '5 min', order: 1 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/docs', auth, adminOnly, async (req, res) => {
  try {
    const doc = { id: Date.now(), ...req.body };
    res.json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/docs/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true, doc: { id: req.params.id, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/docs/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== USERS ======
/**
 * User Management
 * Permission: adminOnly (owner/admin/manager)
 * Required permission: 'users' or 'all'
 * 
 * Operations:
 * - GET /users - List all users
 * - POST /users - Create new user
 * - PUT /users/:id - Update user (role, status)
 * - DELETE /users/:id - Delete user
 */
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    res.json({
      users: [
        { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', phone: '01012345678', role: 'admin', status: 'active', businessName: 'مطعم السعادة', businessType: 'restaurant', conversations: 156, lastActive: '2026-04-05', createdAt: '2026-01-15' },
        { id: 2, name: 'سارة أحمد', email: 'sara@example.com', phone: '01098765432', role: 'manager', status: 'active', businessName: 'عيادة الشفاء', businessType: 'clinic', conversations: 89, lastActive: '2026-04-04', createdAt: '2026-02-10' },
        { id: 3, name: 'محمد علي', email: 'mohamed@example.com', phone: '01055556666', role: 'agent', status: 'active', businessName: 'متجر الأناقة', businessType: 'ecommerce', conversations: 234, lastActive: '2026-04-03', createdAt: '2026-03-01' },
        { id: 4, name: 'فاطمة حسن', email: 'fatma@example.com', phone: '01077778888', role: 'agent', status: 'active', businessName: 'مكتب المحاماة', businessType: 'lawyer', conversations: 67, lastActive: '2026-04-05', createdAt: '2026-02-20' },
        { id: 5, name: 'خالد عمر', email: 'khaled@example.com', phone: '01099990000', role: 'viewer', status: 'inactive', businessName: 'شركة العقار', businessType: 'realestate', conversations: 45, lastActive: '2026-03-15', createdAt: '2026-01-25' },
        { id: 6, name: 'Mostafa Rawash', email: 'mostafa@rawash.com', phone: '01099129550', role: 'owner', status: 'active', businessName: 'AutoFlow', businessType: 'service', conversations: 500, lastActive: '2026-04-05', createdAt: '2026-01-01' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', auth, adminOnly, async (req, res) => {
  try {
    const user = { id: Date.now(), ...req.body, conversations: 0, lastActive: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString().split('T')[0] };
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true, user: { id: req.params.id, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ROLES ======
/**
 * Roles & Permissions Management
 * Permission: adminOnly (owner/admin/manager)
 * Required permission: 'roles' or 'all'
 * 
 * Roles hierarchy:
 * - owner (100): Full access
 * - admin (80): Full access
 * - manager (60): Users, content, analytics
 * - agent (40): Conversations, templates
 * - viewer (20): Read-only
 */
router.get('/roles', auth, adminOnly, async (req, res) => {
  try {
    res.json({
      roles: [
        { id: 1, name: 'مالك الحساب', nameEn: 'Owner', key: 'owner', description: 'صلاحيات كاملة على الحساب', color: 'red', permissions: ['all'], usersCount: 1 },
        { id: 2, name: 'مدير النظام', nameEn: 'Admin', key: 'admin', description: 'صلاحيات إدارية شاملة', color: 'purple', permissions: ['all'], usersCount: 2 },
        { id: 3, name: 'مشرف', nameEn: 'Manager', key: 'manager', description: 'إدارة المحتوى والمستخدمين', color: 'blue', permissions: ['users', 'content', 'analytics', 'subscriptions'], usersCount: 1 },
        { id: 4, name: 'وكيل', nameEn: 'Agent', key: 'agent', description: 'الرد على المحادثات والقوالب', color: 'green', permissions: ['conversations', 'templates', 'auto-replies'], usersCount: 3 },
        { id: 5, name: 'مشاهد', nameEn: 'Viewer', key: 'viewer', description: 'صلاحيات قراءة فقط', color: 'gray', permissions: ['view'], usersCount: 50 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/roles', auth, adminOnly, async (req, res) => {
  try {
    const role = { id: Date.now(), ...req.body, usersCount: 0 };
    res.json({ success: true, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/roles/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true, role: { id: req.params.id, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/roles/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== SUBSCRIPTIONS ======
/**
 * Subscription Management
 * Permission: adminOnly (owner/admin/manager)
 * Required permission: 'subscriptions' or 'all'
 */
router.get('/subscriptions', auth, adminOnly, async (req, res) => {
  try {
    res.json({
      plans: [
        { id: 1, name: 'الأساسية', nameEn: 'Basic', key: 'basic', price: 2000, priceUsd: 40, channels: 1, conversations: 500, users: 1, features: ['whatsapp', 'auto_replies', 'templates'], isPopular: false, status: 'active', subscribers: 45 },
        { id: 2, name: 'الاحترافية', nameEn: 'Professional', key: 'professional', price: 4000, priceUsd: 80, channels: 3, conversations: 2000, users: 5, features: ['whatsapp', 'auto_replies', 'templates', 'analytics', 'team', 'ai'], isPopular: true, status: 'active', subscribers: 28 },
        { id: 3, name: 'المؤسسات', nameEn: 'Enterprise', key: 'enterprise', price: 8000, priceUsd: 160, channels: 8, conversations: -1, users: -1, features: ['whatsapp', 'auto_replies', 'templates', 'analytics', 'team', 'api', 'integrations', 'broadcast', 'ai', 'support', 'custom_branding'], isPopular: false, status: 'active', subscribers: 12 }
      ],
      activeSubscriptions: [
        { id: 1, user: 'أحمد محمد', email: 'ahmed@example.com', plan: 'professional', status: 'active', startDate: '2026-03-01', endDate: '2026-04-01', amount: 4000 },
        { id: 2, user: 'سارة أحمد', email: 'sara@example.com', plan: 'basic', status: 'active', startDate: '2026-03-15', endDate: '2026-04-15', amount: 2000 },
        { id: 3, user: 'محمد علي', email: 'mohamed@example.com', plan: 'enterprise', status: 'active', startDate: '2026-02-01', endDate: '2026-05-01', amount: 24000 },
        { id: 4, user: 'فاطمة حسن', email: 'fatma@example.com', plan: 'basic', status: 'expired', startDate: '2026-01-15', endDate: '2026-02-15', amount: 2000 }
      ],
      revenue: { total: 34000, thisMonth: 18000, lastMonth: 16000 }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subscriptions/plans', auth, adminOnly, async (req, res) => {
  try {
    const plan = { id: Date.now(), ...req.body, subscribers: 0 };
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/subscriptions/plans/:id', auth, adminOnly, async (req, res) => {
  try {
    res.json({ success: true, plan: { id: req.params.id, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== INVOICES ======
/**
 * Invoice Management
 * Permission: adminOnly (owner/admin/manager)
 * Required permission: 'billing' or 'all'
 */
router.get('/invoices', auth, adminOnly, async (req, res) => {
  try {
    res.json({
      invoices: [
        { id: 'INV-001', user: 'أحمد محمد', email: 'ahmed@example.com', plan: 'الاحترافية', amount: 4000, status: 'paid', method: 'fawry', date: '2026-04-05', dueDate: '2026-04-05' },
        { id: 'INV-002', user: 'سارة أحمد', email: 'sara@example.com', plan: 'الأساسية', amount: 2000, status: 'paid', method: 'paymob', date: '2026-04-03', dueDate: '2026-04-03' },
        { id: 'INV-003', user: 'محمد علي', email: 'mohamed@example.com', plan: 'المؤسسات', amount: 24000, status: 'paid', method: 'bank', date: '2026-04-01', dueDate: '2026-04-01' },
        { id: 'INV-004', user: 'فاطمة حسن', email: 'fatma@example.com', plan: 'الأساسية', amount: 2000, status: 'pending', method: 'paymob', date: '2026-04-04', dueDate: '2026-04-06' },
        { id: 'INV-005', user: 'خالد عمر', email: 'khaled@example.com', plan: 'الاحترافية', amount: 4000, status: 'overdue', method: 'fawry', date: '2026-03-20', dueDate: '2026-03-25' },
        { id: 'INV-006', user: 'Mostafa Rawash', email: 'mostafa@rawash.com', plan: 'المؤسسات', amount: 8000, status: 'paid', method: 'paymob', date: '2026-04-05', dueDate: '2026-04-05' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ACTIVITY LOGS ======
/**
 * Activity Logs
 * Permission: adminOnly (owner/admin/manager)
 * Required permission: 'logs' or 'all'
 */
router.get('/logs', auth, adminOnly, async (req, res) => {
  try {
    res.json({
      logs: [
        { id: 1, type: 'auth', user: 'أحمد محمد', action: 'تسجيل دخول', details: 'IP: 192.168.1.1', date: '2026-04-05 12:30', ip: '192.168.1.1' },
        { id: 2, type: 'user', user: 'Admin', action: 'إنشاء مستخدم جديد', details: 'تم إنشاء مستخدم: سارة أحمد', date: '2026-04-05 11:45', ip: '192.168.1.100' },
        { id: 3, type: 'content', user: 'Admin', action: 'نشر مقال', details: 'دليل أتمتة واتس آب الشامل', date: '2026-04-05 10:30', ip: '192.168.1.100' },
        { id: 4, type: 'subscription', user: 'محمد علي', action: 'تجديد الاشتراك', details: 'خطة احترافية - 4000 ج.م', date: '2026-04-04 23:15', ip: '10.0.0.55' },
        { id: 5, type: 'conversation', user: 'نظام', action: 'رسالة تلقائية', details: 'تم إرسال 500 رسالة تلقائية', date: '2026-04-04 20:00', ip: '-' },
        { id: 6, type: 'system', user: 'نظام', action: 'نسخ احتياطي', details: 'تم إنشاء نسخة احتياطية', date: '2026-04-04 03:00', ip: '-' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;