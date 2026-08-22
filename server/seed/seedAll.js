require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Student = require('../models/Student');
const Package = require('../models/Package');
const Branch = require('../models/Branch');
const TimeSlot = require('../models/TimeSlot');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sithma_driving_school';

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected. Clearing previous collections...');

    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Package.deleteMany({}),
      Branch.deleteMany({}),
      TimeSlot.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
      QuizQuestion.deleteMany({}),
      QuizAttempt.deleteMany({}),
    ]);

    const salt = await bcrypt.genSalt(10);
    const standardPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    // 1. Create Branches
    console.log('[Seed] Creating 3 Operational Branches...');
    const branches = await Branch.insertMany([
      {
        name: 'Maharagama',
        address: 'High Level Road, Maharagama',
        contactPhone: '011-2849201',
      },
      {
        name: 'Werahara',
        address: 'Near DMT Central Office, Werahara',
        contactPhone: '011-2518492',
      },
      {
        name: 'Delgoda',
        address: 'Main Street, Delgoda',
        contactPhone: '011-2974820',
      },
    ]);

    // 2. Create Course Packages
    console.log('[Seed] Creating Course Packages (with 2+2 bonus rule)...');
    const packages = await Package.insertMany([
      {
        name: 'Car Full Package (Manual / Auto)',
        type: 'Car_Full',
        vehicleCategory: 'Light',
        lessons: 15,
        price: 45000,
        bonusLessons: { bike: 2, threeWheeler: 2 },
        eligibilityCriteria: 'Minimum 18 years old and DMT Medical Passed.',
        notes: 'Includes 2 free Bike + 2 free Three-Wheeler bonus lessons.',
      },
      {
        name: 'Heavy Vehicle (Bus / Lorry) Package',
        type: 'HeavyVehicle_Bus',
        vehicleCategory: 'Heavy',
        lessons: 20,
        price: 65000,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        eligibilityCriteria: 'Must hold Light Vehicle driving license for at least 2 full years.',
        notes: 'Commercial coach handling, air brake systems, and road trial preparation.',
      },
      {
        name: 'Motorcycle Standard Package',
        type: 'Bike',
        vehicleCategory: 'Light',
        lessons: 8,
        price: 18000,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        eligibilityCriteria: 'Minimum 17 years old with medical clearance.',
        notes: 'Clutch control, balance, and Figure-8 test preparation.',
      },
      {
        name: 'Three-Wheeler Package',
        type: 'ThreeWheeler',
        vehicleCategory: 'Light',
        lessons: 10,
        price: 22000,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        eligibilityCriteria: 'Minimum 18 years old and medical clearance.',
        notes: 'Three-wheeler steering, reverse parking, and road trial prep.',
      },
      {
        name: 'Car Refresher / Trial-Only Package',
        type: 'Car_Refresher',
        vehicleCategory: 'Light',
        lessons: 5,
        price: 15000,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        eligibilityCriteria: 'Must hold valid Learner permit.',
        notes: 'Fast-track trial revision for students already holding learner permits.',
      },
    ]);

    // 3. Create Users (Admin, Staff, 6 Instructors, Student)
    console.log('[Seed] Creating Staff, Instructors, and Admin users...');
    const adminUser = await User.create({
      name: 'Dr. Sithma Rajapaksha (Director)',
      email: 'admin@sithma.lk',
      passwordHash: adminPassword,
      role: 'admin',
      phone: '077-1000001',
      branch: 'Maharagama',
    });

    const staffMaharagama = await User.create({
      name: 'Nimali Fernando (Registrar)',
      email: 'staff.maharagama@sithma.lk',
      passwordHash: standardPassword,
      role: 'staff',
      phone: '077-2000002',
      branch: 'Maharagama',
    });

    const staffWerahara = await User.create({
      name: 'Chaminda Silva (Staff)',
      email: 'staff.werahara@sithma.lk',
      passwordHash: standardPassword,
      role: 'staff',
      phone: '077-2000003',
      branch: 'Werahara',
    });

    // 6 Instructors (2 per branch)
    const instructors = await User.insertMany([
      {
        name: 'Sunil Jayawardena (Senior Instructor)',
        email: 'instructor.sunil@sithma.lk',
        passwordHash: standardPassword,
        role: 'instructor',
        phone: '071-3000001',
        branch: 'Maharagama',
      },
      {
        name: 'Priyantha Kumara',
        email: 'instructor.priyantha@sithma.lk',
        passwordHash: standardPassword,
        role: 'instructor',
        phone: '071-3000002',
        branch: 'Maharagama',
      },
      {
        name: 'Samantha Perera',
        email: 'instructor.samantha@sithma.lk',
        passwordHash: standardPassword,
        role: 'instructor',
        phone: '071-3000003',
        branch: 'Werahara',
      },
      {
        name: 'Nuwan Bandara',
        email: 'instructor.nuwan@sithma.lk',
        passwordHash: standardPassword,
        role: 'instructor',
        phone: '071-3000004',
        branch: 'Werahara',
      },
      {
        name: 'Janaka Dissanayake',
        email: 'instructor.janaka@sithma.lk',
        passwordHash: standardPassword,
        role: 'instructor',
        phone: '071-3000005',
        branch: 'Delgoda',
      },
      {
        name: 'Rohan Wickramasinghe',
        email: 'instructor.rohan@sithma.lk',
        passwordHash: standardPassword,
        role: 'instructor',
        phone: '071-3000006',
        branch: 'Delgoda',
      },
    ]);

    // 4. Create Student User & Profile
    console.log('[Seed] Creating Demo Student (Kasun Perera)...');
    const studentUser = await User.create({
      name: 'Kasun Perera',
      email: 'student.kasun@gmail.com',
      passwordHash: standardPassword,
      role: 'student',
      phone: '077-7123456',
      branch: 'Maharagama',
    });

    const carPkg = packages[0];

    // Medical Date = 2 months ago, Learner Passed = 1 month ago
    const medicalDate = new Date();
    medicalDate.setMonth(medicalDate.getMonth() - 2);

    const learnerPassDate = new Date();
    learnerPassDate.setMonth(learnerPassDate.getMonth() - 1);

    const eligibleDate = new Date(learnerPassDate);
    eligibleDate.setMonth(eligibleDate.getMonth() + 3);

    const deadlineDate = new Date(learnerPassDate);
    deadlineDate.setMonth(deadlineDate.getMonth() + 18);

    const studentDoc = await Student.create({
      userId: studentUser._id,
      studentType: 'Type1_NewLearner',
      branch: 'Maharagama',
      dmtDates: {
        medicalExamDate: medicalDate,
        medicalExamPassed: true,
        learnerRegistrationDate: medicalDate,
        learnerExamDate: learnerPassDate,
        learnerExamPassed: true,
        learnerExamPassedDate: learnerPassDate,
      },
      package: {
        type: 'Car_Full',
        packageId: carPkg._id,
        lessonsTotal: carPkg.lessons,
        lessonsUsed: 3,
        priceTotal: carPkg.price,
        bonusLessons: {
          bike: 2,
          threeWheeler: 2,
        },
      },
      trial: {
        attempts: [],
        attemptsUsed: 0,
        eligibleFromDate: eligibleDate,
        deadlineDate: deadlineDate,
        licenseObtained: false,
      },
      registrationStatus: 'registered',
    });

    // 5. Create Time Slots and Bookings
    console.log('[Seed] Creating Sample Time Slots and Bookings...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const slot1 = await TimeSlot.create({
      branch: 'Maharagama',
      date: dateStr,
      startTime: '08:00',
      endTime: '09:00',
      vehicleCategory: 'Light',
      instructorId: instructors[0]._id,
      isBooked: true,
      bookedBy: studentDoc._id,
    });

    await TimeSlot.create({
      branch: 'Maharagama',
      date: dateStr,
      startTime: '10:00',
      endTime: '11:00',
      vehicleCategory: 'Light',
      instructorId: instructors[1]._id,
      isBooked: false,
    });

    await TimeSlot.create({
      branch: 'Maharagama',
      date: dateStr,
      startTime: '14:00',
      endTime: '15:00',
      vehicleCategory: 'Light',
      instructorId: instructors[0]._id,
      isBooked: false,
    });

    await Booking.create({
      studentId: studentDoc._id,
      timeSlotId: slot1._id,
      branch: 'Maharagama',
      vehicleType: 'Car',
      lessonType: 'regular',
      status: 'confirmed',
    });

    // 6. Create Verified Payment
    console.log('[Seed] Creating Initial Payment Record...');
    await Payment.create({
      studentId: studentDoc._id,
      userId: studentUser._id,
      packageId: carPkg._id,
      slipImageUrl: 'https://placehold.co/600x400/0B5FA5/FFFFFF?text=BOC+Deposit+Slip+Rs.+45000',
      amount: 45000,
      bankName: 'Bank of Ceylon (BOC)',
      transactionReference: 'BOC-TXN-2026-9021',
      status: 'confirmed',
      verifiedBy: staffMaharagama._id,
      verifiedAt: new Date(),
      uploadedAt: new Date(),
    });

    // 7. Create Sample In-App Notifications
    console.log('[Seed] Creating In-App Notifications...');
    await Notification.insertMany([
      {
        recipientId: studentUser._id,
        recipientRole: 'student',
        title: '🎉 Welcome to Sithma Driving School',
        message: 'Your registration has been confirmed. Medical test and Learner permit recorded.',
        type: 'system',
        link: '/student/dashboard',
        read: true,
      },
      {
        recipientId: studentUser._id,
        recipientRole: 'student',
        title: '✅ Payment Slip Verified',
        message: 'Your payment slip for Rs. 45,000 was verified by Nimali Fernando.',
        type: 'payment',
        link: '/student/payments',
        read: false,
      },
      {
        recipientId: studentUser._id,
        recipientRole: 'student',
        title: '⏱️ DMT Practical Trial Eligibility',
        message: `Your 3-month waiting period will complete on ${eligibleDate.toISOString().split('T')[0]}. Trial deadline: ${deadlineDate.toISOString().split('T')[0]}.`,
        type: 'dmt-date',
        link: '/student/dashboard',
        read: false,
      },
    ]);

    // 8. Create Multilingual Practice Question Bank
    console.log('[Seed] Creating Multilingual Question Bank (Sinhala, Tamil, English)...');
    await QuizQuestion.insertMany([
      {
        questionText: 'What is the maximum speed limit for motor cars on urban roads in Sri Lanka unless otherwise posted?',
        options: ['50 km/h', '70 km/h', '40 km/h', '60 km/h'],
        correctAnswerIndex: 0,
        explanation: 'Urban road speed limit for light vehicles in Sri Lanka is 50 km/h.',
        language: 'English',
        vehicleCategory: 'Light',
      },
      {
        questionText: 'What does a flashing amber traffic light indicate?',
        options: ['Stop immediately', 'Proceed with caution after checking both sides', 'Accelerate quickly', 'Road is closed'],
        correctAnswerIndex: 1,
        explanation: 'A flashing amber signal requires drivers to slow down and proceed with caution.',
        language: 'English',
        vehicleCategory: 'Light',
      },
      {
        questionText: 'What is the minimum legal following distance rule in normal dry weather conditions?',
        options: ['1 second rule', '2 second rule', '5 second rule', '10 meters constant'],
        correctAnswerIndex: 1,
        explanation: 'The 2-second rule provides adequate safe stopping distance in normal weather.',
        language: 'English',
        vehicleCategory: 'Light',
      },
      {
        questionText: 'නාගරික මාර්ගයක සැහැල්ලු මෝටර් රථයක් ධාවනය කළ හැකි උපරිම වේග සීමාව කොපමණද?',
        options: ['පැයට කිලෝමීටර් 50', 'පැයට කිලෝමීටර් 70', 'පැයට කිලෝමීටර් 40', 'පැයට කිලෝමීටර් 60'],
        correctAnswerIndex: 0,
        explanation: 'ශ්‍රී ලංකාවේ නාගරික ප්‍රදේශ වල සැහැල්ලු වාහන උපරිම වේගය පැ.කි.මී. 50 කි.',
        language: 'Sinhala',
        vehicleCategory: 'Light',
      },
      {
        questionText: 'කහ පැහැයෙන් නිවෙමින් දැල්වෙන (Flashing Amber) රථවාහන සංඥා එළියකින් අදහස් වන්නේ කුමක්ද?',
        options: ['වහාම නවතින්න', 'දෙපස විමසිලිමත්ව බලා ප්‍රවේශමෙන් ඉදිරියට යන්න', 'වේගය වැඩිකර යන්න', 'මාර්ගය වසා ඇත'],
        correctAnswerIndex: 1,
        explanation: 'කහ පැහැයෙන් නිවෙමින් දැල්වෙන එළියෙන් ප්‍රවේශමෙන් ගමන් කිරීමට උපදෙස් දෙයි.',
        language: 'Sinhala',
        vehicleCategory: 'Light',
      },
      {
        questionText: 'நகர வீதிகளில் மோட்டார் கார்களுக்கான அதிகபட்ச வேக வரம்பு யாது?',
        options: ['மணிக்கு 50 கி.மீ', 'மணிக்கு 70 கி.மீ', 'மணிக்கு 40 கி.மீ', 'மணிக்கு 60 கி.மீ'],
        correctAnswerIndex: 0,
        explanation: 'இலங்கையில் நகர்ப்புற வீதிகளில் மோட்டார் வாகனங்களுக்கு 50 கி.மீ/மணி வேக வரம்பு உள்ளது.',
        language: 'Tamil',
        vehicleCategory: 'Light',
      },
      {
        questionText: 'What is the required legal light vehicle license holding period before applying for a Heavy Vehicle driving license in Sri Lanka?',
        options: ['6 Months', '1 Year', '2 Years', '3 Years'],
        correctAnswerIndex: 2,
        explanation: 'DMT regulations mandate holding a Light Vehicle license for at least 2 full years before Heavy Vehicle testing.',
        language: 'English',
        vehicleCategory: 'Heavy',
      },
      {
        questionText: 'ශ්‍රී ලංකාවේ බර වාහන (බස්/ලොරි) රියදුරු බලපත්‍රයක් ලබාගැනීමට සැහැල්ලු වාහන බලපත්‍රය කොපමණ කාලයක් සතුව තිබිය යුතුද?',
        options: ['මාස 6ක්', 'වසර 1ක්', 'වසර 2ක්', 'වසර 3ක්'],
        correctAnswerIndex: 2,
        explanation: 'බර වාහන බලපත්‍රයක් සඳහා සැහැල්ලු වාහන බලපත්‍රය වසර 2ක් සපුරා තිබිය යුතුය.',
        language: 'Sinhala',
        vehicleCategory: 'Heavy',
      },
    ]);

    console.log('\n============================================================');
    console.log('✅ SITHMA DRIVING SCHOOL MANAGEMENT SYSTEM SEEDED SUCCESSFULLY!');
    console.log('============================================================');
    console.log('Demo Accounts:');
    console.log('1. Student:    student.kasun@gmail.com     / password123');
    console.log('2. Staff:      staff.maharagama@sithma.lk  / password123');
    console.log('3. Instructor: instructor.sunil@sithma.lk  / password123');
    console.log('4. Admin:      admin@sithma.lk             / admin123');
    console.log('============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
}

seed();
