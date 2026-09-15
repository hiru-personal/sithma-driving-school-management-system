const axios = require('axios');
const API_BASE = 'http://localhost:5001/api';

async function setup() {
  const adminRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'admin@sithma.lk',
    password: 'admin123',
  });
  const adminToken = adminRes.data.token;
  const adminClient = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const email = 'type1_verified_demo@example.com';
  const password = 'Password@123';

  // Check if exists, or register
  let studentId;
  try {
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Nimal Perera',
      email,
      password,
      phone: '0779988776',
      nic: '199812345678',
      dob: '1998-04-12',
      gender: 'male',
      address: '77 Kandy Road, Kurunegala',
      branch: 'Kurunegala',
      studentType: 'Type 1: New Learner',
      preferredLanguage: 'Sinhala',
      paymentMethod: 'bank_transfer',
      paymentSlipUrl: 'http://example.com/slip.jpg',
    });
    studentId = regRes.data.student._id;
    console.log('Registered new student:', email);
  } catch (err) {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, { email, password });
    studentId = loginRes.data.user.studentProfile;
    console.log('Existing student logged in:', email);
  }

  // Verify advance payment
  await adminClient.patch(`/students/${studentId}/advance-paid`, {
    isAdvancePaid: true,
  });

  // Set DMT dates
  await adminClient.patch(`/students/${studentId}/dmt-dates`, {
    medicalExamDate: '2026-10-15',
    learnerRegistrationDate: '2026-10-22',
    learnerExamDate: '2026-11-05',
    medicalExamPassed: false,
    medicalDone: false,
    registrationDone: false,
    learnerExamPassed: false,
    learnerExamStatus: 'not_taken',
  });

  console.log('Ready for browser test!');
  console.log('Credentials: email:', email, 'password:', password);
}

setup().catch(console.error);
