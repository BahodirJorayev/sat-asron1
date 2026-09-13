import { IeltsMockTest, IeltsTestSubmission } from '../types';

export const INITIAL_IELTS_MOCK_TESTS: IeltsMockTest[] = [
  // 1. Official Cambridge Academic Mocks
  {
    id: 'ielts-acad-19-01',
    title: 'Cambridge IELTS 19 Academic — Practice Test 1',
    examType: 'ACADEMIC',
    category: 'FULL_MOCK',
    isPrivate: false,
    totalTimeMinutes: 170,
    listeningAudioUrl: 'https://cdn.asronsat.uz/audio/ielts-19-test1.mp3',
    readingPassagesCount: 3,
    writingTasksCount: 2,
    speakingPartsCount: 3,
    targetBand: 7.5,
    attemptsCount: 1840,
    averageBand: 6.5,
    description: 'Official 4-module authentic IELTS Academic test format replicating exact Cambridge English Assessment grading curves.',
    tags: ['Official Cambridge 19', 'Full Mock', 'Academic'],
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'ielts-acad-19-02',
    title: 'Cambridge IELTS 19 Academic — Practice Test 2',
    examType: 'ACADEMIC',
    category: 'FULL_MOCK',
    isPrivate: false,
    totalTimeMinutes: 170,
    listeningAudioUrl: 'https://cdn.asronsat.uz/audio/ielts-19-test2.mp3',
    readingPassagesCount: 3,
    writingTasksCount: 2,
    speakingPartsCount: 3,
    targetBand: 7.5,
    attemptsCount: 1320,
    averageBand: 6.5,
    description: 'Authentic exam papers featuring scientific and sociology reading passages, academic report graph, and opinion essay.',
    tags: ['Cambridge 19', 'Full Mock', 'Academic'],
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'ielts-acad-18-04',
    title: 'Cambridge IELTS 18 Academic — High-Scorer Form 4',
    examType: 'ACADEMIC',
    category: 'FULL_MOCK',
    isPrivate: false,
    totalTimeMinutes: 170,
    listeningAudioUrl: 'https://cdn.asronsat.uz/audio/ielts-18-test4.mp3',
    readingPassagesCount: 3,
    writingTasksCount: 2,
    speakingPartsCount: 3,
    targetBand: 8.0,
    attemptsCount: 2450,
    averageBand: 7.0,
    description: 'Calibrated for Band 7.5-8.5 targets. Features complex Section 3-4 conversational audio and multi-viewpoint argumentative writing.',
    tags: ['Cambridge 18', 'Hard Form', 'Band 8+'],
    createdAt: '2026-02-28T00:00:00Z',
  },

  // 2. 🔒 Maxsus Dars Testlari (Classroom Tests with Passcode Protection)
  {
    id: 'ielts-class-core-w3',
    title: '🔒 Maxsus Dars Testi: CORE-W3 Writing & Reading Masterclass',
    examType: 'ACADEMIC',
    category: 'CLASSROOM_TEST',
    isPrivate: true,
    accessCode: 'CORE-W3',
    totalTimeMinutes: 75,
    readingPassagesCount: 2,
    writingTasksCount: 1,
    targetBand: 7.5,
    attemptsCount: 240,
    averageBand: 7.0,
    description: 'ASRON o‘quv markazi guruhlari uchun 3-haftalik nazorat testi. Writing Task 2 intellektual tahlili va Reading Passage 3 tezkor yechimi.',
    teacherNote: 'Ustoz tomonidan berilgan kod: CORE-W3. Testni 75 daqiqa ichida yakunlang.',
    dueDate: '2026-09-20T23:59:59Z',
    tags: ['Classroom Test', 'CORE-W3', 'Writing & Reading', 'Ustoz Nazorati'],
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'ielts-class-camp-01',
    title: '🔒 Maxsus Dars Testi: CAMP-INTENSIVE-01 To‘liq Imtihon',
    examType: 'ACADEMIC',
    category: 'CLASSROOM_TEST',
    isPrivate: true,
    accessCode: 'CAMP-2026',
    totalTimeMinutes: 170,
    listeningAudioUrl: 'https://cdn.asronsat.uz/audio/camp-test-01.mp3',
    readingPassagesCount: 3,
    writingTasksCount: 2,
    speakingPartsCount: 3,
    targetBand: 8.0,
    attemptsCount: 180,
    averageBand: 7.5,
    description: 'Intensiv guruh talabalari uchun rasmiy sharoitdagi to‘liq imtihon simulyatsiyasi. Barcha 4 bo‘lim bir vaqtda tekshiriladi.',
    teacherNote: 'Parol: CAMP-2026. Faqat rasmiy guruh o‘quvchilari uchun.',
    dueDate: '2026-09-25T20:00:00Z',
    tags: ['Intensive Camp', 'Passcode Protected', 'Full Simulation'],
    createdAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'ielts-class-listen-speed',
    title: '🔒 Maxsus Dars Testi: SPEED-W4 Listening 1.25x Accent Sprint',
    examType: 'ACADEMIC',
    category: 'CLASSROOM_TEST',
    isPrivate: true,
    accessCode: 'SPEED-W4',
    totalTimeMinutes: 35,
    listeningAudioUrl: 'https://cdn.asronsat.uz/audio/listening-accent-sprint.mp3',
    targetBand: 7.5,
    attemptsCount: 310,
    averageBand: 7.0,
    description: 'Avstraliya, Yangi Zelandiya va Britaniya murakkab talaffuzlari bilan Listening Section 3-4 tezlashtirilgan sprint mashg‘uloti.',
    teacherNote: 'Parol: SPEED-W4. Eshitish vositasidan (headphones) foydalaning.',
    dueDate: '2026-09-30T18:00:00Z',
    tags: ['Listening Sprint', 'Accent Drill', 'Passcode Gate'],
    createdAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'ielts-class-speak-b8',
    title: '🔒 Maxsus Dars Testi: SPEAK-B8 Socratic Fluency Diagnostic',
    examType: 'ACADEMIC',
    category: 'CLASSROOM_TEST',
    isPrivate: true,
    accessCode: 'SPEAK-B8',
    totalTimeMinutes: 15,
    speakingPartsCount: 3,
    targetBand: 8.5,
    attemptsCount: 150,
    averageBand: 7.5,
    description: 'AI Socratic repetitor bilan Part 1, 2 va 3 jonli og‘zaki imtihon. Leksik boylik va turg‘un iboralar (collocations) tekshiriladi.',
    teacherNote: 'Parol: SPEAK-B8. Mikrofoningiz sozligini oldindan tekshiring.',
    dueDate: '2026-10-05T21:00:00Z',
    tags: ['Speaking Diagnostic', 'Band 8.5', 'AI Evaluator'],
    createdAt: '2026-03-12T00:00:00Z',
  },

  // 3. Sectional Skill Drills
  {
    id: 'ielts-sec-reading-sprint',
    title: 'IELTS Reading Sprint: True/False/Not Given Mastery (40 daqiqa)',
    examType: 'ACADEMIC',
    category: 'SECTIONAL_PRACTICE',
    isPrivate: false,
    totalTimeMinutes: 40,
    readingPassagesCount: 2,
    targetBand: 7.0,
    attemptsCount: 3820,
    averageBand: 6.5,
    description: 'Eng ko‘p xato qilinadigan T/F/NG va Headings savollariga qaratilgan 2 ta ilmiy matn yechish sprinti.',
    tags: ['Reading Only', 'T/F/NG Focus', '40 Min'],
    createdAt: '2026-03-15T00:00:00Z',
  },
];

export const INITIAL_IELTS_SUBMISSIONS: IeltsTestSubmission[] = [
  {
    id: 'sub-001',
    testId: 'ielts-class-core-w3',
    testTitle: 'Maxsus Dars Testi: CORE-W3 Writing & Reading Masterclass',
    userId: 'usr-bahodir',
    studentName: 'Bahodir Jo‘rayev',
    username: 'bahodir',
    listeningBand: 8.0,
    readingBand: 8.0,
    writingBand: 7.5,
    speakingBand: 8.0,
    overallBand: 8.0,
    timeSpentMinutes: 71,
    submittedAt: '2026-09-12T15:30:00Z',
    status: 'EVALUATED',
  },
  {
    id: 'sub-002',
    testId: 'ielts-class-core-w3',
    testTitle: 'Maxsus Dars Testi: CORE-W3 Writing & Reading Masterclass',
    userId: 'usr-madina',
    studentName: 'Madina Rustamova',
    username: 'madina_r',
    listeningBand: 7.5,
    readingBand: 7.5,
    writingBand: 7.0,
    speakingBand: 7.5,
    overallBand: 7.5,
    timeSpentMinutes: 74,
    submittedAt: '2026-09-12T16:10:00Z',
    status: 'EVALUATED',
  },
  {
    id: 'sub-003',
    testId: 'ielts-class-camp-01',
    testTitle: 'Maxsus Dars Testi: CAMP-INTENSIVE-01 To‘liq Imtihon',
    userId: 'usr-jasur',
    studentName: 'Jasur Bekmurodov',
    username: 'jasurbek',
    listeningBand: 7.0,
    readingBand: 7.5,
    writingBand: 6.5,
    speakingBand: 7.0,
    overallBand: 7.0,
    timeSpentMinutes: 165,
    submittedAt: '2026-09-11T18:45:00Z',
    status: 'EVALUATED',
  },
  {
    id: 'sub-004',
    testId: 'ielts-class-listen-speed',
    testTitle: 'Maxsus Dars Testi: SPEED-W4 Listening 1.25x Accent Sprint',
    userId: 'usr-kamola',
    studentName: 'Kamola Alimova',
    username: 'kamola_sat',
    listeningBand: 8.5,
    readingBand: 8.0,
    overallBand: 8.5,
    timeSpentMinutes: 34,
    submittedAt: '2026-09-13T10:20:00Z',
    status: 'EVALUATED',
  },
  {
    id: 'sub-005',
    testId: 'ielts-class-core-w3',
    testTitle: 'Maxsus Dars Testi: CORE-W3 Writing & Reading Masterclass',
    userId: 'usr-diyor',
    studentName: 'Diyorbek Karimov',
    username: 'diyorbek',
    listeningBand: 6.5,
    readingBand: 7.0,
    writingBand: 6.5,
    speakingBand: 6.5,
    overallBand: 6.5,
    timeSpentMinutes: 75,
    submittedAt: '2026-09-13T11:05:00Z',
    status: 'EVALUATED',
  },
];

/**
 * Standard IELTS Overall Band Score Rounding Formula:
 * The average of the four components is rounded to the nearest half or whole band score:
 * - If average ends in .25, it is rounded up to .50
 * - If average ends in .75, it is rounded up to the next whole band
 */
export function calculateIeltsOverallBand(
  listening: number,
  reading: number,
  writing: number = 7.0,
  speaking: number = 7.0
): number {
  const avg = (listening + reading + writing + speaking) / 4;
  const decimal = avg - Math.floor(avg);

  if (decimal < 0.25) {
    return Math.floor(avg);
  } else if (decimal < 0.75) {
    return Math.floor(avg) + 0.5;
  } else {
    return Math.ceil(avg);
  }
}

/**
 * Converts raw Listening score (0-40) to IELTS Band Score (1.0 - 9.0)
 */
export function rawToIeltsBandListening(raw: number): number {
  if (raw >= 39) return 9.0;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8.0;
  if (raw >= 32) return 7.5;
  if (raw >= 30) return 7.0;
  if (raw >= 26) return 6.5;
  if (raw >= 23) return 6.0;
  if (raw >= 18) return 5.5;
  if (raw >= 16) return 5.0;
  if (raw >= 13) return 4.5;
  if (raw >= 10) return 4.0;
  return 3.5;
}

/**
 * Converts raw Academic Reading score (0-40) to IELTS Band Score (1.0 - 9.0)
 */
export function rawToIeltsBandReading(raw: number, isAcademic = true): number {
  if (isAcademic) {
    if (raw >= 39) return 9.0;
    if (raw >= 37) return 8.5;
    if (raw >= 35) return 8.0;
    if (raw >= 33) return 7.5;
    if (raw >= 30) return 7.0;
    if (raw >= 27) return 6.5;
    if (raw >= 23) return 6.0;
    if (raw >= 19) return 5.5;
    if (raw >= 15) return 5.0;
    if (raw >= 13) return 4.5;
    if (raw >= 10) return 4.0;
    return 3.5;
  }
  // General Training
  if (raw >= 40) return 9.0;
  if (raw >= 39) return 8.5;
  if (raw >= 37) return 8.0;
  if (raw >= 36) return 7.5;
  if (raw >= 34) return 7.0;
  if (raw >= 32) return 6.5;
  if (raw >= 30) return 6.0;
  if (raw >= 27) return 5.5;
  if (raw >= 23) return 5.0;
  return 4.0;
}
