const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers (Google & Cloudflare) to resolve MongoDB Atlas SRV without ISP ECONNREFUSED
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('[DNS Warning] Could not set custom DNS servers:', e.message);
}

let isConnecting = false;
let retryTimer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting) {
    return;
  }
  isConnecting = true;

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  const primaryUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/sithma-driving-school';

  // 1. Try primary connection (e.g. MongoDB Atlas) with 15s timeout
  if (primaryUri && !primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
      console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
      isConnecting = false;
      return;
    } catch (error) {
      console.warn(`\n[MongoDB Atlas Warning] Cloud cluster unreachable (${error.message}).`);
      console.warn(`👉 Attempting fallback to local MongoDB database (mongodb://127.0.0.1:27017/sithma-driving-school)...\n`);
    }
  }

  // 2. Fallback to local MongoDB database
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Local] Connected successfully to host: ${conn.connection.host} (Database: sithma-driving-school)`);
    isConnecting = false;
    return;
  } catch (localError) {
    console.error(`[MongoDB Error] Failed to connect to local database: ${localError.message}`);
  }

  isConnecting = false;

  // 3. If both failed, schedule automatic retry in 5s
  if (mongoose.connection.readyState !== 1) {
    console.warn('[MongoDB] Database is currently unreachable. Scheduling reconnection retry in 5 seconds...');
    retryTimer = setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Disconnected from database. Scheduling reconnect in 5 seconds...');
  if (!retryTimer && mongoose.connection.readyState !== 1) {
    retryTimer = setTimeout(() => {
      connectDB();
    }, 5000);
  }
});

mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Active connection ready');
});

module.exports = connectDB;

