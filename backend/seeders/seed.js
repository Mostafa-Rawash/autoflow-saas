/**
 * Database Seed Script
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Subscription = require('./models/Subscription');
const Template = require('./models/Template');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Seed Roles
    console.log('📦 Seeding roles...');
    await Role.seedDefaults();
    console.log('✅ Roles seeded');

    // Create admin user if SUPER_ADMIN_EMAIL is set
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (adminEmail) {
      console.log(`👤 Checking for admin user: ${adminEmail}`);
      let adminUser = await User.findOne({ email: adminEmail });
      
      if (!adminUser) {
        console.log('Creating admin user...');
        adminUser = new User({
          name: 'Admin',
          email: adminEmail,
          password: process.env.SUPER_ADMIN_PASSWORD || 'Admin123!',
          role: 'admin',
          subscription: {
            plan: 'premium',
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          },
          settings: {
            language: 'ar',
            timezone: 'Africa/Cairo',
            notifications: {
              email: true,
              sms: false,
              push: true
            }
          }
        });
        await adminUser.save();
        console.log('✅ Admin user created');
        
        // Create premium subscription
        const subscription = new Subscription({
          user: adminUser._id,
          plan: 'premium',
          status: 'active',
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          amount: 0
        });
        await subscription.save();
        console.log('✅ Premium subscription created');
      } else {
        console.log('ℹ️  Admin user already exists');
      }
    }

    // Create default templates
    console.log('📝 Creating default templates...');
    const defaultTemplates = [
      {
        name: 'ترحيب بالعميل الجديد',
        category: 'greeting',
        channel: 'all',
        content: {
          text: 'مرحباً {{name}}! 👋\n\nشكراً لتواصلك معنا. نحن هنا لمساعدتك في أي استفسار.\n\nيمكنك الرد على هذه الرسالة أو استخدام القائمة أدناه.',
          variables: ['name']
        },
        language: 'ar'
      },
      {
        name: 'رسالة المتابعة',
        category: 'follow_up',
        channel: 'all',
        content: {
          text: 'مرحباً {{name}}! 🌟\n\nنود التأكد من أنك راضٍ عن خدماتنا. هل هناك أي شيء يمكننا مساعدتك به؟',
          variables: ['name']
        },
        language: 'ar'
      },
      {
        name: 'تذكير بالموعد',
        category: 'reminder',
        channel: 'all',
        content: {
          text: 'تذكير: لديك موعد غداً الساعة {{time}} 📅\n\nيرجى تأكيد الحضور أو إلغاء الموعد قبل 24 ساعة.',
          variables: ['time']
        },
        language: 'ar'
      },
      {
        name: 'ساعات العمل',
        category: 'faq',
        channel: 'all',
        content: {
          text: 'ساعات العمل:\n📅 السبت - الخميس\n🕐 9:00 ص - 6:00 م\n\nللمساعدة العاجلة، يرجى الاتصال على {{phone}}',
          variables: ['phone']
        },
        language: 'ar'
      },
      {
        name: 'Welcome Message',
        category: 'greeting',
        channel: 'all',
        content: {
          text: 'Hello {{name}}! 👋\n\nThank you for reaching out. We\'re here to help with any questions.\n\nFeel free to reply to this message or use the menu below.',
          variables: ['name']
        },
        language: 'en'
      }
    ];

    for (const templateData of defaultTemplates) {
      const existing = await Template.findOne({ name: templateData.name });
      if (!existing) {
        // Create as system template (not tied to a user)
        // For now, we'll skip if no admin user
        if (adminEmail) {
          const admin = await User.findOne({ email: adminEmail });
          if (admin) {
            const template = new Template({
              ...templateData,
              user: admin._id
            });
            await template.save();
          }
        }
      }
    }
    console.log('✅ Default templates created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSummary:');
    console.log(`- Roles: 5 (owner, admin, manager, agent, viewer)`);
    if (adminEmail) {
      console.log(`- Admin: ${adminEmail}`);
      console.log(`- Subscription: Premium`);
    }
    console.log(`- Templates: ${defaultTemplates.length} default`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();