const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/sithma-driving-school';

  // 1. Try primary connection (e.g. MongoDB Atlas) with 3s timeout
  if (primaryUri && !primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`\n[MongoDB Atlas Warning] Cloud cluster unreachable (${error.message}).`);
      console.warn(`👉 Automatically switching to local MongoDB database (mongodb://127.0.0.1:27017/sithma-driving-school) so you are never blocked!\n`);
    }
  }

  // 2. Seamless fallback to local MongoDB database
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Local] Connected successfully to host: ${conn.connection.host} (Database: sithma-driving-school)`);
  } catch (localError) {
    console.error(`[MongoDB Error] Failed to connect to local database: ${localError.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Disconnected from database');
});

mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Active connection ready');
});

module.exports = connectDB;
