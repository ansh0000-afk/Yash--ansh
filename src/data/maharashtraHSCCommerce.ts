export interface HSCChapter {
  id: string;
  number: number;
  name: string;
  part?: string;
}

export interface HSCCommerceSubject {
  id: string;
  name: string;
  code: string;
  iconName: string;
  color: string;
  description: string;
  chapters: HSCChapter[];
  chaptersCount: number;
}

export const MAHARASHTRA_HSC_BOARD_INFO = {
  boardName:
    'Maharashtra State Board of Secondary & Higher Secondary Education',
  shortName: 'MSBSHSE',
  className: 'Class 12 (HSC) Commerce',
  academicYear: '2026-27',
  examSession: 'HSC February-March 2027',
};

export const CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS: HSCCommerceSubject[] = [
  {
    id: 'accountancy',
    name: 'Book Keeping & Accountancy',
    code: '50',
    iconName: 'Calculator',
    color: 'from-emerald-600 to-teal-700',
    description: 'Maharashtra HSC Class 12 Commerce',
    chapters: [
      {
        id: 'bk-1',
        number: 1,
        name: 'Introduction to Partnership and Partnership Final Accounts',
      },
      {
        id: 'bk-2',
        number: 2,
        name: 'Accounts of Not for Profit Concerns',
      },
      {
        id: 'bk-3',
        number: 3,
        name: 'Reconstitution of Partnership – Admission of Partner',
      },
      {
        id: 'bk-4',
        number: 4,
        name: 'Reconstitution of Partnership – Retirement of Partner',
      },
      {
        id: 'bk-5',
        number: 5,
        name: 'Reconstitution of Partnership – Death of Partner',
      },
      {
        id: 'bk-6',
        number: 6,
        name: 'Dissolution of Partnership Firm',
      },
      {
        id: 'bk-7',
        number: 7,
        name: 'Bills of Exchange – Trade Bill',
      },
      {
        id: 'bk-8',
        number: 8,
        name: 'Company Accounts',
      },
      {
        id: 'bk-9',
        number: 9,
        name: 'Analysis of Financial Statements',
      },
      {
        id: 'bk-10',
        number: 10,
        name: 'Computer in Accounting',
      },
    ],
    chaptersCount: 10,
  },

  {
    id: 'ocm',
    name: 'Organisation of Commerce & Management',
    code: '51',
    iconName: 'Building2',
    color: 'from-amber-600 to-orange-700',
    description: 'Maharashtra HSC Class 12 Commerce',
    chapters: [
      {
        id: 'ocm-1',
        number: 1,
        name: 'Principles of Management',
      },
      {
        id: 'ocm-2',
        number: 2,
        name: 'Functions of Management',
      },
      {
        id: 'ocm-3',
        number: 3,
        name: 'Entrepreneurship Development',
      },
      {
        id: 'ocm-4',
        number: 4,
        name: 'Business Services',
      },
      {
        id: 'ocm-5',
        number: 5,
        name: 'Emerging Modes of Business',
      },
      {
        id: 'ocm-6',
        number: 6,
        name: 'Social Responsibilities of Business',
      },
      {
        id: 'ocm-7',
        number: 7,
        name: 'Consumer Protection',
      },
      {
        id: 'ocm-8',
        number: 8,
        name: 'Marketing',
      },
    ],
    chaptersCount: 8,
  },

  {
    id: 'economics',
    name: 'Economics',
    code: '49',
    iconName: 'TrendingUp',
    color: 'from-blue-600 to-indigo-700',
    description: 'Maharashtra HSC Class 12 Commerce',
    chapters: [
      {
        id: 'eco-1',
        number: 1,
        name: 'Introduction to Micro and Macro Economics',
      },
      {
        id: 'eco-2',
        number: 2,
        name: 'Utility Analysis',
      },
      {
        id: 'eco-3a',
        number: 3,
        name: 'Demand Analysis',
      },
      {
        id: 'eco-3b',
        number: 4,
        name: 'Elasticity of Demand',
      },
      {
        id: 'eco-4',
        number: 5,
        name: 'Supply Analysis',
      },
      {
        id: 'eco-5',
        number: 6,
        name: 'Forms of Market',
      },
      {
        id: 'eco-6',
        number: 7,
        name: 'Index Numbers',
      },
      {
        id: 'eco-7',
        number: 8,
        name: 'National Income',
      },
      {
        id: 'eco-8',
        number: 9,
        name: 'Public Finance in India',
      },
      {
        id: 'eco-9',
        number: 10,
        name: 'Money Market and Capital Market in India',
      },
      {
        id: 'eco-10',
        number: 11,
        name: 'Foreign Trade of India',
      },
    ],
    chaptersCount: 11,
  },

  {
    id: 'sp',
    name: 'Secretarial Practice',
    code: '52',
    iconName: 'FileText',
    color: 'from-rose-600 to-pink-700',
    description: 'Maharashtra HSC Class 12 Commerce',
    chapters: [
      { id: 'sp-1', number: 1, name: 'Introduction to Corporate Finance' },
      { id: 'sp-2', number: 2, name: 'Sources of Corporate Finance' },
      { id: 'sp-3', number: 3, name: 'Issue of Shares' },
      { id: 'sp-4', number: 4, name: 'Issue of Debentures' },
      { id: 'sp-5', number: 5, name: 'Deposits' },
      { id: 'sp-6', number: 6, name: 'Correspondence with Members' },
      {
        id: 'sp-7',
        number: 7,
        name: 'Correspondence with Debentureholders',
      },
      { id: 'sp-8', number: 8, name: 'Correspondence with Depositors' },
      { id: 'sp-9', number: 9, name: 'Depository System' },
      { id: 'sp-10', number: 10, name: 'Dividend and Interest' },
      { id: 'sp-11', number: 11, name: 'Financial Market' },
      { id: 'sp-12', number: 12, name: 'Stock Exchange' },
    ],
    chaptersCount: 12,
  },

  {
    id: 'maths',
    name: 'Mathematics & Statistics (Commerce)',
    code: '40 / 88',
    iconName: 'Calculator',
    color: 'from-purple-600 to-indigo-800',
    description: 'Maharashtra HSC Class 12 Commerce',
    chapters: [
      { id: 'math-1', number: 1, name: 'Mathematical Logic', part: 'Part I' },
      { id: 'math-2', number: 2, name: 'Matrices', part: 'Part I' },
      { id: 'math-3', number: 3, name: 'Differentiation', part: 'Part I' },
      {
        id: 'math-4',
        number: 4,
        name: 'Applications of Derivatives',
        part: 'Part I',
      },
      { id: 'math-5', number: 5, name: 'Integration', part: 'Part I' },
      {
        id: 'math-6',
        number: 6,
        name: 'Definite Integration',
        part: 'Part I',
      },
      {
        id: 'math-7',
        number: 7,
        name: 'Applications of Definite Integration',
        part: 'Part I',
      },
      {
        id: 'math-8',
        number: 8,
        name: 'Differential Equation and Applications',
        part: 'Part I',
      },
      {
        id: 'math-9',
        number: 9,
        name: 'Commission, Brokerage and Discount',
        part: 'Part II',
      },
      {
        id: 'math-10',
        number: 10,
        name: 'Insurance and Annuity',
        part: 'Part II',
      },
      {
        id: 'math-11',
        number: 11,
        name: 'Linear Regression',
        part: 'Part II',
      },
      { id: 'math-12', number: 12, name: 'Time Series', part: 'Part II' },
      { id: 'math-13', number: 13, name: 'Index Numbers', part: 'Part II' },
      {
        id: 'math-14',
        number: 14,
        name: 'Linear Programming',
        part: 'Part II',
      },
      {
        id: 'math-15',
        number: 15,
        name: 'Assignment Problem and Sequencing',
        part: 'Part II',
      },
      {
        id: 'math-16',
        number: 16,
        name: 'Probability Distributions',
        part: 'Part II',
      },
    ],
    chaptersCount: 16,
  },

  {
    id: 'english',
    name: 'English Yuvakbharati',
    code: '01',
    iconName: 'BookOpen',
    color: 'from-sky-600 to-blue-700',
    description: 'Maharashtra HSC Class 12 English',
    chapters: [],
    chaptersCount: 0,
  },

  {
    id: 'marathi',
    name: 'Marathi',
    code: '02',
    iconName: 'BookOpen',
    color: 'from-orange-600 to-red-700',
    description: 'Maharashtra HSC Class 12 Marathi',
    chapters: [],
    chaptersCount: 0,
  },

  {
    id: 'hindi',
    name: 'Hindi',
    code: '04',
    iconName: 'BookOpen',
    color: 'from-yellow-600 to-amber-700',
    description: 'Maharashtra HSC Class 12 Hindi',
    chapters: [],
    chaptersCount: 0,
  },

  {
    id: 'it',
    name: 'Information Technology (Commerce)',
    code: '99',
    iconName: 'Monitor',
    color: 'from-cyan-600 to-blue-700',
    description: 'Maharashtra HSC Class 12 Information Technology',
    chapters: [
      {
        id: 'it-1',
        number: 1,
        name: 'Advanced Web Designing',
      },
      {
        id: 'it-2',
        number: 2,
        name: 'Digital Marketing',
      },
      {
        id: 'it-3',
        number: 3,
        name: 'Computerised Accounting with GST',
      },
      {
        id: 'it-4',
        number: 4,
        name: 'E-Commerce and E-Governance',
      },
      {
        id: 'it-5',
        number: 5,
        name: 'Database Concepts using LibreOffice Base',
      },
      {
        id: 'it-6',
        number: 6,
        name: 'Enterprise Resource Planning (ERP)',
      },
    ],
    chaptersCount: 6,
  },
];
{
  id: 'english',
  name: 'English Yuvakbharati',
  code: '01',
  iconName: 'BookOpen',
  color: 'from-sky-600 to-blue-700',
  description: 'Maharashtra HSC Class 12 English',
  chapters: [
    { id: 'eng-1', number: 1, name: 'An Astrologer’s Day' },
    { id: 'eng-2', number: 2, name: 'On Saying “Please”' },
    { id: 'eng-3', number: 3, name: 'The Cop and the Anthem' },
    { id: 'eng-4', number: 4, name: 'Big Data-Big Insights' },
    { id: 'eng-5', number: 5, name: 'The New Dress' },
    { id: 'eng-6', number: 6, name: 'Into the Wild' },
    { id: 'eng-7', number: 7, name: 'Why We Travel' },
    { id: 'eng-8', number: 8, name: 'Voyaging Towards Excellence' },

    { id: 'eng-9', number: 9, name: 'Song of the Open Road' },
    { id: 'eng-10', number: 10, name: 'Indian Weavers' },
    { id: 'eng-11', number: 11, name: 'The Inchcape Rock' },
    { id: 'eng-12', number: 12, name: 'Have You Earned Your Tomorrow' },
    { id: 'eng-13', number: 13, name: 'Father Returning Home' },
    { id: 'eng-14', number: 14, name: 'Money' },
    { id: 'eng-15', number: 15, name: 'She Walks in Beauty' },
    { id: 'eng-16', number: 16, name: 'Small Towns and Rivers' },

    { id: 'eng-17', number: 17, name: 'Summary Writing' },
    {
      id: 'eng-18',
      number: 18,
      name: 'Do Schools Really Kill Creativity? – Mind-mapping',
    },
    { id: 'eng-19', number: 19, name: 'Note Making' },
    { id: 'eng-20', number: 20, name: 'Statement of Purpose' },
    { id: 'eng-21', number: 21, name: 'Drafting a Virtual Message' },
    { id: 'eng-22', number: 22, name: 'Group Discussion' },

    { id: 'eng-23', number: 23, name: 'History of Novel' },
    { id: 'eng-24', number: 24, name: 'To Sir, with Love' },
    {
      id: 'eng-25',
      number: 25,
      name: 'Around the World in Eighty Days',
    },
    { id: 'eng-26', number: 26, name: 'The Sign of Four' },

    { id: 'eng-27', number: 27, name: 'Grammar Section' },
    { id: 'eng-28', number: 28, name: 'Additional Writing Skills' },
    {
      id: 'eng-29',
      number: 29,
      name: 'Reading Skill – Textual and Non-textual',
    },
  ],
  chaptersCount: 29,
},

{
  id: 'marathi',
  name: 'Marathi',
  code: '02',
  iconName: 'BookOpen',
  color: 'from-orange-600 to-red-700',
  description: 'Maharashtra HSC Class 12 Marathi',
  chapters: [
    { id: 'mar-1', number: 1, name: 'वेगवशता' },
    { id: 'mar-2', number: 2, name: 'विंचू चावला ... (भारूड)' },
    { id: 'mar-3', number: 3, name: 'शोध' },
    { id: 'mar-4', number: 4, name: 'मुलाखत' },
    { id: 'mar-5', number: 5, name: 'लेखन – निबंधलेखन' },
    { id: 'mar-6', number: 6, name: 'रोज मातीत (कविता)' },
    { id: 'mar-7', number: 7, name: 'रेशीमबंध' },
    { id: 'mar-8', number: 8, name: 'गढी' },
    { id: 'mar-9', number: 9, name: 'माहितीपत्रक' },
    { id: 'mar-10', number: 10, name: 'व्याकरण' },
    {
      id: 'mar-11',
      number: 11,
      name: 'आयुष्य ... आनंदाचा उत्सव',
    },
    {
      id: 'mar-12',
      number: 12,
      name: 'समुद्र कोंडून पडलाय (कविता)',
    },
    {
      id: 'mar-13',
      number: 13,
      name: 'कथा-साहित्यप्रकार-परिचय',
    },
    { id: 'mar-14', number: 14, name: 'अहवाल' },
    {
      id: 'mar-15',
      number: 15,
      name: 'रे थांब जरा आषाढघना (कविता)',
    },
    { id: 'mar-16', number: 16, name: 'दंतकथा' },
    {
      id: 'mar-17',
      number: 17,
      name: 'वृत्तलेख (फिचर रायटिंग)',
    },
    { id: 'mar-18', number: 18, name: 'वीरांना सलामी' },
    {
      id: 'mar-19',
      number: 19,
      name: 'आरशातली स्त्री (कविता)',
    },
    {
      id: 'mar-20',
      number: 20,
      name: 'रंग माझा वेगळा (कविता)',
    },
    { id: 'mar-21', number: 21, name: 'रंगरेषा व्यंगरेषा' },
  ],
  chaptersCount: 21,
},

{
  id: 'hindi',
  name: 'Hindi',
  code: '04',
  iconName: 'BookOpen',
  color: 'from-yellow-600 to-amber-700',
  description: 'Maharashtra HSC Class 12 Hindi',
  chapters: [
    { id: 'hin-1', number: 1, name: 'नवनिर्माण' },
    { id: 'hin-2', number: 2, name: 'निराला भाई' },
    { id: 'hin-3', number: 3, name: 'सच हम नहीं; सच तुम नहीं' },
    { id: 'hin-4', number: 4, name: 'आदर्श बदला' },
    {
      id: 'hin-5',
      number: 5,
      name: 'गुरुबानी / वृंद के दोहे',
    },
    { id: 'hin-6', number: 6, name: 'पाप के चार हथियार' },
    { id: 'hin-7', number: 7, name: 'पेड़ होने का अर्थ' },
    { id: 'hin-8', number: 8, name: 'सुनो किशोरी' },
    { id: 'hin-9', number: 9, name: 'चुनिंदा शेर' },
    {
      id: 'hin-10',
      number: 10,
      name: 'ओजोन विघटन का संकट',
    },
    { id: 'hin-11', number: 11, name: 'कोखजाया' },
    {
      id: 'hin-12',
      number: 12,
      name: 'लोकगीत – सुनु रे सखिया, कजरी',
    },
    {
      id: 'hin-13',
      number: 13,
      name: 'विशेष अध्ययन – कनुप्रिया',
    },
    {
      id: 'hin-14',
      number: 14,
      name: 'व्यावहारिक हिंदी – पल्लवन',
    },
    {
      id: 'hin-15',
      number: 15,
      name: 'व्यावहारिक हिंदी – फीचर लेखन',
    },
    {
      id: 'hin-16',
      number: 16,
      name: 'व्यावहारिक हिंदी – मैं उद्घोषक',
    },
    {
      id: 'hin-17',
      number: 17,
      name: 'व्यावहारिक हिंदी – ब्लॉग लेखन',
    },
    {
      id: 'hin-18',
      number: 18,
      name: 'व्यावहारिक हिंदी – प्रकाश उत्पन्न करने वाले जीव',
    },
    { id: 'hin-19', number: 19, name: 'मुहावरे' },
    { id: 'hin-20', number: 20, name: 'पारिभाषिक शब्दावली' },
    { id: 'hin-21', number: 21, name: 'अपठित बोध' },
    { id: 'hin-22', number: 22, name: 'व्याकरण' },
  ],
  chaptersCount: 22,
},
