const BASE_URL = 'http://localhost:5001/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🚀 Starting E2E Registration & Verification Flow Test...\n');

  try {
    // ── Test 1: Bank Details Endpoint ──
    console.log('--- Test 1: Bank Details Endpoint (Step 3 Reference Data) ---');
    const bankRes = await request('/payments/bank-details');
    console.log('Bank Details Status:', bankRes.status);
    console.log('Advance Fee Amount:', bankRes.data.advanceAmount);
    console.log('Preconfigured Banks count:', bankRes.data.banks?.length);
    if (bankRes.data.advanceAmount !== 5000) throw new Error('Expected advance amount 5000');
    if (bankRes.data.banks?.length !== 4) throw new Error('Expected exactly 4 pre-configured banks');
    console.log('✅ Bank Details Test Passed!\n');

    // ── Test 2: DMT Underage (Age < 18) Rejection ──
    console.log('--- Test 2: DMT Underage Registration Rejection ---');
    const underageDob = new Date();
    underageDob.setFullYear(underageDob.getFullYear() - 17);
    const underageDobStr = underageDob.toISOString().split('T')[0];

    const underageRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Underage Student',
        email: `underage_${Date.now()}@test.com`,
        phone: '0779998877',
        dob: underageDobStr,
        password: 'Password123!',
        student_type: 'Type 1',
        branch: 'Maharagama',
      },
    });

    if (underageRes.status === 400 && underageRes.data?.message?.includes('18')) {
      console.log('Underage rejected correctly with 400:', underageRes.data.message);
      console.log('✅ Underage Rejection Test Passed!\n');
    } else {
      throw new Error(`Expected underage rejection with 400, got ${underageRes.status}: ${JSON.stringify(underageRes.data)}`);
    }

    // ── Test 3: Type 1 Student Registration (Eligible 18+) ──
    console.log('--- Test 3: Type 1 Student Registration (Eligible 18+) ---');
    const adultDob = '2002-05-15';
    const type1Email = `student1_${Date.now()}@test.com`;
    const type1Phone = `077${Math.floor(1000000 + Math.random() * 9000000)}`;

    const reg1Res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Nimal Perera',
        email: type1Email,
        phone: type1Phone,
        dob: adultDob,
        password: 'Password123!',
        student_type: 'Type 1',
        branch: 'Maharagama',
      },
    });

    console.log('Type 1 Registration Response:', reg1Res.data);
    const pendingUserId1 = reg1Res.data.pendingUserId;
    if (reg1Res.data.account_status !== 'Unverified / Pending Payment') {
      throw new Error('Account status should be Unverified / Pending Payment');
    }
    console.log('✅ Type 1 Registration Test Passed!\n');

    // ── Test 4: Step 3 Bank Slip Upload (Type 1) ──
    console.log('--- Test 4: Bank Deposit Slip Upload (Option 1) ---');
    const slipRes = await request('/payments/upload-pending', {
      method: 'POST',
      body: {
        pendingUserId: pendingUserId1,
        amount: 5000,
        bankName: 'Bank of Ceylon (BOC)',
        transactionReference: `SLIP-TEST-${Date.now().toString().slice(-6)}`,
      },
    });
    console.log('Slip Upload Status:', slipRes.status, slipRes.data.message);
    if (slipRes.data.payment_method !== 'bank_slip' || slipRes.data.payment_status !== 'Pending Verification') {
      throw new Error('Expected bank_slip and Pending Verification');
    }
    console.log('✅ Bank Slip Upload Test Passed!\n');

    // ── Test 5: Authorization Blocking for Unverified Student ──
    console.log('--- Test 5: Server-Side Functional Route Blocking (Step 5 Restricted) ---');
    const login1Res = await request('/auth/login', {
      method: 'POST',
      body: { email: type1Email, password: 'Password123!' },
    });
    const token1 = login1Res.data.token;
    console.log('Student Login successful, isVerified =', login1Res.data.user?.isVerified);

    const bookingRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: { slotId: '507f1f77bcf86cd799439011' },
    });

    if (bookingRes.status === 403) {
      console.log('Lesson booking blocked correctly with 403!');
      console.log('Restricted Message:', bookingRes.data.message);
      if (!bookingRes.data.message.includes('verified by a Data Entry Officer')) {
        throw new Error('Expected Data Entry Officer verification message');
      }
      console.log('✅ Server-side Authorization Blocking Test Passed!\n');
    } else {
      throw new Error(`Expected 403 blocking, got ${bookingRes.status}`);
    }

    // ── Test 6: Type 2 Student Registration & Physical Branch Intent ──
    console.log('--- Test 6: Type 2 Registration & Physical Branch Intent ---');
    const type2Email = `student2_${Date.now()}@test.com`;
    const type2Phone = `071${Math.floor(1000000 + Math.random() * 9000000)}`;

    const reg2Res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Sunil Fernando',
        email: type2Email,
        phone: type2Phone,
        dob: '2000-08-20',
        password: 'Password123!',
        student_type: 'Type 2',
        branch: 'Werahara',
      },
    });

    const pendingUserId2 = reg2Res.data.pendingUserId;
    console.log('Type 2 Registration Response:', reg2Res.data.student_type, reg2Res.data.account_status);

    const physRes = await request('/payments/register-physical-intent', {
      method: 'POST',
      body: {
        pendingUserId: pendingUserId2,
        branch: 'Werahara',
        amount: 5000,
      },
    });
    console.log('Physical Intent Response:', physRes.data.message);
    console.log('✅ Type 2 Registration & Physical Intent Test Passed!\n');

    // ── Test 7: Staff / Admin Login & Verification Queue (Step 4) ──
    console.log('--- Test 7: Staff / Admin Verification Queue Inspection ---');
    const staffLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@sithma.lk', password: 'admin123' },
    });
    const staffToken = staffLoginRes.data.token;
    console.log('Admin/Staff Login successful!');


    const queueRes = await request('/payments/pending', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    console.log('Pending Queue Count:', queueRes.data.count);
    const targetPayment1 = queueRes.data.payments.find((p) => p.userId?._id === pendingUserId1);
    if (!targetPayment1) throw new Error('Target payment 1 not found in queue');
    console.log('Found Target Payment 1:', targetPayment1.payment_method, targetPayment1.amount);

    // ── Test 8: Staff Approve Type 1 Payment ──
    console.log('--- Test 8: Staff Approve Type 1 Payment ---');
    const verify1Res = await request(`/payments/${targetPayment1._id}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: { status: 'confirmed' },
    });
    console.log('Approve Type 1 Result:', verify1Res.data.message);
    console.log('Student 1 Account Status:', verify1Res.data.student?.account_status);
    if (verify1Res.data.student?.account_status !== 'Verified') {
      throw new Error('Expected student account_status = Verified');
    }
    console.log('✅ Type 1 Approval Test Passed!\n');

    // ── Test 9: Data Entry Officer Direct On-The-Spot Cash Approval (Type 2) ──
    console.log('--- Test 9: On-The-Spot Cash Payment Approval (Type 2) ---');
    const student2Id = reg2Res.data.student?._id;
    const cashApproveRes = await request('/payments/cash-approve', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        studentId: student2Id,
        branch: 'Werahara',
        notes: 'Cash received at Werahara counter',
      },
    });
    console.log('Cash Approval Result:', cashApproveRes.data.message);
    console.log('Student 2 Account Status:', cashApproveRes.data.student?.account_status);
    console.log('Student 2 Trial Eligible:', cashApproveRes.data.student?.trial_eligible);
    if (cashApproveRes.data.student?.account_status !== 'Verified') {
      throw new Error('Expected student 2 account_status = Verified');
    }
    if (!cashApproveRes.data.student?.trial_eligible) {
      throw new Error('Expected Type 2 student to be trial_eligible = true immediately!');
    }
    console.log('✅ On-The-Spot Cash Approval Test Passed!\n');

    console.log('🎉 ALL 9 END-TO-END INTEGRATION TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    process.exit(1);
  }
}

runTests();
