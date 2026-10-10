const API_BASE = 'http://localhost:5001/api';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('--- STARTING END-TO-END VERIFICATION FLOW TEST ---');

  // Verify server is ready
  let ready = false;
  for (let i = 0; i < 5; i++) {
    try {
      const h = await fetch(`${API_BASE}/health`);
      if (h.ok) {
        ready = true;
        break;
      }
    } catch {
      await wait(1000);
    }
  }

  if (!ready) {
    console.error('Server not reachable at', API_BASE);
    process.exit(1);
  }

  const uniqueSuffix = Date.now().toString().slice(-8);
  const testEmail = `test.student.${Date.now()}@sithma.lk`;
  const testPassword = 'Password@123';
  const testNic = `2001${uniqueSuffix}`;
  const testPhone = `071${uniqueSuffix.slice(-7)}`;
  const testName = 'Automated Test Student';

  try {
    // 1. Register new student
    console.log('\nStep 1: Registering new student...');
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        phone: testPhone,
        nic: testNic,
        dob: '2001-05-15',
        branch: 'Maharagama',
        studentType: 'Type1_NewLearner',
      }),
    });
    const regData = await regRes.json();

    console.log('Registration Response Status:', regRes.status);
    console.log('Registration Success:', regData.success);
    console.log('Returned verificationStatus:', regData.user?.verificationStatus);

    if (regData.user?.verificationStatus !== 'Pending Verification') {
      throw new Error(`Expected verificationStatus to be 'Pending Verification', got: ${regData.user?.verificationStatus}`);
    }

    const testStudentUserId = regData.user?.id || regData.user?._id;
    const testStudentId = regData.student?._id;
    console.log(`Student Created with ID: ${testStudentId}, User ID: ${testStudentUserId}`);

    // 2. Student Login Before Verification
    console.log('\nStep 2: Student logging in before admin verification...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();

    console.log('Login Status:', loginRes.status);
    console.log('Login Success:', loginData.success);
    console.log('Login user verificationStatus:', loginData.user?.verificationStatus);
    console.log('Login isVerified flag:', loginData.isVerified);

    if (loginData.isVerified !== false || loginData.user?.verificationStatus !== 'Pending Verification') {
      throw new Error('Student should be logged in with isVerified: false and Pending Verification');
    }

    const studentToken = loginData.token;

    // 3. Verify lightweight status endpoint is accessible to pending student
    console.log('\nStep 3: Checking GET /auth/verification-status for pending student...');
    const statusRes = await fetch(`${API_BASE}/auth/verification-status`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const statusData = await statusRes.json();
    console.log('Verification Status Endpoint Result:', statusData);
    if (statusData.isVerified !== false || statusData.verificationStatus !== 'Pending Verification') {
      throw new Error('Verification status endpoint returned wrong data for unverified student');
    }

    // 4. Verify restricted API is BLOCKED for pending student
    console.log('\nStep 4: Attempting restricted student API (POST /students/trial-date/reschedule)...');
    const restrictRes = await fetch(`${API_BASE}/students/trial-date/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ milestoneType: 'trial', reason: 'Test' }),
    });
    const restrictData = await restrictRes.json();
    if (restrictRes.status === 403) {
      console.log('✓ Successfully blocked with 403 Forbidden:', restrictData.message);
    } else {
      throw new Error(`Expected 403 Forbidden for unverified student, got ${restrictRes.status}`);
    }

    // 5. Admin logs in
    console.log('\nStep 5: Admin logging in...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sithma.lk',
        password: 'admin123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log('Admin login success. Token obtained.');

    // 6. Admin checks student list in admin / student endpoint
    console.log('\nStep 6: Admin querying student list...');
    const studentsRes = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const studentsData = await studentsRes.json();
    const foundStudent = studentsData.students.find(
      (s) => s._id === testStudentId || s.userId?._id === testStudentUserId || s.userId?.email === testEmail
    );
    console.log('Found newly registered student in list:', Boolean(foundStudent));
    console.log('Current verificationStatus in list:', foundStudent?.verificationStatus);

    if (!foundStudent || foundStudent.verificationStatus !== 'Pending Verification') {
      throw new Error('Admin did not see student with Pending Verification status');
    }

    // 7. Admin Verifies Student
    console.log('\nStep 7: Admin verifying student (PATCH /admin/students/:id/verify)...');
    const verifyRes = await fetch(`${API_BASE}/admin/students/${foundStudent._id}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Verified' }),
    });
    const verifyData = await verifyRes.json();
    console.log('Verify Student Response:', verifyData);
    if (!verifyData.success || verifyData.student?.verificationStatus !== 'Verified') {
      throw new Error('Admin verification endpoint failed to return Verified status');
    }

    // 8. Student polls or refreshes status
    console.log('\nStep 8: Student checking verification status after admin approval...');
    const recheckStatus = await fetch(`${API_BASE}/auth/verification-status`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const recheckData = await recheckStatus.json();
    console.log('Student New Status Result:', recheckData);
    if (recheckData.isVerified !== true || recheckData.verificationStatus !== 'Verified') {
      throw new Error('Student status was not updated to Verified after admin approval');
    }

    // 9. Checking GET /auth/me for student
    console.log('\nStep 9: Checking GET /auth/me for student...');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData = await meRes.json();
    console.log('Student /auth/me verificationStatus:', meData.user?.verificationStatus);
    console.log('Student /auth/me isVerified:', meData.isVerified);
    if (meData.user?.verificationStatus !== 'Verified' || !meData.isVerified) {
      throw new Error('Student /auth/me does not reflect Verified state');
    }

    // 10. Admin cleans up test user using admin accounts delete endpoint
    console.log('\nStep 10: Cleaning up test student via admin API...');
    const delRes = await fetch(`${API_BASE}/admin/accounts/${testStudentUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const delData = await delRes.json();
    console.log('Delete response:', delData.message || delData);

    console.log('\n================================================================');
    console.log('🎉 ALL REQUIREMENTS AND END-TO-END VERIFICATION FLOW PASSED! 🎉');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTest();
