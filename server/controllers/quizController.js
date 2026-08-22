const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');
const Student = require('../models/Student');

// Sample initial multilingual question seed bank
const initialQuestions = [
  // English - Light Vehicle
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
    questionText: 'When driving in heavy rain, what should you do to avoid hydroplaning?',
    options: ['Increase speed', 'Reduce speed and avoid sudden braking', 'Turn off headlights', 'Drive on the shoulder'],
    correctAnswerIndex: 1,
    explanation: 'Slowing down prevents tires from losing grip on wet asphalt.',
    language: 'English',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'What should you do when approaching a pedestrian zebra crossing when someone is waiting to cross?',
    options: ['Sound horn and keep going', 'Stop and give way to the pedestrian', 'Flash high beams', 'Overtake on the right'],
    correctAnswerIndex: 1,
    explanation: 'Pedestrians have absolute right-of-way on pedestrian zebra crossings.',
    language: 'English',
    vehicleCategory: 'Light',
  },

  // Sinhala (සිංහල) - Light Vehicle
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
    questionText: 'පදික මාරුවක් (Zebra Crossing) අසල පදිකයෙකු සිටින විට රියදුරෙකු කළ යුත්තේ කුමක්ද?',
    options: ['නලා ශබ්ද කර ඉදිරියට යෑම', 'වාහනය නවත්වා පදිකයාට පාර මාරුවීමට ඉඩදීම', 'ප්‍රධාන ලාම්පු දල්වා වේගයෙන් යෑම', 'දකුණු පසින් ඉස්සර කිරීම'],
    correctAnswerIndex: 1,
    explanation: 'පදික මාරුවකදී පදිකයින්ට ප්‍රමුඛතාවය හිමිවේ.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },

  // Tamil (தமிழ்) - Light Vehicle
  {
    questionText: 'நகர வீதிகளில் மோட்டார் கார்களுக்கான அதிகபட்ச வேக வரம்பு யாது?',
    options: ['மணிக்கு 50 கி.மீ', 'மணிக்கு 70 கி.மீ', 'மணிக்கு 40 கி.மீ', 'மணிக்கு 60 கி.மீ'],
    correctAnswerIndex: 0,
    explanation: 'இலங்கையில் நகர்ப்புற வீதிகளில் மோட்டார் வாகனங்களுக்கு 50 கி.மீ/மணி வேக வரம்பு உள்ளது.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'மஞ்சள் நிறத்தில் விட்டு விட்டு ஒளிரும் போக்குவரத்து சைகை வெளிச்சம் எதனைக் குறிக்கிறது?',
    options: ['உடனே நிறுத்துக', 'இருபுறமும் அவதானித்து எச்சரிக்கையுடன் முன்னேறுக', 'வேகத்தை கூட்டுக', 'வீதி மூடப்பட்டுள்ளது'],
    correctAnswerIndex: 1,
    explanation: 'எச்சரிக்கையுடன் வாகனத்தைச் செலுத்த வேண்டும் என்பதைக் குறிக்கிறது.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },

  // Heavy Vehicle (Bus/Lorry)
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
];

// @desc    Get questions for practice quiz (Seeds if empty)
// @route   GET /api/quiz/questions
// @access  Public / Authenticated
exports.getQuizQuestions = async (req, res) => {
  try {
    const { language = 'English', vehicleCategory = 'Light' } = req.query;

    let count = await QuizQuestion.countDocuments({});
    if (count === 0) {
      await QuizQuestion.insertMany(initialQuestions);
    }

    const questions = await QuizQuestion.find({
      language,
      vehicleCategory,
      isActive: true,
    }).select('-correctAnswerIndex'); // Don't expose answers to client during quiz

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz questions',
      error: error.message,
    });
  }
};

// @desc    Submit Quiz Attempt (Server validates answers & calculates score)
// @route   POST /api/quiz/attempt
// @access  Student
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { language, vehicleCategory, userAnswers } = req.body;
    // userAnswers = [{ questionId, selectedOption }]

    if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No quiz answers provided for scoring',
      });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Fetch questions with correct answers from DB
    const questionIds = userAnswers.map((a) => a.questionId);
    const questionsFromDb = await QuizQuestion.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questionsFromDb.map((q) => [q._id.toString(), q]));

    let correctCount = 0;
    const processedAnswers = [];

    userAnswers.forEach((ans) => {
      const q = questionMap.get(ans.questionId.toString());
      if (q) {
        const isCorrect = q.correctAnswerIndex === ans.selectedOption;
        if (isCorrect) correctCount++;
        processedAnswers.push({
          questionId: q._id,
          selectedOption: ans.selectedOption,
          correctOption: q.correctAnswerIndex,
          isCorrect,
        });
      }
    });

    const totalQuestions = userAnswers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 80; // 80% passing standard for DMT

    const attempt = await QuizAttempt.create({
      studentId: student._id,
      userId: req.user._id,
      language: language || 'English',
      vehicleCategory: vehicleCategory || 'Light',
      answers: processedAnswers,
      score: correctCount,
      totalQuestions,
      percentage,
      passed,
      takenAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: passed ? '🎉 Congratulations! You passed the practice test!' : 'Practice test completed.',
      score: correctCount,
      totalQuestions,
      percentage,
      passed,
      attemptId: attempt._id,
      answers: processedAnswers,
    });
  } catch (error) {
    console.error('Quiz evaluation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate quiz attempt',
      error: error.message,
    });
  }
};

// @desc    Get student's past quiz attempts & statistics
// @route   GET /api/quiz/attempts/student/:id
// @access  Student, Staff, Admin
exports.getStudentQuizAttempts = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const attempts = await QuizAttempt.find({ studentId: student._id })
      .sort({ takenAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz attempts',
      error: error.message,
    });
  }
};

// @desc    Manage Question Bank (CRUD for Staff/Admin)
// @route   POST /api/quiz/questions
// @access  Staff, Admin
exports.createQuizQuestion = async (req, res) => {
  try {
    const question = await QuizQuestion.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Quiz question created successfully',
      question,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create question',
    });
  }
};

// @desc    Delete Quiz Question (Staff/Admin)
// @route   DELETE /api/quiz/questions/:id
// @access  Staff, Admin
exports.deleteQuizQuestion = async (req, res) => {
  try {
    await QuizQuestion.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete question',
    });
  }
};
