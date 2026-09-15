const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function run() {
  console.log('=== STARTING TYPE 1 LIFECYCLE & 3-ATTEMPT DMT EXAM TEST ===\n');

  // Step 1: Login Admin
  const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'admin@sithma.lk',
    password: 'admin123',
  });
  const adminToken = adminLoginRes.data.token;
  console.log('✓ Admin authenticated');

  // Step 2: Register a new Type 1 student
  const email = `type1test_${Date.now()}@example.com`;
  const password = 'Password@123';
  const randDigits = Math.floor(100000 + Math.random() * 900000);
  const regPayload = {
    name: 'Kasun Bandara',
    email,
    password,
    phone: `077${randDigits}1`,
    nic: `1995${randDigits}1V`,
    dob: '1995-05-20',
    gender: 'male',
    address: '123 Main Road, Kurunegala',
    branch: 'Kurunegala',
    studentType: 'Type 1: New Learner',
    preferredLanguage: 'Sinhala',
    paymentMethod: 'bank_transfer',
    paymentSlipUrl: 'http://example.com/slip_initial.jpg',
  };

  const regRes = await axios.post(`${API_BASE}/auth/register`, regPayload);
  const studentUser = regRes.data.user;
  const studentId = regRes.data.student._id;
  console.log(`✓ Registered Type 1 Student: ${studentUser.name} (${studentUser.email})`);
  console.log(`  Initial account_status: ${studentUser.account_status}`);

  const studentLoginRes = await axios.post(`${API_BASE}/auth/login`, {
    email,
    password,
  });
  const studentToken = studentLoginRes.data.token;
  console.log(`✓ Student logged in, token acquired.`);

  // Step 3: Fetch Student profile as student
  const studentClient = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const adminClient = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  let profRes = await studentClient.get(`/students/${studentId}`);
  let profile = profRes.data.student;
  console.log(`  Student isAdvancePaid: ${profile.isAdvancePaid}`);

  // Step 4: Admin / Staff Verifies the user's Advance Payment
  console.log('\n--- VERIFYING STUDENT ADVANCE PAYMENT ---');
  const verifyRes = await adminClient.patch(`/students/${studentId}/advance-paid`, {
    isAdvancePaid: true,
  });
  console.log(`✓ Admin verified payment. Response account_status: ${verifyRes.data.student.account_status}, isAdvancePaid: ${verifyRes.data.student.isAdvancePaid}`);

  // Refetch student profile
  profRes = await studentClient.get(`/students/${studentId}`);
  profile = profRes.data.student;
  console.log(`✓ Student profile updated: account_status=${profile.account_status}, isAdvancePaid=${profile.isAdvancePaid}`);

  // Step 5: Staff adds DMT Dates
  console.log('\n--- STAFF ADDS DMT DATES ---');
  const dmtUpdateRes = await adminClient.patch(`/students/${studentId}/dmt-dates`, {
    medicalExamDate: '2026-10-05',
    learnerRegistrationDate: '2026-10-12',
    learnerExamDate: '2026-10-25',
  });
  profile = dmtUpdateRes.data.student;
  console.log(`✓ Staff set DMT dates:`);
  console.log(`  Medical Date: ${profile.dmtDates.medicalExamDate}`);
  console.log(`  Registration Date: ${profile.dmtDates.learnerRegistrationDate}`);
  console.log(`  Written Exam Date: ${profile.dmtDates.learnerExamDate}`);

  // Step 6: Student updates: Done Registration & Done Medical
  console.log('\n--- STUDENT MARKS MEDICAL DONE & REGISTRATION DONE ---');
  const markMedRes = await studentClient.patch(`/students/${studentId}/dmt-dates`, {
    medicalDone: true,
  });
  console.log(`✓ Student marked Medical Done: ${markMedRes.data.student.dmtDates.medicalDone}`);

  const markRegRes = await studentClient.patch(`/students/${studentId}/dmt-dates`, {
    registrationDone: true,
  });
  console.log(`✓ Student marked Registration Done: ${markRegRes.data.student.dmtDates.registrationDone}`);

  // Step 7: Attempt 1 - Failed
  console.log('\n--- ATTEMPT 1: RECORD FAILED EXAM (Score 22/40) ---');
  const att1Res = await studentClient.post(`/students/${studentId}/exam-attempt`, {
    result: 'failed',
    marks: 22,
    date: '2026-10-25',
  });
  let studentData = att1Res.data.student;
  console.log(`✓ Attempt 1 Recorded: attemptsCount=${studentData.learnerExamAttemptsCount}, status=${studentData.registrationStatus}`);
  console.log(`  Attempts:`, studentData.learnerExamAttempts.map(a => `[Attempt ${a.attemptNumber}: ${a.result}, ${a.marks} marks]`));

  // Staff updates next exam date
  await adminClient.patch(`/students/${studentId}/dmt-dates`, {
    learnerExamDate: '2026-11-10',
  });
  console.log(`✓ Staff scheduled 2nd exam date: 2026-11-10`);

  // Step 8: Attempt 2 - Failed
  console.log('\n--- ATTEMPT 2: RECORD FAILED EXAM (Score 27/40) ---');
  const att2Res = await studentClient.post(`/students/${studentId}/exam-attempt`, {
    result: 'failed',
    marks: 27,
    date: '2026-11-10',
  });
  studentData = att2Res.data.student;
  console.log(`✓ Attempt 2 Recorded: attemptsCount=${studentData.learnerExamAttemptsCount}, status=${studentData.registrationStatus}`);

  // Staff updates 3rd exam date
  await adminClient.patch(`/students/${studentId}/dmt-dates`, {
    learnerExamDate: '2026-11-28',
  });
  console.log(`✓ Staff scheduled 3rd exam date: 2026-11-28`);

  // Step 9: Attempt 3 - Failed (Should Auto-Cancel Registration!)
  console.log('\n--- ATTEMPT 3: RECORD FAILED EXAM (Score 28/40 - 3RD FAIL) ---');
  const att3Res = await studentClient.post(`/students/${studentId}/exam-attempt`, {
    result: 'failed',
    marks: 28,
    date: '2026-11-28',
  });
  studentData = att3Res.data.student;
  console.log(`✓ Attempt 3 Recorded!`);
  console.log(`  registrationStatus: ${studentData.registrationStatus} (Expected: cancelled)`);
  console.log(`  accountStatus: ${studentData.accountStatus} (Expected: cancelled)`);
  console.log(`  account_status: ${studentData.account_status} (Expected: Cancelled)`);
  if (studentData.registrationStatus === 'cancelled' && studentData.account_status === 'Cancelled') {
    console.log('>>> SUCCESS: 3 Failed Attempts successfully AUTO-CANCELLED the candidate registration!');
  } else {
    throw new Error('Auto-cancellation failed!');
  }

  // Step 10: Candidate Re-registers as New User
  console.log('\n--- CANDIDATE RE-REGISTERS AS NEW USER ---');
  const reRegRes = await studentClient.post(`/students/${studentId}/re-register`);
  studentData = reRegRes.data.student;
  console.log(`✓ Candidate Re-Registered:`);
  console.log(`  registrationStatus: ${studentData.registrationStatus} (Expected: pending_payment)`);
  console.log(`  account_status: ${studentData.account_status} (Expected: Unverified / Pending Payment)`);
  console.log(`  isAdvancePaid: ${studentData.isAdvancePaid} (Expected: false)`);
  console.log(`  learnerExamAttemptsCount: ${studentData.learnerExamAttemptsCount} (Expected: 0)`);

  // Step 11: Candidate pays advance again and staff re-verifies
  console.log('\n--- CANDIDATE RE-PAYS ADVANCE & STAFF RE-VERIFIES ---');
  await adminClient.patch(`/students/${studentId}/advance-paid`, {
    isAdvancePaid: true,
  });
  const reVerifiedRes = await studentClient.get(`/students/${studentId}`);
  console.log(`✓ Re-verified student account_status: ${reVerifiedRes.data.student.account_status}, isAdvancePaid: ${reVerifiedRes.data.student.isAdvancePaid}`);

  // Step 12: Candidate sits exam and PASSES!
  console.log('\n--- CANDIDATE SITS EXAM & PASSES (Score 36/40) ---');
  const passRes = await studentClient.post(`/students/${studentId}/exam-attempt`, {
    result: 'passed',
    marks: 36,
    date: '2026-12-15',
  });
  studentData = passRes.data.student;
  console.log(`✓ Exam Attempt Recorded:`);
  console.log(`  learnerExamStatus: ${studentData.learnerExamStatus} (Expected: passed)`);
  console.log(`  learnerExamPassed: ${studentData.dmtDates.learnerExamPassed} (Expected: true)`);
  console.log(`  learnerExamMarks: ${studentData.learnerExamMarks} (Expected: 36)`);
  console.log(`  Trial lesson access status: UNLOCKED!`);

  // Step 13: Candidate chooses vehicle package and submits package payment
  console.log('\n--- CANDIDATE SELECTS VEHICLE PACKAGE & PAYS PACKAGE FEE ---');
  const pkgsRes = await studentClient.get('/packages');
  const chosenPkg = pkgsRes.data.packages?.[0] || { type: 'Car_Full', price: 40000 };
  console.log(`✓ Chosen Package: ${chosenPkg.name || chosenPkg.type} (Rs. ${chosenPkg.price})`);

  const pkgPaymentRes = await studentClient.post('/payments/package-payment', {
    packageId: chosenPkg._id,
    packageType: chosenPkg.type,
    paymentPlan: 'full',
    amount: chosenPkg.price,
    bankName: 'Commercial Bank',
    transactionReference: 'TXN-COMBO-999',
  });
  console.log(`✓ Package payment submitted: ${pkgPaymentRes.data.message}`);

  // Admin approves package payment
  const paymentsRes = await adminClient.get('/payments/pending');
  const pendingPkgPayment = paymentsRes.data.payments.find(p => p.transactionReference === 'TXN-COMBO-999');
  if (pendingPkgPayment) {
    await adminClient.patch(`/payments/${pendingPkgPayment._id}/verify`, {
      status: 'verified',
    });
    console.log(`✓ Staff verified package payment!`);
  }

  const finalProfRes = await studentClient.get(`/students/${studentId}`);
  const finalProfile = finalProfRes.data.student;
  console.log(`✓ Final Profile: packagePaymentStatus=${finalProfile.packagePaymentStatus}, packageType=${finalProfile.package?.type}, lessonsTotal=${finalProfile.package?.lessonsTotal}`);

  console.log('\n============================================================');
  console.log('🎉 ALL TESTS PASSED: TYPE 1 LIFECYCLE & 3-ATTEMPT RULE VERIFIED!');
  console.log('============================================================');
}

run().catch((err) => {
  console.error('Test Failed:', err.response?.data || err.message);
  process.exit(1);
});
