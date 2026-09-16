const API = 'http://localhost:5001/api';

async function runTest() {
  console.log('🧪 Starting Milestone Reschedule & Status Tests...');

  // 1. Staff login
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

  // Student login as Kasun
  const studentLoginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student.kasun@gmail.com',
      password: 'password123',
    }),
  });
  const studentData = await studentLoginRes.json();
  const studentToken = studentData.token;
  console.log('✓ Student logged in as Kasun');

  // Test 1: Student submits a reschedule request for DMT Medical Exam
  const submitRes = await fetch(`${API}/students/trial-date/reschedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      milestoneType: 'medical',
      reason: 'Need medical exam postponed due to illness',
      preferredDate: '2026-10-15',
    }),
  });
  const submitData = await submitRes.json();
  console.log('Test 1 - Submit Medical Reschedule:', submitRes.status, submitData.message);
  if (submitRes.status !== 201 && !submitData.message?.includes('already have a pending')) {
    console.error('Failed Test 1');
    process.exit(1);
  }

  // Test 2: Fetch student reschedule requests
  const myReqsRes = await fetch(`${API}/students/trial-date/reschedule`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const myReqsData = await myReqsRes.json();
  console.log('Test 2 - My Reschedule Requests count:', myReqsData.requests?.length);
  const pendingMedReq = myReqsData.requests?.find(r => r.milestone_type === 'medical' && r.status === 'Pending');
  console.log('Test 2 - Pending Medical Request found:', Boolean(pendingMedReq));

  // Test 3: Staff reviews and approves the request
  if (pendingMedReq) {
    const reviewRes = await fetch(`${API}/students/reschedule-requests/${pendingMedReq._id}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        status: 'Approved',
        newDate: '2026-10-20',
        reviewNotes: 'Approved for new DMT medical batch',
      }),
    });
    const reviewData = await reviewRes.json();
    console.log('Test 3 - Staff Approval Status:', reviewRes.status, reviewData.message);

    // Verify student's medical date was updated
    const targetStudentId = pendingMedReq.student_id?._id || pendingMedReq.student_id;
    const verifyStudentRes = await fetch(`${API}/students/${targetStudentId}`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const verifyStudentData = await verifyStudentRes.json();
    const updatedMedDate = verifyStudentData.student?.dmtDates?.medicalExamDate || verifyStudentData.student?.medical_date;
    console.log('Test 3 - Student Updated Medical Date:', updatedMedDate);
    if (updatedMedDate && String(updatedMedDate).startsWith('2026-10-20')) {
      console.log('🎉 SUCCESS: Student medical date was updated properly on approval!');
    } else {
      console.error('❌ Failed: Student medical date did not match 2026-10-20, got:', updatedMedDate);
      process.exit(1);
    }
  }

  // Test 4: Student submits a reschedule request for Written Theory Exam
  const examSubmitRes = await fetch(`${API}/students/trial-date/reschedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      milestoneType: 'theory_exam',
      reason: 'Need theory exam rescheduled to next month',
      preferredDate: '2026-11-12',
    }),
  });
  const examSubmitData = await examSubmitRes.json();
  console.log('Test 4 - Submit Theory Exam Reschedule:', examSubmitRes.status, examSubmitData.message);

  // Test 5: Staff reviews and approves Theory Exam Reschedule
  const myReqsRes2 = await fetch(`${API}/students/trial-date/reschedule`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const myReqsData2 = await myReqsRes2.json();
  const pendingExamReq = myReqsData2.requests?.find(r => r.milestone_type === 'theory_exam' && r.status === 'Pending');
  console.log('Test 5 - Pending Theory Exam Request found:', Boolean(pendingExamReq));

  if (pendingExamReq) {
    const reviewRes = await fetch(`${API}/students/reschedule-requests/${pendingExamReq._id}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        status: 'Approved',
        newDate: '2026-11-15',
        reviewNotes: 'Approved for November theory batch',
      }),
    });
    const reviewData = await reviewRes.json();
    console.log('Test 5 - Staff Approval Theory Exam:', reviewRes.status, reviewData.message);

    const targetStudentId = pendingExamReq.student_id?._id || pendingExamReq.student_id;
    const verifyStudentRes = await fetch(`${API}/students/${targetStudentId}`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const verifyStudentData = await verifyStudentRes.json();
    const updatedExamDate = verifyStudentData.student?.dmtDates?.learnerExamDate || verifyStudentData.student?.written_exam_date;
    console.log('Test 5 - Student Updated Exam Date:', updatedExamDate);
    if (updatedExamDate && String(updatedExamDate).startsWith('2026-11-15')) {
      console.log('🎉 SUCCESS: Student written theory exam date was updated properly on approval!');
    } else {
      console.error('❌ Failed: Student exam date did not match 2026-11-15, got:', updatedExamDate);
      process.exit(1);
    }
  }

  console.log('🎉 All Milestone Reschedule Tests Passed Successfully!');
}

runTest().catch(console.error);
