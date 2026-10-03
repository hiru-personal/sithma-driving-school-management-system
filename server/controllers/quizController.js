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
];

const sinhalaSeedQuestions = [
  {
    questionText: 'නාගරික මාර්ගයක සැහැල්ලු මෝටර් රථයක් ධාවනය කළ හැකි උපරිම වේග සීමාව කොපමණද?',
    options: ['පැයට කිලෝමීටර් 50', 'පැයට කිලෝමීටර් 70', 'පැයට කිලෝමීටර් 40', 'පැයට කිලෝමීටර් 60'],
    correctAnswerIndex: 0,
    explanation: 'ශ්‍රී ලංකාවේ නීතියට අනුව නාගරික ප්‍රදේශ වල සැහැල්ලු වාහන උපරිම වේගය පැ.කි.මී. 50 කි.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'කහ පැහැයෙන් නිවෙමින් දැල්වෙන (Flashing Amber) රථවාහන සංඥා එළියකින් අදහස් වන්නේ කුමක්ද?',
    options: ['වහාම වාහනය නවතින්න', 'දෙපස විමසිලිමත්ව බලා ප්‍රවේශමෙන් ඉදිරියට යන්න', 'වේගය වැඩිකර ඉදිරියට යන්න', 'මාර්ගය සම්පූර්ණයෙන්ම වසා ඇත'],
    correctAnswerIndex: 1,
    explanation: 'කහ පැහැයෙන් නිවෙමින් දැල්වෙන සංඥාවෙන් රියදුරාට අනතුරු අඟවන්නේ ප්‍රවේශමෙන් ඉදිරියට යන ලෙසයි.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'පදික මාරුවක් (Zebra Crossing) අසල පදිකයෙකු පාර මාරු වීමට සූදානම්ව සිටින විට රියදුරෙකු කළ යුත්තේ කුමක්ද?',
    options: ['නලා ශබ්ද කර වේගයෙන් යෑම', 'වාහනය නවත්වා පදිකයාට පාර මාරුවීමට ප්‍රමුඛතාව දීම', 'ප්‍රධාන ලාම්පු දල්වා අනතුරු ඇඟවීම', 'වම් පසින් ඉස්සර කර යාම'],
    correctAnswerIndex: 1,
    explanation: 'පදික මාරුවකදී නීත්‍යානුකූලව පදිකයින්ට පූර්ණ ප්‍රමුඛතාවය හිමිවේ.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'මාර්ගය මධ්‍යයේ ඇති තනි අඛණ්ඩ සුදු හෝ කහ ඉරකින් (Single Continuous Line) අදහස් වන්නේ කුමක්ද?',
    options: ['ඕනෑම වේලාවක ඉස්සර කළ හැක', 'එම ඉර මතින් ධාවනය කිරීම හෝ ඉස්සර කිරීම තහනම්ය', 'වාහන නැවැත්වීම සඳහා වෙන්කළ තීරුවකි', 'වේගය වැඩි කළ හැකි සීමාවකි'],
    correctAnswerIndex: 1,
    explanation: 'අඛණ්ඩ ඉරක් මතින් ගමන් කිරීම, කැපීම හෝ ඉස්සර කිරීම නීතියෙන් තහනම් වේ.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'වටරවුමකට (Roundabout) ඇතුළු වීමේදී ප්‍රමුඛතාවය ලබාදිය යුත්තේ කාටද?',
    options: ['වම් පසින් පැමිණෙන වාහන වලට', 'තමන්ගේ දකුණු පසින් වටරවුම තුළ ධාවනය වන වාහන වලට', 'වටරවුමට පිටතින් සිටින වාහන වලට', 'ප්‍රමාණයෙන් විශාල වාහන වලට පමණි'],
    correctAnswerIndex: 1,
    explanation: 'ශ්‍රී ලංකාවේ රථවාහන නීතියට අනුව වටරවුමකදී සැමවිටම දකුණෙන් එන වාහන වලට ප්‍රමුඛතාව දිය යුතුය.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'සාමාන්‍ය වියළි කාලගුණික තත්ත්වයකදී ඉදිරියෙන් ධාවනය වන වාහනය හා තබාගත යුතු අවම ආරක්ෂිත කාල පරතරය කුමක්ද?',
    options: ['තත්පර 1ක පරතරය', 'තත්පර 2ක පරතරය (2-Second Rule)', 'තත්පර 5ක පරතරය', 'මීටර් 2ක පරතරය'],
    correctAnswerIndex: 1,
    explanation: 'සාමාන්‍ය තත්ත්ව යටතේ ආරක්ෂිත නැවැත්වීමේ පරතරය සඳහා "තත්පර දෙකේ නීතිය" අනුගමනය කළ යුතුය.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'හදිසි ආපදා සේවා රථයක් (ගිලන් රථයක් හෝ ගිනි නිවන රථයක්) සයිරන් නලා හඬවමින් පැමිණෙන විට කළ යුත්තේ කුමක්ද?',
    options: ['එම රථයට ඉදිරියෙන් වේගයෙන් ධාවනය කිරීම', 'වාහනය වම්පසට කර මාර්ගය සම්පූර්ණයෙන්ම නිදහස් කර දීම', 'නලා ශබ්ද කරමින් සාමාන්‍ය පරිදි ගමන් කිරීම', 'ක්ෂණිකව මාර්ගය මැද නැවතීම'],
    correctAnswerIndex: 1,
    explanation: 'හදිසි සේවා රථ සඳහා වහාම වම් පසට වාහනය ගෙන මාර්ගය නිදහස් කර දිය යුතුය.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'කහ කොටු හන්දියක (Yellow Box Junction) වාහනයක් නැවැත්විය හැක්කේ කුමන අවස්ථාවේදීද?',
    options: ['ඕනෑම රථවාහන තදබදයකදී', 'දකුණට හැරවීමට බලාපොරොත්තුවෙන් සිටින විට ඉදිරියෙන් එන වාහන නිසා බාධා වී ඇති විට පමණි', 'පදිකයින් සිටින විට පමණි', 'කිසිම අවස්ථාවක නතර කළ නොහැක'],
    correctAnswerIndex: 1,
    explanation: 'කහ කොටු හන්දියක නැවැත්විය හැක්කේ දකුණට හැරවීමට බලා සිටින විට ඉදිරියෙන් එන වාහන වලට ඉඩදීමට පමණි.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'වංගුවක්, කඳු මුදුනක් හෝ පදික මාරුවක් අසලදී වෙනත් වාහනයක් ඉස්සර කිරීම (Overtaking):',
    options: ['ඉදිරියෙන් වාහන නොඑන්නේ නම් කළ හැක', 'සම්පූර්ණයෙන්ම නීති විරෝධී හා අනතුරුදායක වේ', 'රාත්‍රී කාලයේදී පමණක් කළ හැක', 'අඩු වේගයකින් කළ හැක'],
    correctAnswerIndex: 1,
    explanation: 'දෘශ්‍යතාව අවහිර වන ස්ථාන වල සහ පදික මාරු අසල ඉස්සර කිරීම සම්පූර්ණයෙන්ම තහනම්ය.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'ශ්‍රී ලංකාවේ සැහැල්ලු වාහන රියදුරු බලපත්‍රයක් ලබාගැනීම සඳහා තිබිය යුතු අවම වයස් සීමාව කුමක්ද?',
    options: ['අවුරුදු 16', 'අවුරුදු 17', 'අවුරුදු 18', 'අවුරුදු 21'],
    correctAnswerIndex: 2,
    explanation: 'සැහැල්ලු වාහන (Class B / A1) රියදුරු බලපත්‍රයක් සඳහා අවම වයස අවුරුදු 18 සම්පූර්ණ විය යුතුය.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'රාත්‍රී කාලයේදී ඉදිරියෙන් වෙනත් වාහනයක් පැමිණෙන විට ඔබේ වාහනයේ ප්‍රධාන ලාම්පු (Headlights):',
    options: ['අධි ආලෝකයෙන් (High Beam) තබාගත යුතුය', 'අව ආලෝකයට (Low/Dim Beam) මාරු කළ යුතුය', 'සම්පූර්ණයෙන්ම නිවා දැමිය යුතුය', 'අනතුරු හැඟවීමේ ලාම්පු දැල්විය යුතුය'],
    correctAnswerIndex: 1,
    explanation: 'ඉදිරියෙන් එන රියදුරුගේ දෑස් නිලංකාර වීම වැළැක්වීම සඳහා ඩිම් එළියට (Low Beam) මාරු කළ යුතුය.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'මාර්ගයක වාහනයක් කාර්මික දෝෂයකට ලක්ව නතර වුවහොත්, අනතුරු ඇඟවීමේ ත්‍රිකෝණය (Warning Triangle) තැබිය යුතු අවම දුර කොපමණද?',
    options: ['මීටර් 10ක් පිටුපසින්', 'මීටර් 25ක් පිටුපසින්', 'මීටර් 50ක් පිටුපසින්', 'මීටර් 100ක් පිටුපසින්'],
    correctAnswerIndex: 2,
    explanation: 'පසුපසින් එන වාහන වලට කලින් අනතුරු ඇඟවීම සඳහා අවම වශයෙන් මීටර් 50ක් පිටුපසින් ත්‍රිකෝණය තැබිය යුතුය.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'රියදුරෙකුගේ රුධිරයේ තිබිය හැකි උපරිම නීත්‍යානුකූල මධ්‍යසාර (Alcohol) ප්‍රමාණය කොපමණද?',
    options: ['රුධිර මිලිලීටර් 100 කට මිලිග්‍රෑම් 30 (0.03g/100ml)', 'රුධිර මිලිලීටර් 100 කට මිලිග්‍රෑම් 80 (0.08g/100ml)', 'කිසිදු සීමාවක් නැත', 'රුධිර මිලිලීටර් 100 කට මිලිග්‍රෑම් 100'],
    correctAnswerIndex: 0,
    explanation: 'ශ්‍රී ලංකාවේ නීතිය අනුව රුධිර මිලිලීටර් 100 කට මිලිග්‍රෑම් 30 ට වැඩි මධ්‍යසාර තිබීම නීති විරෝධී වේ.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'රථවාහන සංඥා පුවරු අතරින් ත්‍රිකෝණාකාර හැඩයෙන් යුත් පුවරු වලින් දැක්වෙන්නේ මොනවාද?',
    options: ['විධාන සංඥා (Mandatory Signs)', 'අන්තරාය ඇඟවීමේ සංඥා (Warning Signs)', 'තොරතුරු සංඥා (Informative Signs)', 'දිශා පෙන්වන සංඥා'],
    correctAnswerIndex: 1,
    explanation: 'ත්‍රිකෝණාකාර රතු දාර සහිත පුවරු වලින් ඉදිරියෙන් ඇති අන්තරායන් පිළිබඳව අවවාද කරනු ලබයි.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'රවුම් හැඩැති රතු දාරයක් සහිත සංඥා පුවරු වලින් ප්‍රකාශ වන්නේ කුමක්ද?',
    options: ['අවවාදාත්මක සංඥා', 'තහනම් හෝ නියෝගාත්මක විධාන (Prohibitory / Mandatory Orders)', 'තොරතුරු දැනුම්දීම්', 'නවාතැන් පොළවල්'],
    correctAnswerIndex: 1,
    explanation: 'රවුම් රතු දාර සහිත පුවරු මගින් යම් ක්‍රියාවක් කිරීම තහනම් බව හෝ විධානයක් නිකුත් කරයි.',
    language: 'Sinhala',
    vehicleCategory: 'Light',
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

const tamilSeedQuestions = [
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
  {
    questionText: 'பாதசாரி கடவையில் (Zebra Crossing) பாதசாரி ஒருவர் கடக்கத் தயாராகும்போது செய்ய வேண்டியது யாது?',
    options: ['ஒலிப்பான் எழுப்பி தொடர்ந்து செல்லுதல்', 'வாகனத்தை நிறுத்தி பாதசாரிக்கு முதலிடம் கொடுத்தல்', 'முகப்பு விளக்குகளை ஒளிரச் செய்தல்', 'வலதுபுறமாக முந்துதல்'],
    correctAnswerIndex: 1,
    explanation: 'பாதசாரி கடவைகளில் பாதசாரிகளுக்கே முழு முன்னுரிமை உண்டு.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'வீதியின் நடுவே உள்ள தொடர்ச்சியான வெள்ளைக் கோடு எதனை உணர்த்துகிறது?',
    options: ['முந்திச் செல்லலாம்', 'கோட்டைத் தாண்டி முந்துவது தடைசெய்யப்பட்டுள்ளது', 'வாகனங்கள் நிறுத்தலாம்', 'வேகத்தை அதிகரிக்கலாம்'],
    correctAnswerIndex: 1,
    explanation: 'தொடர்ச்சியான கோட்டைத் தாண்டுவது அல்லது அதன் மேல் வாகனம் செலுத்துவது சட்டப்படி குற்றமாகும்.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'வட்டச்சுற்றில் (Roundabout) நுழையும் போது யாருக்கு முன்னுரிமை அளிக்க வேண்டும்?',
    options: ['இடதுபுறத்தில் வரும் வாகனங்களுக்கு', 'வட்டச்சுற்றினுள் வலதுபுறத்தில் இருந்து வரும் வாகனங்களுக்கு', 'வெளியேறும் வாகனங்களுக்கு', 'பெரிய வாகனங்களுக்கு மட்டும்'],
    correctAnswerIndex: 1,
    explanation: 'இலங்கையின் போக்குவரத்து விதிகளின்படி வட்டச்சுற்றில் வலதுபுற வாகனங்களுக்கே முன்னுரிமை உண்டு.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'சாதாரண உலர் காலநிலையின் போது முன்னால் செல்லும் வாகனத்துடன் பேண வேண்டிய குறைந்தபட்ச இடைவெளி என்ன?',
    options: ['1 வினாடி இடைவெளி', '2 வினாடிகள் விதி (2-Second Rule)', '5 வினாடிகள் விதி', '10 மீட்டர்கள்'],
    correctAnswerIndex: 1,
    explanation: 'பாதுகாப்பான நிறுத்த இடைவெளிக்கு 2 வினாடிகள் விதியைப் பின்பற்ற வேண்டும்.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'அவசர ஊர்தி (ஆம்புலன்ஸ் அல்லது தீயணைப்பு வாகனம்) வரும்போது சாரதி செய்ய வேண்டியது யாது?',
    options: ['அதற்கு முன்னால் வேகமாக ஓட்டுதல்', 'வாகனத்தை இடதுபுறமாக ஒதுக்கி வழியமைத்தல்', 'ஒலிப்பான் எழுப்பி தொடர்ந்து செல்லுதல்', 'வீதியின் நடுவே நிறுத்துதல்'],
    correctAnswerIndex: 1,
    explanation: 'அவசர ஊர்திகளுக்கு உடனடியாக இடதுபுறமாக ஒதுங்கி பாதையை விட்டுக்கொடுக்க வேண்டும்.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'மஞ்சள் பெட்டி சந்திப்பில் (Yellow Box Junction) வாகனத்தை எப்போது நிறுத்தலாம்?',
    options: ['எந்த போக்குவரத்து நெரிசலிலும்', 'வலதுபுறம் திரும்ப காத்திருக்கும் போது எதிரே வரும் வாகனங்களுக்காக மட்டும்', 'பாதசாரிகள் இருக்கும் போது', 'எப்போதும் நிறுத்த முடியாது'],
    correctAnswerIndex: 1,
    explanation: 'வலதுபுறம் திரும்பக் காத்திருக்கும்போது மட்டுமே மஞ்சள் பெட்டியில் நிற்க அனுமதிக்கப்படுகிறது.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'இலங்கையில் இலகுரக வாகன ஓட்டுநர் உரிமம் பெறுவதற்கான குறைந்தபட்ச வயது என்ன?',
    options: ['16 வயது', '17 வயது', '18 வயது', '21 வயது'],
    correctAnswerIndex: 2,
    explanation: 'இலகுரக வாகன ஓட்டுநர் உரிமத்திற்கு குறைந்தபட்சம் 18 வயது பூர்த்தியடைந்திருக்க வேண்டும்.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  },
  {
    questionText: 'முக்கோண வடிவ போக்குவரத்து அடையாள பலகைகள் எதனைக் குறிக்கின்றன?',
    options: ['கட்டாய உத்தரவுகள்', 'எச்சரிக்கை அடையாளங்கள் (Warning Signs)', 'தகவல் பலகைகள்', 'திசை அடையாளங்கள்'],
    correctAnswerIndex: 1,
    explanation: 'சிவப்பு எல்லை கொண்ட முக்கோண பலகைகள் முன்னுள்ள ஆபத்துக்களை எச்சரிக்கின்றன.',
    language: 'Tamil',
    vehicleCategory: 'Light',
  }
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
    defaultList = await QuestionList.findOne({ language: 'English' });
  }

  // Ensure Sinhala question list with Sinhala questions exists
  let sinhalaList = await QuestionList.findOne({ language: 'Sinhala' });
  if (!sinhalaList) {
    sinhalaList = await QuestionList.create({
      name: 'Sinhala DMT Theory Paper - Set 1 (සිංහල මාර්ග නීති)',
      description: 'ශ්‍රී ලංකා මෝටර් රථ ප්‍රවාහන දෙපාර්තමේන්තුවේ නිල මාර්ග නීති, සංඥා හා රියදුරු විභාග ප්‍රශ්න පත්‍රය.',
      language: 'Sinhala',
      vehicleCategory: 'Light',
      passingScore: 80,
      isActive: true,
    });
  }
  const sinhalaQCount = await QuizQuestion.countDocuments({ questionListId: sinhalaList._id });
  if (sinhalaQCount === 0) {
    const sinhalaQuestions = sinhalaSeedQuestions.map((q) => ({
      ...q,
      questionListId: sinhalaList._id,
    }));
    await QuizQuestion.insertMany(sinhalaQuestions);
  }

  // Ensure Tamil question list with Tamil questions exists
  let tamilList = await QuestionList.findOne({ language: 'Tamil' });
  if (!tamilList) {
    tamilList = await QuestionList.create({
      name: 'Tamil DMT Theory Paper - Set 1 (தமிழ் வீதி விதிகள்)',
      description: 'இலங்கை மோட்டார் போக்குவரத்து திணைக்களத்தின் உத்தியோகபூர்வ வீதி விதிகள் வினாத்தாள்.',
      language: 'Tamil',
      vehicleCategory: 'Light',
      passingScore: 80,
      isActive: true,
    });
  }
  const tamilQCount = await QuizQuestion.countDocuments({ questionListId: tamilList._id });
  if (tamilQCount === 0) {
    const tamilQuestions = tamilSeedQuestions.map((q) => ({
      ...q,
      questionListId: tamilList._id,
    }));
    await QuizQuestion.insertMany(tamilQuestions);
  }

  // Ensure English questions exist in DB
  const englishQCount = await QuizQuestion.countDocuments({ language: 'English' });
  if (englishQCount === 0 && defaultList) {
    const englishQuestions = initialQuestions.filter(q => q.language === 'English').map((q) => ({
      ...q,
      questionListId: defaultList._id,
    }));
    await QuizQuestion.insertMany(englishQuestions);
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
