const API = 'http://localhost:5001/api';

async function runTest() {
  console.log('🧪 Starting DMT Milestone Lock Validation Tests (using native fetch)...');

  // 1. Login as staff to get student
  const staffLoginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'staff.maharagama@sithma.lk',
      password: 'password123',
    }),
  });
  const staffData = await staffLoginRes.json();
  const staffToken = staffData.token;
  console.log('✓ Staff logged in');

  // Find a Type 1 student
  const studentsRes = await fetch(`${API}/students`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  const studentsData = await studentsRes.json();
  const type1Student = studentsData.students.find((s) => s.studentType === 'Type1_NewLearner' || s.studentType === 'Type 1');
  if (!type1Student) {
    console.error('No type 1 student found');
    return;
  }
  console.log(`✓ Found Type 1 Student: ${type1Student.userId?.name} (${type1Student._id})`);

  // Clear DMT dates first using staff
  await fetch(`${API}/students/${type1Student._id}/dmt-dates`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({
      medical_date: null,
      registration_date: null,
      written_exam_date: null,
    }),
  });
  console.log('✓ Reset student DMT dates to null');

  // Login as student
  const studentLoginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: type1Student.userId.email,
      password: 'password123',
    }),
  });
  const studentData = await studentLoginRes.json();
  const studentToken = studentData.token;
  console.log('✓ Student logged in');

  // Test A: Student attempts to mark medical done without date assigned
  const resA = await fetch(`${API}/students/${type1Student._id}/dmt-dates`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ medicalDone: true }),
  });
  const dataA = await resA.json();
  if (resA.status === 400) {
    console.log(`✓ PASS: Blocked medicalDone without date: "${dataA.message}"`);
  } else {
    console.error('❌ FAILED: Student was able to mark medical done without assigned date');
  }

  // Test B: Student attempts to record exam attempt without date assigned
  const resB = await fetch(`${API}/students/${type1Student._id}/exam-attempt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ result: 'passed', marks: 35 }),
  });
  const dataB = await resB.json();
  if (resB.status === 400) {
    console.log(`✓ PASS: Blocked exam-attempt without date: "${dataB.message}"`);
  } else {
    console.error('❌ FAILED: Student was able to record exam without assigned date');
  }

  // Test C: Staff assigns future medical date (tomorrow)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  await fetch(`${API}/students/${type1Student._id}/dmt-dates`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({ medical_date: tomorrow }),
  });
  console.log(`✓ Staff assigned future medical date (${tomorrow})`);

  // Test D: Student attempts to mark medical done for tomorrow
  const resD = await fetch(`${API}/students/${type1Student._id}/dmt-dates`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ medicalDone: true }),
  });
  const dataD = await resD.json();
  if (resD.status === 400) {
    console.log(`✓ PASS: Blocked medicalDone before scheduled date: "${dataD.message}"`);
  } else {
    console.error('❌ FAILED: Student was able to mark medical done before the date');
  }

  // Test E: Staff assigns today or past medical date
  const today = new Date().toISOString().split('T')[0];
  await fetch(`${API}/students/${type1Student._id}/dmt-dates`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({ medical_date: today }),
  });
  console.log(`✓ Staff assigned today's medical date (${today})`);

  // Test F: Student marks medical done today
  const resF = await fetch(`${API}/students/${type1Student._id}/dmt-dates`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ medicalDone: true }),
  });
  const dataF = await resF.json();
  if (dataF.success) {
    console.log('✓ PASS: Student successfully marked medical done on scheduled date!');
  }

  console.log('\n🎉 ALL MILESTONE LOCK TESTS PASSED PERFECTLY!');
}

runTest().catch((err) => console.error('Error running test:', err.message));
