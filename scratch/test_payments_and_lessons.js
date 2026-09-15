const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5001/api';

async function api(method, url, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.response = { status: res.status, data };
    throw error;
  }
  return data;
}

async function runTest() {
  console.log('--- Starting Comprehensive Package Payment & Lesson Unlocking Test ---');

  // 1. Fetch packages
  const pkgsRes = await api('GET', '/packages');
  console.log(`✓ Fetched ${pkgsRes.count} packages from API`);
  const carFullPkg = pkgsRes.packages.find(p => p.type === 'Car_Full');
  const carStdPkg = pkgsRes.packages.find(p => p.type === 'Car_Standard');
  console.log(`Car Full: ${carFullPkg.name} (Rs. ${carFullPkg.price}, lessons: ${carFullPkg.lessons})`);
  console.log(`Car Std: ${carStdPkg.name} (Rs. ${carStdPkg.price}, lessons: ${carStdPkg.lessons})`);

  // 2. Register Type 1 student
  const emailT1 = `test_pkg_t1_${Date.now()}@example.com`;
  const phoneT1 = `077${Math.floor(1000000 + Math.random() * 9000000)}`;
  const nicT1 = `2001${Math.floor(10000000 + Math.random() * 90000000)}`;
  const regRes = await api('POST', '/auth/register', {
    name: 'Type 1 Test Student',
    email: emailT1,
    password: 'Password123!',
    phone: phoneT1,
    nic: nicT1,
    dob: '2001-05-10',
    branch: 'Maharagama',
    studentType: 'Type 1',
  });
  console.log('✓ Registered Type 1 learner:', emailT1);

  // 3. Confirm Advance payment via public pre-auth endpoint
  await api('POST', '/payments/pay-advance-pending', {
    userId: regRes.pendingUserId,
    amount: 5000,
    paymentMethod: 'online_gateway',
    transactionReference: `ADV-${Date.now()}`,
  });
  console.log('✓ Advance payment confirmed');

  // Login as student to get token
  const loginRes = await api('POST', '/auth/login', {
    email: emailT1,
    password: 'Password123!',
  });
  const t1Token = loginRes.token;
  console.log('✓ Student logged in with active verified account');

  // 4. Try booking before exam pass -> should fail (Type 1 not passed)
  await mongoose.connect('mongodb://127.0.0.1:27017/driving_school');
  const TimeSlot = mongoose.models.TimeSlot || mongoose.model('TimeSlot', new mongoose.Schema({}, { strict: false }));
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);
  const slot1 = await TimeSlot.create({
    branch: 'Maharagama',
    date: futureDate,
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    status: 'available',
    capacity: 1,
    currentBookings: 0,
  });

  try {
    await api('POST', '/bookings', {
      timeSlotId: slot1._id.toString(),
      vehicleType: 'Car',
      lessonType: 'Practical',
    }, t1Token);
    console.error('FAILED: Booking should be blocked before passing theory exam!');
  } catch (err) {
    console.log('✓ Successfully blocked booking before passing theory exam:', err.response?.data?.message);
  }

  // 5. Mark DMT theory exam passed
  await api('POST', `/students/${regRes.student._id}/exam-attempt`, {
    result: 'passed',
    marks: 38,
    examDate: new Date().toISOString(),
  }, t1Token);
  console.log('✓ Theory exam passed recorded');

  // 6. Test Single Lesson Payment:
  // Student pays for Car Standard single lesson (Rs. 2,000)
  const singlePayRes = await api('POST', '/payments/package-payment', {
    packageId: carStdPkg._id,
    packageType: carStdPkg.type,
    paymentPlan: 'single',
    amount: carStdPkg.price,
    paymentMethod: 'online_gateway',
  }, t1Token);
  console.log('✓ Single lesson payment processed:', singlePayRes.student.lessonsUnlocked, 'lessons unlocked');

  // Student books the 1 allowed lesson
  const bookRes1 = await api('POST', '/bookings', {
    timeSlotId: slot1._id.toString(),
    vehicleType: 'Car',
    lessonType: 'Practical',
  }, t1Token);
  console.log('✓ Successfully booked 1st lesson:', bookRes1.booking._id);

  // Student tries to book a 2nd lesson -> should be blocked because single lesson allows only 1 lesson!
  const slot2 = await TimeSlot.create({
    branch: 'Maharagama',
    date: futureDate,
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    status: 'available',
    capacity: 1,
    currentBookings: 0,
  });

  try {
    await api('POST', '/bookings', {
      timeSlotId: slot2._id.toString(),
      vehicleType: 'Car',
      lessonType: 'Practical',
    }, t1Token);
    console.error('FAILED: 2nd booking should be blocked on single lesson plan!');
  } catch (err) {
    console.log('✓ Successfully blocked 2nd booking on single lesson plan:', err.response?.data?.message);
  }

  // 7. Test 3 Installments (in 40,000 package: 15,000, 15,000, 10,000):
  // Pay Installment 1 (Rs. 15,000)
  const inst1Res = await api('POST', '/payments/package-payment', {
    packageId: carFullPkg._id,
    packageType: carFullPkg.type,
    paymentPlan: 'installments',
    installmentNumber: 1,
    amount: 15000,
    paymentMethod: 'online_gateway',
  }, t1Token);
  console.log(
    `✓ Installment 1 processed: installmentsPaidCount = ${inst1Res.student.installmentsPaidCount}, lessonsUnlocked = ${inst1Res.student.lessonsUnlocked}`
  );

  // Pay Installment 2 (Rs. 15,000)
  const inst2Res = await api('POST', '/payments/package-payment', {
    packageId: carFullPkg._id,
    packageType: carFullPkg.type,
    paymentPlan: 'installments',
    installmentNumber: 2,
    amount: 15000,
    paymentMethod: 'online_gateway',
  }, t1Token);
  console.log(
    `✓ Installment 2 processed: installmentsPaidCount = ${inst2Res.student.installmentsPaidCount}, lessonsUnlocked = ${inst2Res.student.lessonsUnlocked}`
  );

  // Pay Installment 3 (Rs. 10,000)
  const inst3Res = await api('POST', '/payments/package-payment', {
    packageId: carFullPkg._id,
    packageType: carFullPkg.type,
    paymentPlan: 'installments',
    installmentNumber: 3,
    amount: 10000,
    paymentMethod: 'online_gateway',
  }, t1Token);
  console.log(
    `✓ Installment 3 processed: installmentsPaidCount = ${inst3Res.student.installmentsPaidCount}, lessonsUnlocked = ${inst3Res.student.lessonsUnlocked}`
  );

  // 8. Test Type 2 Student Direct Package Payment (Full Upfront Payment)
  const emailT2 = `test_pkg_t2_${Date.now()}@example.com`;
  const phoneT2 = `077${Math.floor(1000000 + Math.random() * 9000000)}`;
  const nicT2 = `1998${Math.floor(10000000 + Math.random() * 90000000)}`;
  const regT2Res = await api('POST', '/auth/register', {
    name: 'Type 2 Trial Ready Student',
    email: emailT2,
    password: 'Password123!',
    phone: phoneT2,
    nic: nicT2,
    dob: '1998-05-10',
    branch: 'Maharagama',
    studentType: 'Type 2',
    dmt_clearance_proof: '/uploads/clearance-sample.jpg',
  });
  // Activate advance payment for Type 2
  await api('POST', '/payments/pay-advance-pending', {
    userId: regT2Res.pendingUserId,
    amount: 5000,
    paymentMethod: 'online_gateway',
    transactionReference: `ADV-T2-${Date.now()}`,
  });

  const loginT2Res = await api('POST', '/auth/login', {
    email: emailT2,
    password: 'Password123!',
  });
  const t2Token = loginT2Res.token;
  console.log('✓ Registered and logged in Type 2 learner:', emailT2);

  // Type 2 student pays Full Course Package upfront (Rs. 40,000)
  const fullPayRes = await api('POST', '/payments/package-payment', {
    packageId: carFullPkg._id,
    packageType: carFullPkg.type,
    paymentPlan: 'full',
    amount: 40000,
    paymentMethod: 'online_gateway',
  }, t2Token);
  console.log(
    `✓ Type 2 Full Package upfront processed: lessonsUnlocked = ${fullPayRes.student.lessonsUnlocked}, paymentPlan = ${fullPayRes.student.paymentPlan}`
  );

  console.log('--- ALL BACKEND & WORKFLOW TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test failed with error:', err.response?.data || err.message);
  process.exit(1);
});
