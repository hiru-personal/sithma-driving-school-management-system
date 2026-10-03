const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');
const QuestionList = require('../models/QuestionList');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

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

// Helper to ensure default QuestionLists exist and unassigned questions are linked
async function ensureQuestionLists() {
  let count = await QuestionList.countDocuments({});
  let defaultList;

  if (count === 0) {
    defaultList = await QuestionList.create({
      name: 'Standard DMT Theory Mock Exam - Set A',
      description: 'Official Department of Motor Traffic standard theory paper covering road rules, right of way, and vehicle operations.',
      language: 'English',
      vehicleCategory: 'Light',
      passingScore: 80,
      isActive: true,
    });

    // Also create a second question list to immediately demonstrate multiple question lists
    await QuestionList.create({
      name: 'Road Signs, Signals & Road Markings Master Set',
      description: 'Comprehensive practice covering mandatory signs, warning signals, road lane markings, and police hand gestures.',
      language: 'English',
      vehicleCategory: 'Light',
      passingScore: 80,
      isActive: true,
    });

    await QuestionList.create({
      name: 'Heavy Vehicle Commercial Driver Theory Paper',
      description: 'Specific theory test preparation for commercial buses, dual-axle lorries, and prime mover licenses.',
      language: 'English',
      vehicleCategory: 'Heavy',
      passingScore: 80,
      isActive: true,
    });
  } else {
    defaultList = await QuestionList.findOne({});
  }

  // Ensure Sinhala and Tamil question lists exist (Rules 1 & 7)
  const sinhalaCount = await QuestionList.countDocuments({ language: 'Sinhala' });
  if (sinhalaCount === 0) {
    const sinhalaList = await QuestionList.create({
      name: 'Sinhala DMT Theory Paper - Set 1 (සිංහල මාර්ග නීති)',
      description: 'ශ්‍රී ලංකා මෝටර් රථ ප්‍රවාහන දෙපාර්තමේන්තුවේ නිල මාර්ග නීති හා සංඥා ප්‍රශ්න පත්‍රය.',
      language: 'Sinhala',
      vehicleCategory: 'Light',
      passingScore: 80,
      isActive: true,
    });
    const sinhalaQuestions = initialQuestions.map((q) => ({
      ...q,
      language: 'Sinhala',
      questionListId: sinhalaList._id,
    }));
    await QuizQuestion.insertMany(sinhalaQuestions);
  }

  const tamilCount = await QuestionList.countDocuments({ language: 'Tamil' });
  if (tamilCount === 0) {
    const tamilList = await QuestionList.create({
      name: 'Tamil DMT Theory Paper - Set 1 (தமிழ் வீதி விதிகள்)',
      description: 'இலங்கை மோட்டார் போக்குவரத்து திணைக்களத்தின் உத்தியோகபூர்வ வீதி விதிகள் வினாத்தாள்.',
      language: 'Tamil',
      vehicleCategory: 'Light',
      passingScore: 80,
      isActive: true,
    });
    const tamilQuestions = initialQuestions.map((q) => ({
      ...q,
      language: 'Tamil',
      questionListId: tamilList._id,
    }));
    await QuizQuestion.insertMany(tamilQuestions);
  }

  // Ensure questions exist in DB
  const qCount = await QuizQuestion.countDocuments({});
  if (qCount === 0) {
    const questionsToInsert = initialQuestions.map((q) => ({
      ...q,
      questionListId: defaultList ? defaultList._id : null,
    }));
    await QuizQuestion.insertMany(questionsToInsert);
  } else if (defaultList) {
    // If questions exist without questionListId, associate them with the default list
    await QuizQuestion.updateMany(
      { $or: [{ questionListId: null }, { questionListId: { $exists: false } }] },
      { $set: { questionListId: defaultList._id } }
    );
  }

  return defaultList;
}

// ==========================================
// 1. QUESTION LISTS CONTROLLERS (Admin & Staff)
// ==========================================

// @desc    Get all Question Lists with question counts
// @route   GET /api/quiz/lists
// @access  Public / Authenticated
exports.getQuestionLists = async (req, res) => {
  try {
    await ensureQuestionLists();

    const { language, vehicleCategory, search } = req.query;
    const filter = {};

    if (language && language !== 'All') {
      filter.language = language;
    }
    if (vehicleCategory && vehicleCategory !== 'All') {
      filter.vehicleCategory = { $in: [vehicleCategory, 'All'] };
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const lists = await QuestionList.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    // Compute question count for each list
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const questionCount = await QuizQuestion.countDocuments({
          questionListId: list._id,
          isActive: true,
        });
        const totalQuestions = await QuizQuestion.countDocuments({
          questionListId: list._id,
        });

        const listObj = list.toObject();
        listObj.questionCount = questionCount;
        listObj.totalQuestions = totalQuestions;
        return listObj;
      })
    );

    return res.status(200).json({
      success: true,
      count: listsWithCounts.length,
      lists: listsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching question lists:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve question lists',
      error: error.message,
    });
  }
};

// @desc    Get single Question List by ID with its questions
// @route   GET /api/quiz/lists/:id
// @access  Public / Authenticated
exports.getQuestionListById = async (req, res) => {
  try {
    const list = await QuestionList.findById(req.params.id).populate('createdBy', 'name email role');
    if (!list) {
      return res.status(404).json({ success: false, message: 'Question List not found' });
    }

    // Check if requester is staff/admin to decide whether to include correctAnswerIndex
    let isStaffOrAdmin = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sithma_super_secret_jwt_key_2026_ispm');
        if (decoded && (decoded.role === 'admin' || decoded.role === 'staff')) {
          isStaffOrAdmin = true;
        }
      } catch (e) {}
    }

    let questionsQuery = QuizQuestion.find({ questionListId: list._id }).sort({ createdAt: 1 });
    if (!isStaffOrAdmin) {
      questionsQuery = questionsQuery.where('isActive').equals(true).select('-correctAnswerIndex');
    }

    const questions = await questionsQuery;

    const listObj = list.toObject();
    listObj.questions = questions;
    listObj.questionCount = questions.length;

    return res.status(200).json({
      success: true,
      list: listObj,
    });
  } catch (error) {
    console.error('Error fetching question list details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve question list',
      error: error.message,
    });
  }
};

// @desc    Create a new Question List
// @route   POST /api/quiz/lists
// @access  Staff, Admin
exports.createQuestionList = async (req, res) => {
  try {
    const { name, description, language, vehicleCategory, passingScore } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question List name is required',
      });
    }

    const validLangs = ['English', 'Sinhala', 'Tamil'];
    const selectedLang = language ? language.trim() : '';
    if (!selectedLang || !validLangs.map((l) => l.toLowerCase()).includes(selectedLang.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Question List language is required and must be English, Sinhala, or Tamil',
      });
    }
    const normalizedLang = validLangs.find((l) => l.toLowerCase() === selectedLang.toLowerCase()) || 'English';

    const newList = await QuestionList.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      language: normalizedLang,
      vehicleCategory: vehicleCategory || 'Light',
      passingScore: passingScore ? Number(passingScore) : 80,
      createdBy: req.user?._id || null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Question List created successfully',
      list: newList,
    });
  } catch (error) {
    console.error('Error creating question list:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create question list',
    });
  }
};

// @desc    Update a Question List
// @route   PUT /api/quiz/lists/:id
// @access  Staff, Admin
exports.updateQuestionList = async (req, res) => {
  try {
    const { name, description, language, vehicleCategory, passingScore, isActive } = req.body;

    const list = await QuestionList.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ success: false, message: 'Question List not found' });
    }

    if (name !== undefined) list.name = name.trim();
    if (description !== undefined) list.description = description.trim();
    if (language !== undefined) {
      const validLangs = ['English', 'Sinhala', 'Tamil'];
      const selectedLang = language ? language.trim() : '';
      if (!selectedLang || !validLangs.map((l) => l.toLowerCase()).includes(selectedLang.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Question List language must be English, Sinhala, or Tamil',
        });
      }
      list.language = validLangs.find((l) => l.toLowerCase() === selectedLang.toLowerCase()) || 'English';
    }
    if (vehicleCategory !== undefined) list.vehicleCategory = vehicleCategory;
    if (passingScore !== undefined) list.passingScore = Number(passingScore);
    if (isActive !== undefined) list.isActive = Boolean(isActive);

    await list.save();

    return res.status(200).json({
      success: true,
      message: 'Question List updated successfully',
      list,
    });
  } catch (error) {
    console.error('Error updating question list:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update question list',
    });
  }
};

// @desc    Delete a Question List and its questions
// @route   DELETE /api/quiz/lists/:id
// @access  Staff, Admin
exports.deleteQuestionList = async (req, res) => {
  try {
    const list = await QuestionList.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ success: false, message: 'Question List not found' });
    }

    // Delete all associated questions
    const deleteResult = await QuizQuestion.deleteMany({ questionListId: list._id });
    await QuestionList.findByIdAndDelete(list._id);

    return res.status(200).json({
      success: true,
      message: `Question List "${list.name}" and ${deleteResult.deletedCount} associated questions deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting question list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete question list',
      error: error.message,
    });
  }
};

// ==========================================
// 2. QUIZ QUESTIONS CONTROLLERS
// ==========================================

// @desc    Get questions for practice quiz or list management
// @route   GET /api/quiz/questions
// @access  Public / Authenticated
exports.getQuizQuestions = async (req, res) => {
  try {
    await ensureQuestionLists();

    const {
      questionListId,
      language = 'English',
      vehicleCategory = 'Light',
      includeAnswers = 'false',
    } = req.query;

    // Check user auth & role
    let isStaffOrAdmin = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sithma_super_secret_jwt_key_2026_ispm');
        if (decoded) {
          if (decoded.role === 'admin' || decoded.role === 'staff') {
            isStaffOrAdmin = true;
          } else {
            // Type 1 scope restriction verification
            const student = await Student.findOne({ userId: decoded.id });
            if (student) {
              const isType1 =
                student.studentType === 'Type1_NewLearner' ||
                student.studentType === 'Type 1' ||
                student.student_type === 'Type 1';
              if (!isType1) {
                return res.status(403).json({
                  success: false,
                  message: 'Access Restricted: DMT Exam practice quizzes are available exclusively for Type 1 (New Learner) students preparing for their theory exam.',
                });
              }
            }
          }
        }
      } catch (e) {
        // Token parse error, proceed
      }
    }

    const filter = { isActive: true };

    if (questionListId) {
      const targetList = await QuestionList.findById(questionListId);
      if (!targetList) {
        return res.status(404).json({ success: false, message: 'Selected Question List not found' });
      }
      if (language && targetList.language && targetList.language.toLowerCase() !== language.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: `Language mismatch: Selected Question List is in ${targetList.language}, but you selected ${language}.`,
        });
      }
      filter.questionListId = questionListId;
    } else {
      if (language && language !== 'All') filter.language = language;
      if (vehicleCategory && vehicleCategory !== 'All') filter.vehicleCategory = vehicleCategory;
    }

    let query = QuizQuestion.find(filter).populate('questionListId', 'name language vehicleCategory');

    // Only expose correctAnswerIndex to staff/admin when requested
    if (!isStaffOrAdmin || includeAnswers !== 'true') {
      query = query.select('-correctAnswerIndex');
    }

    const questions = await query.sort({ createdAt: 1 });

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

// @desc    Create question inside a Question List (Staff/Admin)
// @route   POST /api/quiz/questions
// @access  Staff, Admin
exports.createQuizQuestion = async (req, res) => {
  try {
    let {
      questionListId,
      questionText,
      options,
      correctAnswerIndex,
      explanation,
      language,
      vehicleCategory,
    } = req.body;

    // Ensure list exists or assign to default list
    if (!questionListId) {
      const defaultList = await ensureQuestionLists();
      questionListId = defaultList?._id;
    }

    const targetList = await QuestionList.findById(questionListId);
    if (!targetList) {
      return res.status(404).json({ success: false, message: 'Specified Question List not found' });
    }

    const question = await QuizQuestion.create({
      questionListId,
      questionText,
      options,
      correctAnswerIndex: parseInt(correctAnswerIndex, 10),
      explanation: explanation || '',
      language: language || targetList.language || 'English',
      vehicleCategory: vehicleCategory || targetList.vehicleCategory || 'Light',
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Question added to Question List successfully',
      question,
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create question',
    });
  }
};

// @desc    Update a Quiz Question (Staff/Admin)
// @route   PUT /api/quiz/questions/:id
// @access  Staff, Admin
exports.updateQuizQuestion = async (req, res) => {
  try {
    const {
      questionText,
      options,
      correctAnswerIndex,
      explanation,
      language,
      vehicleCategory,
      questionListId,
      isActive,
    } = req.body;

    const question = await QuizQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (questionText !== undefined) question.questionText = questionText;
    if (options !== undefined) question.options = options;
    if (correctAnswerIndex !== undefined) question.correctAnswerIndex = parseInt(correctAnswerIndex, 10);
    if (explanation !== undefined) question.explanation = explanation;
    if (language !== undefined) question.language = language;
    if (vehicleCategory !== undefined) question.vehicleCategory = vehicleCategory;
    if (questionListId !== undefined) question.questionListId = questionListId;
    if (isActive !== undefined) question.isActive = Boolean(isActive);

    await question.save();

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update question',
    });
  }
};

// @desc    Delete Quiz Question (Staff/Admin)
// @route   DELETE /api/quiz/questions/:id
// @access  Staff, Admin
exports.deleteQuizQuestion = async (req, res) => {
  try {
    const question = await QuizQuestion.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete question',
    });
  }
};

// ==========================================
// 3. STUDENT EXAM ATTEMPT & HISTORY
// ==========================================

// @desc    Submit Quiz Attempt (Server validates answers & snapshots question states)
// @route   POST /api/quiz/attempt
// @access  Student
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { questionListId, language, vehicleCategory, userAnswers } = req.body;
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

    // Type 1 Exclusive Access: Only Type 1 students can submit exam quizzes
    const isType1 =
      student.studentType === 'Type1_NewLearner' ||
      student.studentType === 'Type 1' ||
      student.student_type === 'Type 1';
    if (!isType1) {
      return res.status(403).json({
        success: false,
        message: 'Access Restricted: DMT Exam practice quizzes are available exclusively for Type 1 (New Learner) students.',
      });
    }

    // Fetch Question List name if questionListId provided
    let listName = 'General DMT Practice Exam';
    let qListDoc = null;
    if (questionListId) {
      qListDoc = await QuestionList.findById(questionListId);
      if (!qListDoc) {
        return res.status(404).json({ success: false, message: 'Selected Question List not found' });
      }
      if (language && qListDoc.language && qListDoc.language.toLowerCase() !== language.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: `Language mismatch: Question List "${qListDoc.name}" is in ${qListDoc.language}, but your selected exam language is ${language}.`,
        });
      }
      listName = qListDoc.name;
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
          questionText: q.questionText,
          options: q.options,
          explanation: q.explanation || '',
          selectedOption: ans.selectedOption !== undefined ? ans.selectedOption : -1,
          correctOption: q.correctAnswerIndex,
          isCorrect,
        });
      }
    });

    const totalQuestions = userAnswers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passThreshold = qListDoc?.passingScore || 80;
    const passed = percentage >= passThreshold;

    const attempt = await QuizAttempt.create({
      studentId: student._id,
      userId: req.user._id,
      questionListId: qListDoc?._id || null,
      questionListName: listName,
      status: 'Completed',
      language: language || qListDoc?.language || 'English',
      vehicleCategory: vehicleCategory || qListDoc?.vehicleCategory || 'Light',
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
      questionListName: listName,
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

    // Security check: Student can only view their own attempts; Staff and Admin can view any
    if (
      req.user.role === 'student' &&
      student.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to student exam records',
      });
    }

    const attempts = await QuizAttempt.find({ studentId: student._id })
      .populate('questionListId', 'name description passingScore')
      .sort({ takenAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    console.error('Error retrieving student quiz attempts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz attempts',
      error: error.message,
    });
  }
};

// @desc    Get detailed single completed attempt (Read-Only Review)
// @route   GET /api/quiz/attempts/:id
// @access  Student (owner), Staff, Admin
exports.getQuizAttemptById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('questionListId', 'name description passingScore language vehicleCategory')
      .populate('studentId', 'studentId name studentType');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Exam attempt not found' });
    }

    // Security check
    if (
      req.user.role === 'student' &&
      attempt.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only review your own exam attempts',
      });
    }

    // Backward compatibility: If an older attempt does not have questionText in answers, populate from QuizQuestion
    const answers = await Promise.all(
      attempt.answers.map(async (ans) => {
        const item = ans.toObject ? ans.toObject() : ans;
        if (!item.questionText || !item.options || item.options.length === 0) {
          const originalQ = await QuizQuestion.findById(item.questionId);
          if (originalQ) {
            item.questionText = originalQ.questionText;
            item.options = originalQ.options;
            item.explanation = originalQ.explanation || '';
          }
        }
        return item;
      })
    );

    const attemptObj = attempt.toObject();
    attemptObj.answers = answers;

    return res.status(200).json({
      success: true,
      attempt: attemptObj,
    });
  } catch (error) {
    console.error('Error retrieving attempt review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve exam attempt',
      error: error.message,
    });
  }
};
