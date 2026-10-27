const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';
  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');

  try {
    console.log(`Attempting connection to MongoDB at: ${maskedUri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`Connected to MongoDB successfully at ${maskedUri}`);
  } catch (err) {
    console.warn(`Primary MongoDB connection to ${maskedUri} failed (${err.message}).`);
    console.log('Initializing embedded MongoMemoryServer fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      try {
        mongoServer = await MongoMemoryServer.create({ instance: { port: 27017, dbName: 'staffsync' } });
      } catch (portErr) {
        mongoServer = await MongoMemoryServer.create({ instance: { dbName: 'staffsync' } });
      }
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      console.log(`Embedded MongoDB started successfully at ${memUri}`);
    } catch (memErr) {
      console.error('Could not connect to MongoDB or start embedded server:', memErr.message);
      // Do not crash, keep express responsive so health check reports status
    }
  }

  // Ensure demo accounts exist
  try {
    if (mongoose.connection.readyState === 1) {
      const User = require('./src/models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('No users found in database. Auto-seeding default demo accounts...');
        const { seedData } = require('./src/seeders/seed');
        await seedData(false);
      }
    }
  } catch (seedErr) {
    console.error('Auto-seed check warning:', seedErr.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/employees', require('./src/routes/employees'));
app.use('/api/leaves', require('./src/routes/leaves'));
app.use('/api/attendance', require('./src/routes/attendance'));
app.use('/api/announcements', require('./src/routes/announcements'));

// 404 Handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => console.log(`StaffSync Server running on port ${PORT}`));
}

// Graceful shutdown
const shutdown = async () => {
  console.log('Gracefully shutting down StaffSync backend...');
  if (server) {
    server.close();
  }
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (e) {
    // Ignore error on exit
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
