const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Announcement = require('../models/Announcement');

dotenv.config();

let mongoServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';
  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
  try {
    console.log(`Seeder attempting connection to ${maskedUri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log(`Seeder connected to MongoDB at ${maskedUri}`);
  } catch (err) {
    console.warn(`Seeder connection to primary DB failed (${err.message}). Using MongoMemoryServer...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    try {
      mongoServerInstance = await MongoMemoryServer.create({ instance: { port: 27017, dbName: 'staffsync' } });
    } catch (e) {
      mongoServerInstance = await MongoMemoryServer.create({ instance: { dbName: 'staffsync' } });
    }
    const memUri = mongoServerInstance.getUri();
    await mongoose.connect(memUri);
    console.log(`Seeder connected to embedded MongoDB at ${memUri}`);
  }
};

const seedData = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Clear existing users and announcements
    await User.deleteMany({});
    await Announcement.deleteMany({});

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@staffsync.com',
      password: 'Password123!',
      role: 'admin',
      department: 'Management',
      position: 'HR Director',
      phone: '+1555019283'
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@staffsync.com',
      password: 'Password123!',
      role: 'manager',
      department: 'Engineering',
      position: 'Engineering Manager',
      phone: '+1555014829'
    });

    const employee = await User.create({
      name: 'Employee User',
      email: 'employee@staffsync.com',
      password: 'Password123!',
      role: 'employee',
      department: 'Engineering',
      position: 'Software Engineer',
      phone: '+1555019842'
    });

    await Announcement.create({
      title: 'Welcome to StaffSync HRM',
      content: 'We are excited to launch our new HR management platform. Please complete your profile and check in daily.',
      author: admin._id,
      targetDepartment: 'All',
      priority: 'high'
    });

    console.log('Database seeded successfully!');
    console.log('Demo Accounts:');
    console.log('  Admin:    admin@staffsync.com / Password123!');
    console.log('  Manager:  manager@staffsync.com / Password123!');
    console.log('  Employee: employee@staffsync.com / Password123!');

    if (shouldExit) {
      if (mongoServerInstance) {
        await mongoServerInstance.stop();
      }
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
