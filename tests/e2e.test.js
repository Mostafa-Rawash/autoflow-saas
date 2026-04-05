// E2E Test Scenarios
// Run with: npx cypress run

describe('AutoFlow E2E Tests', () => {
  
  beforeEach(() => {
    cy.visit('/');
  });
  
  // ========================================
  // LANDING PAGE TESTS
  // ========================================
  
  describe('Landing Page', () => {
    it('loads successfully', () => {
      cy.get('h1').should('contain', 'AutoFlow');
    });
    
    it('displays Arabic content by default', () => {
      cy.get('body').should('have.attr', 'dir', 'rtl');
    });
    
    it('navigates to pricing page', () => {
      cy.contains('الأسعار').click();
      cy.url().should('include', '/pricing');
    });
    
    it('shows WhatsApp floating button', () => {
      cy.get('[data-testid="whatsapp-float"]').should('exist');
    });
    
    it('pricing displays 2000 EGP starter plan', () => {
      cy.visit('/pricing/ar/');
      cy.contains('2,000').should('exist');
    });
  });
  
  // ========================================
  // AUTHENTICATION TESTS
  // ========================================
  
  describe('Authentication', () => {
    it('shows login form', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
    });
    
    it('validates required fields', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').click();
      cy.contains('مطلوب').should('exist');
    });
    
    it('registers new user', () => {
      cy.visit('/register');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[type="email"]').type(`test${Date.now()}@example.com`);
      cy.get('input[type="password"]').type('TestPass123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/');
    });
    
    it('persists auth across refresh', () => {
      cy.login();
      cy.reload();
      cy.url().should('include', '/');
      cy.get('[data-testid="user-name"]').should('exist');
    });
  });
  
  // ========================================
  // DASHBOARD TESTS
  // ========================================
  
  describe('Dashboard', () => {
    beforeEach(() => {
      cy.login();
    });
    
    it('shows stats cards', () => {
      cy.get('[data-testid="stat-card"]').should('have.length.at.least', 3);
    });
    
    it('displays recent conversations', () => {
      cy.contains('أحدث المحادثات').should('exist');
    });
    
    it('shows channel breakdown', () => {
      cy.contains('واتس آب').should('exist');
    });
  });
  
  // ========================================
  // CONVERSATIONS TESTS
  // ========================================
  
  describe('Conversations', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/conversations');
    });
    
    it('shows conversation list', () => {
      cy.get('[data-testid="conversation-item"]').should('exist');
    });
    
    it('filters by status', () => {
      cy.get('[data-testid="status-filter"]').select('active');
      cy.url().should('include', 'status=active');
    });
    
    it('opens conversation detail', () => {
      cy.get('[data-testid="conversation-item"]').first().click();
      cy.url().should('match', /\/conversations\/[a-zA-Z0-9]+/);
    });
  });
  
  // ========================================
  // AUTO-REPLIES TESTS
  // ========================================
  
  describe('Auto-Replies', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/auto-replies');
    });
    
    it('shows auto-reply list', () => {
      cy.contains('الردود التلقائية').should('exist');
    });
    
    it('creates new auto-reply', () => {
      cy.contains('قاعدة جديدة').click();
      cy.get('[data-testid="rule-name"]').type('Test Rule');
      cy.get('[data-testid="keywords"]').type('مرحبا, أهلا');
      cy.get('[data-testid="response"]').type('أهلاً بك!');
      cy.get('button[type="submit"]').click();
      cy.contains('تم إنشاء').should('exist');
    });
    
    it('toggles auto-reply status', () => {
      cy.get('[data-testid="toggle-switch"]').first().click();
      cy.contains('تم التحديث').should('exist');
    });
  });
  
  // ========================================
  // TEMPLATES TESTS
  // ========================================
  
  describe('Templates', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/templates');
    });
    
    it('shows template list', () => {
      cy.contains('القوالب').should('exist');
    });
    
    it('filters by category', () => {
      cy.get('[data-testid="category-filter"]').select('ترحيب');
    });
    
    it('copies template', () => {
      cy.get('[data-testid="copy-btn"]').first().click();
      cy.contains('تم النسخ').should('exist');
    });
  });
  
  // ========================================
  // CHANNELS TESTS
  // ========================================
  
  describe('Channels', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/channels');
    });
    
    it('shows WhatsApp as active', () => {
      cy.contains('واتس آب')
        .parents('[data-testid="channel-card"]')
        .should('not.have.class', 'disabled');
    });
    
    it('shows other channels as disabled', () => {
      cy.contains('ماسنجر')
        .parents('[data-testid="channel-card"]')
        .should('have.class', 'disabled');
    });
    
    it('connects WhatsApp via QR', () => {
      cy.contains('توصيل واتس آب').click();
      cy.get('[data-testid="qr-code"]').should('exist');
    });
  });
  
  // ========================================
  // ANALYTICS TESTS
  // ========================================
  
  describe('Analytics', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/analytics');
    });
    
    it('shows KPI cards', () => {
      cy.contains('المحادثات').should('exist');
      cy.contains('الرسائل').should('exist');
    });
    
    it('displays charts', () => {
      cy.get('[data-testid="chart-container"]').should('exist');
    });
    
    it('exports report', () => {
      cy.contains('تصدير').click();
    });
  });
  
  // ========================================
  // SUBSCRIPTION TESTS
  // ========================================
  
  describe('Subscription', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/subscription');
    });
    
    it('shows current plan', () => {
      cy.contains('خطتك الحالية').should('exist');
    });
    
    it('displays pricing cards', () => {
      cy.contains('2,000').should('exist');
      cy.contains('4,000').should('exist');
      cy.contains('8,000').should('exist');
    });
    
    it('shows upgrade button', () => {
      cy.contains('ترقية').should('exist');
    });
  });
  
  // ========================================
  // ADMIN TESTS
  // ========================================
  
  describe('Admin Dashboard', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/admin');
    });
    
    it('shows admin overview', () => {
      cy.contains('لوحة تحكم المدير').should('exist');
    });
    
    it('displays user count', () => {
      cy.contains('المستخدمين').should('exist');
    });
    
    it('shows revenue stats', () => {
      cy.contains('الإيرادات').should('exist');
    });
  });
  
  describe('Admin Users', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/admin/users');
    });
    
    it('shows user list', () => {
      cy.get('[data-testid="user-row"]').should('exist');
    });
    
    it('filters users', () => {
      cy.get('[data-testid="role-filter"]').select('admin');
    });
    
    it('opens create user modal', () => {
      cy.contains('مستخدم جديد').click();
      cy.get('[data-testid="user-modal"]').should('exist');
    });
  });
  
  describe('Admin Articles', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/admin/articles');
    });
    
    it('shows article list', () => {
      cy.get('[data-testid="article-row"]').should('exist');
    });
    
    it('filters by language', () => {
      cy.get('[data-testid="lang-filter"]').select('ar');
    });
    
    it('creates new article', () => {
      cy.contains('مقال جديد').click();
      cy.get('[data-testid="article-modal"]').should('exist');
    });
  });
  
  describe('System Health', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/system-health');
    });
    
    it('shows service status', () => {
      cy.contains('حالة النظام').should('exist');
    });
    
    it('displays API health', () => {
      cy.contains('API Server').should('exist');
    });
    
    it('shows WhatsApp status', () => {
      cy.contains('واتس آب').should('exist');
    });
  });
  
  // ========================================
  // MOBILE TESTS
  // ========================================
  
  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });
    
    it('shows mobile menu', () => {
      cy.login();
      cy.get('[data-testid="mobile-menu-btn"]').click();
      cy.get('[data-testid="sidebar"]').should('be.visible');
    });
    
    it('cards stack vertically', () => {
      cy.login();
      cy.get('[data-testid="stat-card"]').first()
        .should('have.css', 'width')
        .and('match', /100%/);
    });
  });
  
  // ========================================
  // ARABIC/RTL TESTS
  // ========================================
  
  describe('Arabic & RTL', () => {
    it('displays Arabic text correctly', () => {
      cy.login();
      cy.contains('لوحة التحكم').should('exist');
      cy.contains('المحادثات').should('exist');
    });
    
    it('applies RTL direction', () => {
      cy.get('html').should('have.attr', 'dir', 'rtl');
    });
    
    it('aligns text right', () => {
      cy.get('body').should('have.css', 'text-align', 'right');
    });
  });
});

// Custom Commands
Cypress.Commands.add('login', () => {
  cy.visit('/login');
  cy.get('input[type="email"]').type('test@example.com');
  cy.get('input[type="password"]').type('TestPass123!');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/');
});

export {};