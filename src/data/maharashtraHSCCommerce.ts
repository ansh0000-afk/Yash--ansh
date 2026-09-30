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
