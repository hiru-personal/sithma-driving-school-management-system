require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Package = require('../models/Package');
const Branch = require('../models/Branch');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sithma-driving-school';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // 1. Clear existing seed collections
    await User.deleteMany({});
    await Student.deleteMany({});
    await Package.deleteMany({});
    await Branch.deleteMany({});

    console.log('[Seed] Cleared old records');

    // 2. Seed Packages
    const packages = await Package.insertMany([
      {
        name: 'Car — Full License Package',
        type: 'Car_Full',
        vehicleCategory: 'Light',
        lessons: 15,
        price: 45000,
        bonusLessons: { bike: 2, threeWheeler: 2 },
        eligibilityCriteria: 'None',
        notes: 'Includes 2 free Three-Wheeler lessons and 2 free Bike lessons as a bonus.',
      },
      {
        name: 'Car — Refresher Package',
        type: 'Car_Refresher',
        vehicleCategory: 'Light',
        lessons: 6,
        price: 15000,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        eligibilityCriteria: 'Existing Car License holders',
        notes: 'For students who already hold a Car license and need refresher practice.',
      },
      {
        name: 'Bike (Standalone Lessons)',
        type: 'Bike',
        vehicleCategory: 'Light',
        lessons: 1,
        price: 850,
        isPerLesson: true,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        eligibilityCriteria: 'None',
        notes: 'Rs. 850 per lesson. Students can choose any number of lessons.',
      },
      {
        name: 'Three-Wheeler (Standalone Lessons)',
        type: 'ThreeWheeler',
        vehicleCategory: 'Light',
        lessons: 1,
        price: 1000,
        isPerLesson: true,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        eligibilityCriteria: 'None',
        notes: 'Rs. 1,000 per lesson. Students can choose any number of lessons.',
      },
      {
        name: 'Heavy Vehicle (Bus) Package',
        type: 'HeavyVehicle_Bus',
        vehicleCategory: 'Heavy',
        lessons: 15,
        price: 65000,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        eligibilityCriteria: 'Must have held Light Vehicle license for 2+ years',
        notes: '15 lessons. Strict requirement: minimum 2 years on a Light Vehicle license.',
      },
    ]);

    // 3. Seed Instructors & Staff Users
    const passwordHash = await User.hashPassword('password123');
    const adminPasswordHash = await User.hashPassword('admin123');

    const adminUser = await User.create({
      name: 'Hiruni Dissanayake (Manager)',
      email: 'admin@sithma.lk',
      phone: '0712345678',
      passwordHash: adminPasswordHash,
      role: 'admin',
      branch: 'All',
    });

    const staffMaharagama = await User.create({
      name: 'Anura Bandara (Data Entry Officer)',
      email: 'staff.maharagama@sithma.lk',
      phone: '0772345678',
      passwordHash,
      role: 'staff',
      branch: 'Maharagama',
    });

    const staffWerahara = await User.create({
      name: 'Nimali Senanayake (Data Entry Officer)',
      email: 'staff.werahara@sithma.lk',
      phone: '0782345678',
      passwordHash,
      role: 'staff',
      branch: 'Werahara',
    });

    const instructor1 = await User.create({
      name: 'Sunil Weerasinghe (Senior Instructor)',
      email: 'instructor.sunil@sithma.lk',
      phone: '0773345678',
      passwordHash,
      role: 'instructor',
      branch: 'Maharagama',
    });

    const instructor2 = await User.create({
      name: 'Kamal Jayawardena (Instructor)',
      email: 'instructor.kamal@sithma.lk',
      phone: '0774345678',
      passwordHash,
      role: 'instructor',
      branch: 'Werahara',
    });

    // 4. Seed Branches
    await Branch.insertMany([
      {
        name: 'Maharagama',
        address: 'High Level Road, Maharagama',
        contactPhone: '0112850123',
        instructorIds: [instructor1._id],
        dailySessionSlots: 3,
        sessionDurationMinutes: 60,
      },
      {
        name: 'Werahara',
        address: 'Near DMT Main Office, Werahara',
        contactPhone: '0112519876',
        instructorIds: [instructor2._id],
        dailySessionSlots: 3,
        sessionDurationMinutes: 60,
      },
      {
        name: 'Delgoda',
        address: 'Main Town Street, Delgoda',
        contactPhone: '0112445566',
        instructorIds: [],
        dailySessionSlots: 3,
        sessionDurationMinutes: 60,
      },
    ]);

    // 5. Seed Demo Students
    // Demo Student 1: Kasun Perera (Type 1 New Learner - In Progress)
    const studentUser1 = await User.create({
      name: 'Kasun Perera',
      email: 'student.kasun@gmail.com',
      phone: '0779988776',
      passwordHash,
      role: 'student',
      branch: 'Maharagama',
    });

    const examPassDate = new Date();
    examPassDate.setMonth(examPassDate.getMonth() - 1); // passed 1 month ago

    await Student.create({
      userId: studentUser1._id,
      studentType: 'Type1_NewLearner',
      branch: 'Maharagama',
      dmtDates: {
        medicalExamDate: new Date('2026-06-10'),
        medicalExamPassed: true,
        learnerRegistrationDate: new Date('2026-06-15'),
        learnerExamDate: examPassDate,
        learnerExamPassed: true,
        learnerExamPassedDate: examPassDate,
      },
      trial: {
        attempts: [
          {
            attemptNumber: 1,
            date: new Date('2026-08-15'),
            result: 'pending',
            examinerNotes: 'Slot booked for practical road trial',
          },
        ],
        attemptsUsed: 1,
      },
      package: {
        type: 'Car_Full',
        packageId: packages[0]._id,
        lessonsTotal: 15,
        lessonsUsed: 7,
        priceTotal: 45000,
        bonusLessons: { bike: 2, threeWheeler: 2 },
      },
      registrationStatus: 'registered',
    });

    // Demo Student 2: Dinuka Silva (Type 2 Trial Ready)
    const studentUser2 = await User.create({
      name: 'Dinuka Silva',
      email: 'dinuka.trial@gmail.com',
      phone: '0715566778',
      passwordHash,
      role: 'student',
      branch: 'Werahara',
    });

    await Student.create({
      userId: studentUser2._id,
      studentType: 'Type2_TrialReady',
      branch: 'Werahara',
      dmtDates: {
        learnerExamPassed: true,
        learnerExamPassedDate: new Date('2026-05-01'),
      },
      trial: {
        attempts: [
          {
            attemptNumber: 1,
            date: new Date('2026-07-20'),
            result: 'failed',
            examinerNotes: 'Failed parallel reverse parking test',
          },
        ],
        attemptsUsed: 1,
      },
      package: {
        type: 'Car_Refresher',
        packageId: packages[1]._id,
        lessonsTotal: 6,
        lessonsUsed: 2,
        priceTotal: 15000,
        bonusLessons: { bike: 0, threeWheeler: 0 },
      },
      registrationStatus: 'registered',
    });

    console.log('[Seed] Successfully seeded all initial branches, packages, and demo accounts!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
