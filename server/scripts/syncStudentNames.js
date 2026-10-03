const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Student = require('../models/Student');
const User = require('../models/User');

async function syncNames() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database!');

    const students = await Student.find({}).populate('userId');
    console.log(`Found ${students.length} student documents in MongoDB.`);

    let updatedCount = 0;
    for (const student of students) {
      const u = student.userId;
      if (!u) {
        console.warn(`Student ${student._id} has no valid populated userId`);
        continue;
      }

      const updates = {
        name: u.name || '',
        studentName: u.name || '',
      };

      if (u.email) updates.email = u.email;
      if (u.phone) updates.phone = u.phone;

      await Student.updateOne({ _id: student._id }, { $set: updates });
      updatedCount++;
      console.log(`✓ Synced student ${student._id} (${student.nic}) -> name: "${u.name}"`);
    }

    console.log(`\nAll done! Successfully updated ${updatedCount} students in MongoDB.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
}

syncNames();
