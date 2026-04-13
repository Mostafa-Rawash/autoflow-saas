/**
 * Admin User Seeder
 * Creates default admin user for AutoFlow
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require(__dirname + '/../models/User');
const Role = require(__dirname + '/../models/Role');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoflow';
    
    // Try in-memory MongoDB if no local MongoDB
    if (!process.env.MONGODB_URI) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.log('📦 Using in-memory MongoDB');
      } catch (err) {
        console.log('⚠️  No MongoDB available');
      }
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Seed roles first
    await Role.seedDefaults();
    console.log('✅ Roles seeded');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@autoflow.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('   Email: admin@autoflow.com');
      console.log('   Role:', existingAdmin.role);
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Mostafa Rawash',
      email: 'admin@autoflow.com',
      phone: '+201099129550',
      password: 'Admin@123456',
      role: 'owner',
      isActive: true,
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        limits: {
          conversations: Infinity,
          messages: Infinity,
          templates: Infinity,
          autoReplies: Infinity,
          teamMembers: Infinity
        },
        usage: {
          conversations: 0,
          messages: 0,
          templates: 0,
          autoReplies: 0,
          teamMembers: 1
        }
      },
      channels: [{
        type: 'whatsapp',
        connected: false
      }],
      settings: {
        language: 'ar',
        timezone: 'Africa/Cairo',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    });

    await adminUser.save();
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📧 Email:    admin@autoflow.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👑 Role:     Owner (Full Access)');
    console.log('📦 Plan:     Enterprise (Unlimited)');
    console.log('');
    console.log('🌐 Dashboard: http://52.249.222.161:3000');
    console.log('🔧 Admin Panel: http://52.249.222.161:3000/admin');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();