export type IeltsModuleType = 'Listening' | 'Reading' | 'Writing' | 'Speaking';

export interface IeltsSubQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options?: string[]; // For Multiple Choice, Matching Headings
  correctAnswer: string;
  explanation: string;
  userTip?: string;
}

export interface IeltsPracticeItem {
  id: string;
  module: IeltsModuleType;
  questionType: string;
  title: string;
  passageOrPrompt: string;
  audioUrl?: string; // For listening
  audioDurationSeconds?: number;
  imageUrl?: string; // For Task 1 graphs, maps, diagrams
  questions: IeltsSubQuestion[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetBand: number; // e.g. 7.5, 8.0
  academicContext: string; // e.g. "Biology & Ecology", "Sociology", "Urban Planning"
}

export const IELTS_QUESTION_TYPES: Record<IeltsModuleType, string[]> = {
  Reading: [
    'True/False/Not Given',
    'Matching Headings',
    'Summary Completion',
    'Multiple Choice',
    'Matching Information',
  ],
  Listening: [
    'Form/Note Completion',
    'Multiple Choice',
    'Map/Diagram Labelling',
    'Matching',
  ],
  Writing: [
    'Task 1 (Graphs/Charts/Maps)',
    'Task 2 (Opinion/Discussion/Problem-Solution)',
  ],
  Speaking: [
    'Part 1 (Introduction)',
    'Part 2 (Cue Card)',
    'Part 3 (Two-way Discussion)',
  ],
};

export const INITIAL_IELTS_PRACTICE_ITEMS: IeltsPracticeItem[] = [
  // =========================================================================
  // 1. READING PRACTICE
  // =========================================================================
  {
    id: 'read-tfng-01',
    module: 'Reading',
    questionType: 'True/False/Not Given',
    title: 'The Resilience of Urban Mangrove Ecosystems',
    academicContext: 'Marine Biology & Ecology',
    difficulty: 'Hard',
    targetBand: 8.0,
    passageOrPrompt: `
Mangrove forests occupy the intertidal zones of tropical and subtropical coastlines, acting as critical carbon sinks and biophysical buffers against extreme maritime weather. In recent decades, rapid anthropogenic coastal development in Southeast Asia led to a catastrophic decline in mangrove cover, exceeding 35% between 1980 and 2000. 

However, recent longitudinal satellite monitoring reveals an unexpected phenomenon: urbanised mangrove clusters in Singapore and Hong Kong demonstrate robust adaptation to elevated nitrogen runoffs. While excessive nutrient loads in freshwater wetlands typically induce severe eutrophication and subsequent hypoxia, estuarine mangroves leverage tidal flushing cycles to metabolize excess nitrogen into accelerated canopy expansion. 

Nevertheless, marine botanists caution against over-optimism. Soil salinization exacerbated by artificial dredging continues to impair the ultrafiltration mechanisms in mangrove root membranes, specifically Rhizophora species, rendering them vulnerable to sudden hypersaline shocks.
`,
    questions: [
      {
        id: 'q-tfng-1',
        questionNumber: 1,
        questionText: 'Mangrove coverage in Southeast Asia experienced a drop of more than thirty-five percent during the final two decades of the twentieth century.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        explanation: 'Matnda 1980 va 2000-yillar oralig‘ida (yigirmanchi asrning so‘nggi yigirma yili) qisqarish 35% dan oshgani ("exceeding 35% between 1980 and 2000") to‘g‘ridan-to‘g‘ri tasdiqlangan.',
        userTip: '"Between 1980 and 2000" iborasi "the final two decades of the twentieth century" ga aniq parafraza qilingan.',
      },
      {
        id: 'q-tfng-2',
        questionNumber: 2,
        questionText: 'Urban mangroves in Singapore absorb less nitrogen than naturally occurring rural mangroves.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        explanation: 'Matnda Singapurdagi shahar mangrovalari yuqori azotli oqimlarga moslashgani aytilgan, lekin ularning qishloq mangrovalari bilan solishtirganda qancha azot yutishi haqida taqqoslash mavjud emas.',
        userTip: 'Agar qiyosiy fakt (less than, greater than) matnda to‘g‘ridan-to‘g‘ri berilmagan bo‘lsa, bu deyarli doimo NOT GIVEN bo‘ladi.',
      },
      {
        id: 'q-tfng-3',
        questionNumber: 3,
        questionText: 'Tidal flushing prevents hypersaline damage to the root membranes of Rhizophora species.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Matnda sun’iy chuqurlashtirish oqibatidagi sho‘rlanish Rhizophora turlarining ildiz filtratsiya mexanizmlariga zarar yetkazishi va ularni zaiflashtirishi ("continues to impair... rendering them vulnerable") aytilgan. Tidal flushing esa azotni o‘zlashtirishga yordam beradi, ildiz membranasini sho‘rdan himoya qilmaydi.',
        userTip: 'FALSE javob matndagi ma’lumotga to‘g‘ridan-to‘g‘ri zid bo‘lgan holatda tanlanadi.',
      },
    ],
  },
  {
    id: 'read-head-01',
    module: 'Reading',
    questionType: 'Matching Headings',
    title: 'The Neuroscience of Bilingual Cognitive Control',
    academicContext: 'Cognitive Neurobiology',
    difficulty: 'Hard',
    targetBand: 8.5,
    passageOrPrompt: `
[Paragraph A] For much of the twentieth century, pedagogical orthodoxy regarded childhood bilingualism as a cognitive liability, hypothesizing that managing two lexicons simultaneously would induce developmental delays and intellectual fatigue. Modern functional neuroimaging has dismantled this misconception, revealing that continuous linguistic mediation actively reconfigures the dorsal anterior cingulate cortex.

[Paragraph B] When a multilingual speaker speaks, both languages remain simultaneously primed in the subconscious mind. The neural mechanism responsible for suppressing intrusive semantic candidates from the non-target language is known as executive inhibitory control. Over time, this constant cognitive wrestling acts as rigorous neuroplastic conditioning.

[Paragraph C] Epidemiological surveys conducted across geriatric clinics in Toronto and Edinburgh present striking clinical findings: bilingual individuals diagnosed with neurodegenerative disorders, such as Alzheimer's disease, manifest initial symptomatic onset four to five years later than their monolingual peers, despite displaying equivalent physiological brain pathology.
`,
    questions: [
      {
        id: 'q-head-1',
        questionNumber: 1,
        questionText: 'Qaysi sarlavha [Paragraph A] ning asosiy g‘oyasini eng aniq ifodalaydi?',
        options: [
          'i. Debunking the historic fallacy of bilingual disadvantage',
          'ii. Clinical delays in geriatric neurodegeneration',
          'iii. The mechanics of involuntary language suppression',
          'iv. Early childhood vocabulary benchmarks',
        ],
        correctAnswer: 'i. Debunking the historic fallacy of bilingual disadvantage',
        explanation: 'Paragraph A 20-asrda ikki tillilik aqliy zaiflik deb hisoblangani va zamonaviy neyrovizuallashtirish bu noto‘g‘ri qarashni rad etgani ("dismantled this misconception") haqida.',
      },
      {
        id: 'q-head-2',
        questionNumber: 2,
        questionText: 'Qaysi sarlavha [Paragraph B] ning asosiy g‘oyasini eng aniq ifodalaydi?',
        options: [
          'i. Debunking the historic fallacy of bilingual disadvantage',
          'ii. The mechanics of involuntary language suppression',
          'iii. Socio-economic benefits of multilingual proficiency',
          'iv. Clinical delays in geriatric neurodegeneration',
        ],
        correctAnswer: 'ii. The mechanics of involuntary language suppression',
        explanation: 'Paragraph B da ikkinchi tilni miyada bostirib turuvchi mexanizm ("executive inhibitory control") va neyroplastik chiniqish qanday ishlashi tushuntirilgan.',
      },
      {
        id: 'q-head-3',
        questionNumber: 3,
        questionText: 'Qaysi sarlavha [Paragraph C] ning asosiy g‘oyasini eng aniq ifodalaydi?',
        options: [
          'i. Pedagogical trends in Canadian language academies',
          'ii. Debunking the historic fallacy of bilingual disadvantage',
          'iii. The mechanics of involuntary language suppression',
          'iv. Clinical delays in geriatric neurodegeneration',
        ],
        correctAnswer: 'iv. Clinical delays in geriatric neurodegeneration',
        explanation: 'Paragraph C da Altsgeymer va keksayish davridagi nevrologik kasalliklar alomatlari ikki tillilarda 4-5 yil kechroq boshlanishi faktlar bilan keltirilgan.',
      },
    ],
  },
  {
    id: 'read-summ-01',
    module: 'Reading',
    questionType: 'Summary Completion',
    title: 'Aerogels: The Solid Super-Insulators of Tomorrow',
    academicContext: 'Materials Science & Nanotechnology',
    difficulty: 'Medium',
    targetBand: 7.5,
    passageOrPrompt: `
Aerogels are synthetic porous materials derived from a gel, in which the liquid component has been replaced with gas through supercritical drying. Often referred to as "frozen smoke" due to their translucent appearance, silica-based aerogels consist of approximately 99.8% air by volume, making them the lowest-density solid materials recognized by science. 

The extraordinary thermal insulation efficiency of aerogels is attributable to the Knudsen effect. Because the internal nanopores measure between 20 and 40 nanometers, which is smaller than the mean free path of ambient air molecules, gaseous collisions within the lattice cannot effectively transfer kinetic energy. Consequently, heat conduction is almost entirely arrested.
`,
    questions: [
      {
        id: 'q-summ-1',
        questionNumber: 1,
        questionText: 'Silica aerogels earn the moniker "frozen smoke" primarily because of their ________ appearance.',
        options: ['translucent', 'molecular', 'solid', 'synthetic'],
        correctAnswer: 'translucent',
        explanation: 'Matnda: "Often referred to as \'frozen smoke\' due to their translucent appearance..." deb yozilgan.',
      },
      {
        id: 'q-summ-2',
        questionNumber: 2,
        questionText: 'The phenomenal insulating property of aerogels is scientifically credited to the ________ effect.',
        options: ['Knudsen', 'kinetic', 'supercritical', 'atmospheric'],
        correctAnswer: 'Knudsen',
        explanation: 'Matnda: "The extraordinary thermal insulation efficiency of aerogels is attributable to the Knudsen effect." ko‘rsatilgan.',
      },
    ],
  },

  // =========================================================================
  // 2. LISTENING PRACTICE
  // =========================================================================
  {
    id: 'listen-form-01',
    module: 'Listening',
    questionType: 'Form/Note Completion',
    title: 'Section 1: International Student Housing Application',
    academicContext: 'University Administrative Services',
    difficulty: 'Medium',
    targetBand: 7.0,
    audioDurationSeconds: 120,
    passageOrPrompt: `
[Audio Transcript Simulator]
Officer: Good morning, Central University Accommodation Office. How may I assist you today?
Student: Hello, I'm an incoming postgraduate student from Tashkent, and I need to finalize my housing booking for the autumn semester.
Officer: Certainly! Let's get your details on file. May I have your full name, please?
Student: Yes, it is Alisher Navoiy — spelled A-L-I-S-H-E-R, surname N-A-V-O-I-Y.
Officer: Thank you. And your student identification reference code?
Student: It's UK-9428-B.
Officer: Excellent. Now, regarding room preference, we have self-catered studio apartments and catered dormitory en-suites.
Student: I strictly prefer self-catered, with access to a quiet study area.
Officer: Understood. The monthly rental tariff for the self-catered studio is 680 pounds, which includes high-speed fiber broadband and utility charges.
`,
    questions: [
      {
        id: 'q-lis-1',
        questionNumber: 1,
        questionText: 'Student ID Reference Code: UK-____-B',
        options: ['9428', '9248', '9482', '9842'],
        correctAnswer: '9428',
        explanation: 'Audioda talaba: "It\'s UK-9428-B" deb aniq talaffuz qiladi.',
        userTip: 'Raqamlar talaffuzida "teen" va "ty" hamda 8 va 9 kombinatsiyalariga hushyor bo‘ling.',
      },
      {
        id: 'q-lis-2',
        questionNumber: 2,
        questionText: 'Chosen Accommodation Type: ________ studio apartment',
        options: ['self-catered', 'catered', 'shared dorm', 'private hall'],
        correctAnswer: 'self-catered',
        explanation: 'Talaba: "I strictly prefer self-catered" deb javob beradi.',
      },
      {
        id: 'q-lis-3',
        questionNumber: 3,
        questionText: 'Monthly rental fee: £________ (utilities included)',
        options: ['680', '650', '780', '860'],
        correctAnswer: '680',
        explanation: 'Officer: "The monthly rental tariff for the self-catered studio is 680 pounds".',
      },
    ],
  },
  {
    id: 'listen-mc-01',
    module: 'Listening',
    questionType: 'Multiple Choice',
    title: 'Section 3: Environmental Engineering Dissertation Review',
    academicContext: 'Academic Tutorial & Research Discussion',
    difficulty: 'Hard',
    targetBand: 8.0,
    audioDurationSeconds: 150,
    passageOrPrompt: `
[Audio Transcript Simulator]
Dr. Henderson: Welcome, Elena. I reviewed the draft of your thesis on solar desalination arrays in arid agricultural regions. Your literature review is thorough, but I noticed a discrepancy in your cost-benefit projection model.
Elena: Thank you, Dr. Henderson. Was the calculation error rooted in the capital maintenance depreciation rate?
Dr. Henderson: Actually, your equipment depreciation timeline was fine. The issue lay in your assumption that regional water tariffs would remain static over the next decade. In truth, the provincial ministry recently legislated an annual 4% water price escalation.
Elena: Ah, that means the return on investment (ROI) break-even threshold will arrive three years sooner than I predicted!
`,
    questions: [
      {
        id: 'q-lis-mc-1',
        questionNumber: 1,
        questionText: 'According to Dr. Henderson, what fundamental flaw was present in Elena’s dissertation model?',
        options: [
          'A) She underestimated the equipment depreciation timeline',
          'B) She assumed local water utility costs would not alter over time',
          'C) She omitted empirical literature from arid agricultural regions',
          'D) She miscalculated the initial installation capital requirements',
        ],
        correctAnswer: 'B) She assumed local water utility costs would not alter over time',
        explanation: 'Dr. Henderson: "The issue lay in your assumption that regional water tariffs would remain static over the next decade." ("static" = will not alter/change).',
      },
    ],
  },

  // =========================================================================
  // 3. WRITING PRACTICE
  // =========================================================================
  {
    id: 'write-task1-01',
    module: 'Writing',
    questionType: 'Task 1 (Graphs/Charts/Maps)',
    title: 'Academic Task 1: Renewable Energy Generation in Three European Nations (2010–2025)',
    academicContext: 'Economics & Energy Trends',
    difficulty: 'Medium',
    targetBand: 7.5,
    passageOrPrompt: `
The line graph illustrates the proportion of total domestic electricity generated from renewable sources (wind, solar, and hydroelectric) across Germany, Spain, and Norway between 2010 and 2025.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
Write at least 150 words.

[Key Data Summary]:
- Norway: Maintained the undisputed lead throughout, starting at 96% in 2010 and marginally escalating to 98.5% in 2025.
- Germany: Exhibited the most pronounced surge, climbing steadily from 17% in 2010 to overtake Spain in 2018 at 38%, before peaking at 54% in 2025.
- Spain: Stood at 30% in 2010, rose to 42% by 2020, and plateaued at approximately 44% by the conclusion of the period.
`,
    questions: [
      {
        id: 'q-wr-t1-1',
        questionNumber: 1,
        questionText: 'Task 1 Overview Paragrafi uchun qaysi jumla eng yuqori baholanadi (Band 8+)?',
        options: [
          'Overall, Norway consistently produced by far the highest proportion of clean energy, whereas Germany witnessed the most dramatic upward trajectory, surpassing Spain over the fifteen-year timeframe.',
          'Overall, energy went up in all three countries and Norway was number one every year.',
          'Overall, Germany had 17% in 2010 and reached 54% in 2025 while Spain got 44%.',
          'In conclusion, renewable energy is very good for the environment in Europe.',
        ],
        correctAnswer: 'Overall, Norway consistently produced by far the highest proportion of clean energy, whereas Germany witnessed the most dramatic upward trajectory, surpassing Spain over the fifteen-year timeframe.',
        explanation: 'Band 8+ Overview umumiy asosiy tendensiyalarni (Norway yetakchiligi, Germaniyaning keskin o‘sishi va Ispaniyani quvib o‘tishi) raqamlarsiz sintez qilishi shart.',
        userTip: 'Overview paragrafida hech qachon alohida sanalar yoki xom raqamlarni qalashtirib yozmang; umumiy tendensiya va solishtiruvni ko‘rsating.',
      },
    ],
  },
  {
    id: 'write-task2-01',
    module: 'Writing',
    questionType: 'Task 2 (Opinion/Discussion/Problem-Solution)',
    title: 'Academic Task 2: Artificial Intelligence in Healthcare vs Human Doctors',
    academicContext: 'Bioethics & Technology',
    difficulty: 'Hard',
    targetBand: 8.5,
    passageOrPrompt: `
Some people argue that artificial intelligence algorithms will soon surpass human physicians in medical diagnostics and should replace doctors in clinical decision-making. Others believe that human empathy and clinical intuition remain irreplaceable in patient treatment.

Discuss both views and give your own opinion.
Give reasons for your answer and include any relevant examples from your own knowledge or experience.
Write at least 250 words.
`,
    questions: [
      {
        id: 'q-wr-t2-1',
        questionNumber: 1,
        questionText: 'Ushbu mavzu bo‘yicha Band 8.5 darajadagi Thesis Statement (Kirish qismi fikri) qaysi javobda keltirilgan?',
        options: [
          'While AI offers unmatched computational precision in analyzing complex radiological scans, I contend that holistic medical care inherently requires human empathy and ethical discernment, making a synergistic hybrid model the most prudent trajectory.',
          'I agree with both sides because technology is fast but doctors are very nice to sick patients.',
          'In this essay I will discuss both points of view and then I will tell my personal opinion at the end.',
          'Computers will definitely take all doctor jobs in the future because robots do not make mistakes.',
        ],
        correctAnswer: 'While AI offers unmatched computational precision in analyzing complex radiological scans, I contend that holistic medical care inherently requires human empathy and ethical discernment, making a synergistic hybrid model the most prudent trajectory.',
        explanation: 'Bu gapda murakkab sintaksis ("While AI offers... I contend that..."), boy leksika ("computational precision", "holistic medical care", "ethical discernment", "synergistic hybrid model") va aniq shaxsiy pozitsiya mavjud.',
        userTip: 'Band 8+ insholarda shaxsiy pozitsiya kirishdayoq aniq belgilab qo‘yiladi.',
      },
    ],
  },

  // =========================================================================
  // 4. SPEAKING PRACTICE
  // =========================================================================
  {
    id: 'speak-part2-01',
    module: 'Speaking',
    questionType: 'Part 2 (Cue Card)',
    title: 'Part 2 Cue Card: Describe an Environmental Initiative You Strongly Support',
    academicContext: 'Environmental Stewardship & Public Policy',
    difficulty: 'Medium',
    targetBand: 8.0,
    passageOrPrompt: `
Describe an environmental law or initiative that you strongly support.
You should say:
- What the initiative is and how you learned about it
- Who is responsible for implementing it
- What challenges might occur during its implementation
And explain why you think this initiative is beneficial for future generations.

You will have 1 minute to prepare your notes, and then you will be required to speak for 1 to 2 minutes uninterrupted.
`,
    questions: [
      {
        id: 'q-spk-p2-1',
        questionNumber: 1,
        questionText: 'IELTS Speaking mezonlari bo‘yicha "Lexical Resource" dan 8.0 ball olish uchun qaysi idiomatik/kollokatsion iboralar eng mos tushadi?',
        options: [
          '"curb carbon emissions", "stringent environmental regulations", "imperative for ecological equilibrium", "phase out single-use plastics"',
          '"stop bad air", "nature is very clean", "animals will be happy", "throw garbage in box"',
          '"people must do this", "good thing for tomorrow", "big problem today", "I like green trees"',
          '"money is needed", "politicians talk a lot", "cars are making smoke", "the sky is gray"',
        ],
        correctAnswer: '"curb carbon emissions", "stringent environmental regulations", "imperative for ecological equilibrium", "phase out single-use plastics"',
        explanation: 'IELTS Lexical Resource mezonida C1/C2 darajasidagi kollokatsiyalar ("stringent regulations", "curb emissions", "ecological equilibrium") yuqori ballni ta’minlaydi.',
      },
    ],
  },
  {
    id: 'speak-part3-01',
    module: 'Speaking',
    questionType: 'Part 3 (Two-way Discussion)',
    title: 'Part 3 Discussion: Global Economic Disparities vs Climate Responsibilities',
    academicContext: 'International Relations & Global Climate Justice',
    difficulty: 'Hard',
    targetBand: 8.5,
    passageOrPrompt: `
Examiner Question:
"Should developing economies be subject to the exact same carbon reduction quotas as industrialized nations that historically contributed the vast majority of cumulative global emissions?"
`,
    questions: [
      {
        id: 'q-spk-p3-1',
        questionNumber: 1,
        questionText: 'Part 3 da savolga chuqur, ko‘p qirrali va C2 grammatikasi bilan javob berish uchun qaysi nutq namunasi tavsiya etiladi?',
        options: [
          'From a climate justice perspective, enforcing uniform quotas disregards historical culpability. While developing nations must transition toward sustainable grids, industrialized powers bear a moral and fiscal imperative to subsidize green technology transfers rather than imposing punitive restrictions.',
          'No, poor countries do not have money so rich countries must pay everything.',
          'I think carbon is dangerous so every country must stop factories immediately without delay.',
          'Yes, because everyone lives on the same Earth so everyone should do exactly the same thing.',
        ],
        correctAnswer: 'From a climate justice perspective, enforcing uniform quotas disregards historical culpability. While developing nations must transition toward sustainable grids, industrialized powers bear a moral and fiscal imperative to subsidize green technology transfers rather than imposing punitive restrictions.',
        explanation: 'Javob adolatli bahslashuv ("From a climate justice perspective"), C1-C2 so‘zlar ("historical culpability", "fiscal imperative", "punitive restrictions") va muvozanatli xulosa bilan to‘liq javob beradi.',
      },
    ],
  },
];
