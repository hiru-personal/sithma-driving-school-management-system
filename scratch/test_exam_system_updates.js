const axios = require('axios');
const API_BASE = 'http://localhost:5001/api';

async function runTests() {
  console.log('=== STARTING EXAM SYSTEM AUTOMATED TESTS ===\n');

  // 1. Login as Admin
  console.log('1. Logging in as Admin (admin@sithma.lk)...');
  const adminRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'admin@sithma.lk',
    password: 'admin123',
  });
  const adminToken = adminRes.data.token;
  const adminClient = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   Admin logged in successfully.\n');

  // 2. Fetch existing Question Lists
  console.log('2. Fetching Question Lists...');
  const listsRes = await adminClient.get('/quiz/lists');
  console.log(`   Found ${listsRes.data.lists.length} question lists:`);
  listsRes.data.lists.forEach((l) => {
    console.log(`   - "${l.name}" (${l.language}, ${l.vehicleCategory}) [${l.questionCount || 0} questions]`);
  });
  console.log('');

  // 3. Admin creates a brand new Question List
  console.log('3. Admin creating a new Question List: "Expressway Highway Code Special Practice Paper"...');
  const createListRes = await adminClient.post('/quiz/lists', {
    name: 'Expressway Highway Code Special Practice Paper',
    description: 'High-speed driving regulations, expressway toll systems, and emergency lane protocols.',
    language: 'English',
    vehicleCategory: 'Light',
    passingScore: 85,
  });
  const newList = createListRes.data.list;
  console.log('   Created list successfully:', newList._id, newList.name, '\n');

  // 4. Admin adds 2 questions to this specific Question List
  console.log('4. Adding Question 1 to this Question List...');
  const q1Res = await adminClient.post('/quiz/questions', {
    questionListId: newList._id,
    questionText: 'What is the maximum legal speed limit on the Southern Expressway (E01) in Sri Lanka?',
    options: ['80 km/h', '100 km/h', '120 km/h', '90 km/h'],
    correctAnswerIndex: 1, // 100 km/h
    explanation: 'The maximum speed limit on Sri Lankan expressways for motor cars is 100 km/h.',
    language: 'English',
    vehicleCategory: 'Light',
  });
  const q1 = q1Res.data.question;
  console.log('   Question 1 added:', q1._id, q1.questionText);

  console.log('   Adding Question 2 to this Question List...');
  const q2Res = await adminClient.post('/quiz/questions', {
    questionListId: newList._id,
    questionText: 'When are drivers permitted to use the expressway emergency stopping shoulder?',
    options: [
      'To overtake slow-moving vehicles',
      'Only in cases of genuine breakdown or emergency',
      'To make a routine mobile phone call',
      'To rest when fatigued without stopping vehicle',
    ],
    correctAnswerIndex: 1,
    explanation: 'The emergency shoulder is exclusively reserved for vehicles in breakdown or emergency distress.',
    language: 'English',
    vehicleCategory: 'Light',
  });
  const q2 = q2Res.data.question;
  console.log('   Question 2 added:', q2._id, q2.questionText, '\n');

  // 5. Admin updates Question 1
  console.log('5. Admin editing Question 1 explanation...');
  const editQRes = await adminClient.put(`/quiz/questions/${q1._id}`, {
    explanation: 'Updated Driver Tip: Speed limit is strictly 100 km/h unless adverse weather signals dictate 80 km/h.',
  });
  console.log('   Question 1 updated successfully:', editQRes.data.question.explanation, '\n');

  // 6. Verify questions inside this Question List
  console.log('6. Fetching questions specifically for this Question List...');
  const listQuestionsRes = await adminClient.get(`/quiz/questions?questionListId=${newList._id}&includeAnswers=true`);
  console.log(`   Found ${listQuestionsRes.data.questions.length} questions in this list.`);
  console.log('');

  // 7. Register & Authenticate a Type 1 Student
  console.log('7. Registering / Logging in Type 1 Student...');
  const studentEmail = `exam_student_${Date.now()}@example.com`;
  const studentPassword = 'Password@123';
  const rand = Math.floor(100000 + Math.random() * 900000);

  const regRes = await axios.post(`${API_BASE}/auth/register`, {
    name: 'Saman Kumara',
    email: studentEmail,
    password: studentPassword,
    phone: `077${rand}2`,
    nic: `1997${rand}2V`,
    dob: '1997-03-15',
    gender: 'male',
    address: '45 Galle Road, Colombo',
    branch: 'Maharagama',
    studentType: 'Type 1: New Learner',
    preferredLanguage: 'English',
    paymentMethod: 'bank_transfer',
    paymentSlipUrl: 'http://example.com/slip.jpg',
  });
  const studentProfileId = regRes.data.student._id;
  const studentUser = regRes.data.user;

  // Login student to get valid JWT
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: studentEmail,
    password: studentPassword,
  });
  const studentToken = loginRes.data.token;

  const studentClient = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${studentToken}` },
  });

  // Verify advance payment so student has verified access
  await adminClient.patch(`/students/${studentProfileId}/advance-paid`, {
    isAdvancePaid: true,
  });
  console.log('   Student registered & advance verified:', studentUser.email, 'ID:', studentProfileId, '\n');

  // 8. Student submits an exam attempt on the new Question List
  console.log('8. Student submitting an exam attempt on the new Question List...');
  const attemptRes = await studentClient.post('/quiz/attempt', {
    questionListId: newList._id,
    language: 'English',
    vehicleCategory: 'Light',
    userAnswers: [
      { questionId: q1._id, selectedOption: 1 }, // Correct!
      { questionId: q2._id, selectedOption: 1 }, // Correct!
    ],
  });
  console.log('   Attempt submitted successfully!');
  console.log('   Score:', attemptRes.data.score, '/', attemptRes.data.totalQuestions);
  console.log('   Percentage:', attemptRes.data.percentage, '%');
  console.log('   Passed:', attemptRes.data.passed);
  console.log('   Question List Name preserved:', attemptRes.data.questionListName);
  const attemptId = attemptRes.data.attemptId;
  console.log('   Attempt ID:', attemptId, '\n');

  // 9. Student retrieves their exam history
  console.log('9. Student retrieving exam history (/api/quiz/attempts/student/:id)...');
  const historyRes = await studentClient.get(`/quiz/attempts/student/${studentProfileId}`);
  console.log(`   Retrieved ${historyRes.data.attempts.length} attempts from history.`);
  const latestAttempt = historyRes.data.attempts[0];
  console.log('   Latest Attempt in History:');
  console.log('   - Exam Name:', latestAttempt.questionListName);
  console.log('   - Date Completed:', latestAttempt.takenAt);
  console.log('   - Score:', `${latestAttempt.score}/${latestAttempt.totalQuestions} (${latestAttempt.percentage}%)`);
  console.log('   - Status:', latestAttempt.status, latestAttempt.passed ? 'PASSED' : 'NEEDS PRACTICE');
  console.log('');

  // 10. Student retrieves full read-only review of this completed exam
  console.log('10. Student reviewing completed exam (/api/quiz/attempts/:id)...');
  const reviewRes = await studentClient.get(`/quiz/attempts/${attemptId}`);
  const review = reviewRes.data.attempt;
  console.log('   Review details loaded successfully:');
  console.log('   - Question List Name:', review.questionListName);
  console.log('   - Total Answered Questions:', review.answers.length);
  review.answers.forEach((ans, idx) => {
    console.log(`     Q${idx + 1}: "${ans.questionText}"`);
    console.log(`       Student Choice: Option ${String.fromCharCode(65 + ans.selectedOption)} (${ans.options[ans.selectedOption]})`);
    console.log(`       Correct Answer: Option ${String.fromCharCode(65 + ans.correctOption)} (${ans.options[ans.correctOption]})`);
    console.log(`       Result: ${ans.isCorrect ? 'CORRECT' : 'WRONG'}`);
    console.log(`       Explanation: "${ans.explanation}"`);
  });
  console.log('');

  // 11. Cleanup test Question List
  console.log('11. Cleaning up test Question List...');
  const deleteRes = await adminClient.delete(`/quiz/lists/${newList._id}`);
  console.log('   Delete result:', deleteRes.data.message);
  console.log('\n=== ALL EXAM SYSTEM AUTOMATED TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('TEST ERROR:', err.response?.data || err.message);
  process.exit(1);
});
