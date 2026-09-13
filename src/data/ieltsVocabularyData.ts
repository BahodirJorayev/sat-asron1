export type IeltsVocabTopic =
  | 'Environment'
  | 'Technology'
  | 'Education'
  | 'Health'
  | 'Crime & Law'
  | 'Globalisation'
  | 'Arts & Culture';

export interface IeltsWord {
  id: string;
  topic: IeltsVocabTopic;
  word: string;
  bandLevel: 'Band 7.0' | 'Band 7.5' | 'Band 8.0' | 'Band 8.5+';
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb';
  definitionUz: string;
  definitionEn: string;
  collocations: string[];
  synonyms: string[];
  academicExample: string;
}

export const IELTS_VOCAB_TOPICS: IeltsVocabTopic[] = [
  'Environment',
  'Technology',
  'Education',
  'Health',
  'Crime & Law',
  'Globalisation',
  'Arts & Culture',
];

export const INITIAL_IELTS_VOCABULARY: IeltsWord[] = [
  // =========================================================================
  // 1. ENVIRONMENT (Atrof-muhit & Ekologiya)
  // =========================================================================
  {
    id: 'env-01',
    topic: 'Environment',
    word: 'biodiversity',
    bandLevel: 'Band 7.5',
    partOfSpeech: 'noun',
    definitionUz: 'Biologik xilma-xillik; ma’lum hududdagi o‘simlik va hayvonot turlarining boyligi.',
    definitionEn: 'The variety of plant and animal life in a particular habitat or ecosystem.',
    collocations: ['preserve biodiversity', 'loss of biodiversity', 'marine biodiversity'],
    synonyms: ['ecological diversity', 'biological variety', 'flora and fauna variety'],
    academicExample: 'Deforestation in the Amazon basin poses an existential threat to global biodiversity.',
  },
  {
    id: 'env-02',
    topic: 'Environment',
    word: 'deteriorate',
    bandLevel: 'Band 7.5',
    partOfSpeech: 'verb',
    definitionUz: 'Yomonlashmoq, tanazzulga yuz tutmoq, sifati tushmoq.',
    definitionEn: 'To become progressively worse in quality, condition, or value.',
    collocations: ['rapidly deteriorate', 'deteriorating environmental conditions', 'cause to deteriorate'],
    synonyms: ['degrade', 'degenerate', 'worsen', 'decay'],
    academicExample: 'Air quality in industrialized metropolitan zones continues to deteriorate at an alarming rate.',
  },
  {
    id: 'env-03',
    topic: 'Environment',
    word: 'irreversible',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'adjective',
    definitionUz: 'Qaytarib bo‘lmaydigan, o‘zgarmas holga keltirilgan.',
    definitionEn: 'Impossible to reverse, rectify, or return to an original state.',
    collocations: ['irreversible damage', 'irreversible ecological shift', 'irreversible consequence'],
    synonyms: ['irrevocable', 'permanent', 'unalterable', 'irreparable'],
    academicExample: 'Without urgent mitigation, global warming will trigger irreversible damage to polar ice caps.',
  },
  {
    id: 'env-04',
    topic: 'Environment',
    word: 'deplete',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'verb',
    definitionUz: 'Tugatmoq, kamaytirmoq, resurslarni quritmoq.',
    definitionEn: 'To diminish or exhaust the supply or abundance of a resource.',
    collocations: ['deplete natural reserves', 'severely depleted groundwater', 'deplete ozone layer'],
    synonyms: ['exhaust', 'drain', 'consume', 'impoverish'],
    academicExample: 'Overfishing in international waters has depleted critical cod stocks by more than eighty percent.',
  },

  // =========================================================================
  // 2. TECHNOLOGY (Texnologiya & AI)
  // =========================================================================
  {
    id: 'tech-01',
    topic: 'Technology',
    word: 'autonomous',
    bandLevel: 'Band 7.5',
    partOfSpeech: 'adjective',
    definitionUz: 'Mustaqil ishlaydigan, avtonom, inson aralashuvisiz qaror qabul qiluvchi.',
    definitionEn: 'Operating or functioning independently without external human control.',
    collocations: ['autonomous vehicles', 'fully autonomous algorithm', 'autonomous decision-making'],
    synonyms: ['self-governing', 'independent', 'automated', 'self-regulating'],
    academicExample: 'The deployment of autonomous navigation systems will radically revolutionize freight logistics.',
  },
  {
    id: 'tech-02',
    topic: 'Technology',
    word: 'ubiquitous',
    bandLevel: 'Band 8.5+',
    partOfSpeech: 'adjective',
    definitionUz: 'Hamma joyda uchraydigan, universal tarqalgan.',
    definitionEn: 'Present, appearing, or found everywhere simultaneously.',
    collocations: ['ubiquitous presence', 'become ubiquitous', 'ubiquitous smartphone adoption'],
    synonyms: ['omnipresent', 'pervasive', 'universal', 'widespread'],
    academicExample: 'Mobile broadband has become so ubiquitous that digital literacy is now deemed a fundamental right.',
  },
  {
    id: 'tech-03',
    topic: 'Technology',
    word: 'obsolete',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'adjective',
    definitionUz: 'Eskirgan, iste’moldan chiqqan, zamonaviy bo‘lmagan.',
    definitionEn: 'No longer produced or used; out of date.',
    collocations: ['render obsolete', 'virtually obsolete', 'technologically obsolete equipment'],
    synonyms: ['outdated', 'antiquated', 'archaic', 'superseded'],
    academicExample: 'The rapid advent of quantum computing threatens to render conventional cryptographic standards obsolete.',
  },
  {
    id: 'tech-04',
    topic: 'Technology',
    word: 'surveillance',
    bandLevel: 'Band 7.5',
    partOfSpeech: 'noun',
    definitionUz: 'Kuzatuv, nazorat, monitoring.',
    definitionEn: 'Close observation, especially of a suspected person or public place.',
    collocations: ['mass surveillance', 'surveillance cameras', 'digital surveillance apparatus'],
    synonyms: ['monitoring', 'scrutiny', 'observation', 'supervision'],
    academicExample: 'Civil liberties advocates argue that facial-recognition surveillance infringes upon constitutional privacy rights.',
  },

  // =========================================================================
  // 3. EDUCATION (Ta’lim & Akademik Tizimlar)
  // =========================================================================
  {
    id: 'edu-01',
    topic: 'Education',
    word: 'pedagogy',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'noun',
    definitionUz: 'Pedagogika; o‘qitish usuli, ta’lim nazariyasi va amaliyoti.',
    definitionEn: 'The method and practice of teaching, especially as an academic subject or theoretical concept.',
    collocations: ['innovative pedagogy', 'progressive pedagogy', 'traditional pedagogical framework'],
    synonyms: ['teaching methodology', 'instructional strategy', 'educational approach'],
    academicExample: 'Modern university pedagogy emphasizes collaborative critical inquiry over rote memorization.',
  },
  {
    id: 'edu-02',
    topic: 'Education',
    word: 'curriculum',
    bandLevel: 'Band 7.0',
    partOfSpeech: 'noun',
    definitionUz: 'O‘quv dasturi; maktab yoki universitet fanlar rejasi.',
    definitionEn: 'The subjects comprising a course of study in a school or college.',
    collocations: ['core curriculum', 'extracurricular curriculum', 'reform the national curriculum'],
    synonyms: ['syllabus', 'program of study', 'academic courses'],
    academicExample: 'Integrating financial literacy into the secondary school curriculum fosters lifelong economic resilience.',
  },
  {
    id: 'edu-03',
    topic: 'Education',
    word: 'holistic',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'adjective',
    definitionUz: 'Har tomonlama, yaxlit, barcha qismlarni hisobga oluvchi.',
    definitionEn: 'Characterized by the treatment of the whole system rather than just its individual parts.',
    collocations: ['holistic approach', 'holistic student evaluation', 'holistic development'],
    synonyms: ['comprehensive', 'all-inclusive', 'integrated', 'panoramic'],
    academicExample: 'Holistic admissions criteria evaluate personal leadership and resilience alongside standardized test scores.',
  },
  {
    id: 'edu-04',
    topic: 'Education',
    word: 'egalitarian',
    bandLevel: 'Band 8.5+',
    partOfSpeech: 'adjective',
    definitionUz: 'Barcha uchun teng huquqli, tenglik tarafdori bo‘lgan.',
    definitionEn: 'Believing in or based on the principle that all people are equal and deserve equal rights and opportunities.',
    collocations: ['egalitarian educational system', 'egalitarian philosophy', 'promote egalitarian ideals'],
    synonyms: ['democratic', 'equitable', 'fair-minded', 'classless'],
    academicExample: 'Nordic countries are widely recognized for their egalitarian public education models that minimize social disparity.',
  },

  // =========================================================================
  // 4. HEALTH (Sog‘liqni Saqlash & Tibbiyot)
  // =========================================================================
  {
    id: 'health-01',
    topic: 'Health',
    word: 'sedentary',
    bandLevel: 'Band 7.5',
    partOfSpeech: 'adjective',
    definitionUz: 'Kamharakat, o‘tirib ishlaydigan, passiv turmush tarzi.',
    definitionEn: 'Involving much sitting and little physical activity.',
    collocations: ['sedentary lifestyle', 'sedentary occupations', 'combat sedentary habits'],
    synonyms: ['inactive', 'desk-bound', 'motionless', 'dormant'],
    academicExample: 'The proliferation of remote computer work has contributed significantly to a predominantly sedentary lifestyle.',
  },
  {
    id: 'health-02',
    topic: 'Health',
    word: 'detrimental',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'adjective',
    definitionUz: 'Zararli, ziyon keltiruvchi, salbiy ta’sir etuvchi.',
    definitionEn: 'Tending to cause harm, damage, or injury.',
    collocations: ['detrimental effect', 'highly detrimental to health', 'detrimental consequences'],
    synonyms: ['injurious', 'deleterious', 'harmful', 'pernicious'],
    academicExample: 'Chronic sleep deprivation exercises a deeply detrimental impact on cardiovascular longevity.',
  },
  {
    id: 'health-03',
    topic: 'Health',
    word: 'epidemic',
    bandLevel: 'Band 7.0',
    partOfSpeech: 'noun',
    definitionUz: 'Epidemiya; kasallikning keng va tez tarqalishi.',
    definitionEn: 'A widespread occurrence of an infectious disease in a community at a particular time.',
    collocations: ['global epidemic', 'obesity epidemic', 'curb an epidemic outbreak'],
    synonyms: ['outbreak', 'pandemic', 'plague', 'surge'],
    academicExample: 'Public health authorities classify childhood diabetes as an escalating global epidemic.',
  },

  // =========================================================================
  // 5. CRIME & LAW (Jinoyat & Qonunchilik)
  // =========================================================================
  {
    id: 'crime-01',
    topic: 'Crime & Law',
    word: 'deterrent',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'noun',
    definitionUz: 'Oldini oluvchi omil, qo‘rqituvchi/tiyib turuvchi jazo vositasi.',
    definitionEn: 'A thing that discourages or is intended to discourage someone from doing something.',
    collocations: ['effective deterrent', 'act as a deterrent', 'harsh punitive deterrent'],
    synonyms: ['disincentive', 'restraint', 'curb', 'discouragement'],
    academicExample: 'Criminologists argue that the certainty of apprehension functions as a stronger deterrent than draconian sentencing.',
  },
  {
    id: 'crime-02',
    topic: 'Crime & Law',
    word: 'rehabilitate',
    bandLevel: 'Band 7.5',
    partOfSpeech: 'verb',
    definitionUz: 'Reabilitatsiya qilmoq; axloqan tuzatib jamiyatga qaytarmoq.',
    definitionEn: 'To restore to health or normal life by training and therapy after imprisonment, addiction, or illness.',
    collocations: ['rehabilitate offenders', 'vocational rehabilitation', 'successfully rehabilitated'],
    synonyms: ['reform', 'reintegrate', 'reclaim', 'restore'],
    academicExample: 'Modern penal philosophy prioritizes programs designed to rehabilitate convicts rather than simply punish them.',
  },
  {
    id: 'crime-03',
    topic: 'Crime & Law',
    word: 'culpability',
    bandLevel: 'Band 8.5+',
    partOfSpeech: 'noun',
    definitionUz: 'Aybdorlik darajasi, javobgarlik mas’uliyati.',
    definitionEn: 'Responsibility for a fault or wrong; blameworthiness.',
    collocations: ['establish legal culpability', 'diminished culpability', 'corporate culpability'],
    synonyms: ['guilt', 'blameworthiness', 'liability', 'accountability'],
    academicExample: 'The judicial tribunal was tasked with determining the extent of corporate culpability in the toxic river runoff.',
  },

  // =========================================================================
  // 6. GLOBALISATION (Globallashuv & Xalqaro Iqtisodiyot)
  // =========================================================================
  {
    id: 'glob-01',
    topic: 'Globalisation',
    word: 'homogenize',
    bandLevel: 'Band 8.5+',
    partOfSpeech: 'verb',
    definitionUz: 'Birxillashtirmoq; madaniy xilma-xillikni bir andozaga keltirmoq.',
    definitionEn: 'To make uniform or similar across diverse societies or elements.',
    collocations: ['homogenize global cultures', 'cultural homogenization', 'homogenized consumer market'],
    synonyms: ['standardize', 'uniformize', 'assimilate', 'equalize'],
    academicExample: 'Critics contend that global consumer capitalism risks homogenizing distinct indigenous culinary traditions.',
  },
  {
    id: 'glob-02',
    topic: 'Globalisation',
    word: 'interdependence',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'noun',
    definitionUz: 'O‘zaro bog‘liqlik; davlatlarning bir-biriga iqtisodiy qaramligi.',
    definitionEn: 'The dependence of two or more people, groups, or countries on each other.',
    collocations: ['economic interdependence', 'global interdependence', 'deepen mutual interdependence'],
    synonyms: ['mutual dependence', 'interconnectedness', 'reciprocal reliance'],
    academicExample: 'Supply chain shocks during the pandemic underscored the intricate interdependence of modern trade networks.',
  },

  // =========================================================================
  // 7. ARTS & CULTURE (San’at & Madaniyat)
  // =========================================================================
  {
    id: 'art-01',
    topic: 'Arts & Culture',
    word: 'heritage',
    bandLevel: 'Band 7.0',
    partOfSpeech: 'noun',
    definitionUz: 'Meros; ajdodlardan qolgan madaniy va tarixiy boylik.',
    definitionEn: 'Property, cultural traditions, and historical assets passed down from past generations.',
    collocations: ['cultural heritage', 'preserve historical heritage', 'UNESCO World Heritage'],
    synonyms: ['legacy', 'patrimony', 'tradition', 'inheritance'],
    academicExample: 'The restoration of ancient minarets in Samarkand is pivotal for safeguarding regional architectural heritage.',
  },
  {
    id: 'art-02',
    topic: 'Arts & Culture',
    word: 'aesthetic',
    bandLevel: 'Band 8.0',
    partOfSpeech: 'adjective',
    definitionUz: 'Estetik; go‘zallik va san’atga oid, didli.',
    definitionEn: 'Concerned with beauty or the appreciation of beauty and visual harmony.',
    collocations: ['aesthetic appeal', 'aesthetic values', 'contemporary aesthetic standards'],
    synonyms: ['artistic', 'tasteful', 'visual', 'stylistic'],
    academicExample: 'Modernist architecture harmoniously reconciles functional utility with austere aesthetic minimalism.',
  },
  {
    id: 'art-03',
    topic: 'Arts & Culture',
    word: 'ephemeral',
    bandLevel: 'Band 8.5+',
    partOfSpeech: 'adjective',
    definitionUz: 'O‘tkinchi, qisqa umrli, tez yo‘qoladigan.',
    definitionEn: 'Lasting for a very short time; fleeting.',
    collocations: ['ephemeral nature', 'ephemeral digital trends', 'ephemeral art installations'],
    synonyms: ['transitory', 'fleeting', 'momentary', 'evanescent'],
    academicExample: 'Street art installations celebrate the ephemeral nature of urban creativity, often vanishing within weeks.',
  },
];
