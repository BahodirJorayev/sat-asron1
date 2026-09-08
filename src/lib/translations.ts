export type Language = 'uz' | 'en' | 'ru';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'uz', label: "O'zbekcha", nativeLabel: "O'zbek", flag: '🇺🇿' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', nativeLabel: 'Русский', flag: '🇷🇺' },
];

/**
 * STRICT STANDARDIZED SAT TERMINOLOGY SHIELD (DO NOT TRANSLATE)
 * The following official exam terms MUST always remain verbatim in English across all 3 languages (UZ, EN, RU):
 * - SAT, Digital SAT, Reading & Writing, Math, Desmos, College Board, Bluebook,
 *   Module 1, Module 2, Hard Module, Easy Module, Domains & Skills, Erica Meltzer, Score (1500+).
 */
export const SAT_TERMINOLOGY_SHIELD = [
  'SAT',
  'Digital SAT',
  'Reading & Writing',
  'Math',
  'Desmos',
  'College Board',
  'Bluebook',
  'Module 1',
  'Module 2',
  'Hard Module',
  'Easy Module',
  'Domains & Skills',
  'Erica Meltzer',
  'Score (1500+)',
] as const;

export const translations = {
  uz: {
    // Navigation & Shell
    nav: {
      home: "Bosh sahifa",
      questions: "Savollar Banki",
      mocks: "Mock Testlar",
      vocabulary: "SAT Lug'at",
      mistakes: "Xatolar Ombori",
      community: "Hamjamiyat",
      admin: "Admin Panel",
      searchPlaceholder: "Qidirish (odamlar, guruhlar, savollar)...",
      login: "Kirish",
      register: "Ro'yxatdan o'tish",
      logout: "Chiqish",
      profile: "Mening Profilim",
      settings: "Sozlamalar",
    },
    // Landing Page
    landing: {
      badge: "ASRON SAT • 2026 Yangi Format",
      heroTitle: "Adaptive Mastery bilan Digital SAT imtihonida 1500+ ball oling",
      heroSubtitle: "SAT imtihoniga professional, tizimli va xolis tayyorgarlik platformasi.",
      startFree: "Ro'yxatdan o'tish (Bepul)",
      takeDiagnostic: "Bepul 7-daqiqalik diagnostika testi",
      featuresTitle: "Nega aynan ASRON SAT?",
      featuresSubtitle: "Har bir talabaning zaif tomonlarini aniqlab, yuqori natijaga eltuvchi tizim.",
      statStudents: "Faol o'quvchilar",
      statAvgIncrease: "O'rtacha ball o'sishi",
      statAccuracy: "Savollar aniqligi",
      statTests: "Haqiqiy Bluebook formatidagi testlar",
      faqTitle: "Ko'p beriladigan savollar",
      ctaTitle: "O'z SAT ballingizni bugunoq oshirishni boshlang",
      ctaButton: "Boshlash",
    },
    // Dashboard & Practice
    dashboard: {
      welcome: "Xush kelibsiz",
      targetScore: "Maqsadli ball",
      studyStreak: "Ketma-ketlik",
      dailyGoal: "Kunlik reja",
      startPractice: "Mashqni boshlash",
      continueMock: "Testni davom ettirish",
      recentActivity: "So'nggi faollik",
      viewAll: "Barchasini ko'rish",
      rwProgress: "Reading & Writing natijasi",
      mathProgress: "Math natijasi",
      desmosMastery: "Desmos ko'nikmalari",
      days: "kun",
      questionsCount: "ta savol",
    },
    // Community & Chat Hub
    community: {
      searchPlaceholder: "Guruhlar, kanallar yoki do'stlarni qidirish...",
      publicChannels: "Ommaviy Kanallar",
      directMessages: "Shaxsiy Xabarlar",
      createChannel: "Yangi kanal ochish",
      membersCount: "ta a'zo",
      online: "onlayn",
      typeMessage: "Xabar yozing...",
      send: "Yuborish",
      join: "Qo'shilish",
      leave: "Chiqish",
      noResults: "Hech narsa topilmadi",
      startConversation: "Suhbatni boshlang",
    },
    // Common Actions & Errors
    common: {
      save: "Saqlash",
      cancel: "Bekor qilish",
      delete: "O'chirish",
      edit: "Tahrirlash",
      loading: "Yuklanmoqda...",
      success: "Muvaffaqiyatli saqlandi",
      errorOccurred: "Xatolik yuz berdi",
      installApp: "Ilovani o'rnatish",
      installAppDesc: "Qulay va tezkor kirish uchun telefoningizga o'rnating.",
      installPwa: "O'rnatish",
      pwaBannerTitle: "ASRON SAT Ilovasi",
      pwaBannerDesc: "Bosh ekranga o'rnatish & tezkor kirish",
      iosGuideTitle: "iOS Safari'da O'rnatish",
      iosGuideSubtitle: "Rasmiy web ilovani bosh ekranga qo'shing",
      iosStep1Title: "Ulashish menyusini oching",
      iosStep1Desc: "Safari brauzerining pastki qismidagi \"Ulashish\" (Share) tugmasini bosing.",
      iosStep1DescIpad: "Safari brauzerining yuqori panelidagi \"Ulashish\" (Share) tugmasini bosing.",
      iosStep2Title: "Bosh ekranga qo'shishni tanlang",
      iosStep2Desc: "Menyuni pastga surib, \"Bosh ekranga qo'shish\" (Add to Home Screen) bandini tanlang.",
      iosStep3Title: "Qo'shishni tasdiqlang",
      iosStep3Desc: "Yuqori o'ng burchakdagi \"Qo'shish\" (Add) tugmasini bosing.",
      iosInAppNotice: "Ilovani to'liq o'rnatish uchun sahifani Safari brauzerida oching.",
      iosTapBelow: "Pastdagi \"Ulashish\" (Share) tugmasini bosing",
      iosUnderstood: "Tushundim",
      pwaInstalledSuccess: "ASRON SAT ilovasi muvaffaqiyatli o'rnatildi!",
      later: "Keyinroq",
    },
    // 1. Home Dashboard View
    home_view: {
      greeting: "Salom",
      examPlanSubtitle: "College Board rasmiy test sanasiga asoslangan tayyorgarlik rejasi",
      streak: "Kunlik Seriya",
      questions: "Ishlangan Savollar",
      accuracy: "Umumiy Aniqlik",
      daysUnit: "kun qoldi",
      mainModules: "Asosiy Modullar",
      testsCard: "To'liq formatdagi rasmiy va eksklyuziv sinov testlari",
      questionsCard: "Barcha domenlar va qiyinlik darajalari bo'yicha saralangan savollar",
      vocabCard: "SAT imtihonida eng ko'p uchraydigan akademik so'zlar bazasi",
      communityCard: "Boshqa o'quvchilar bilan muloqot, savol-javob va tajriba almashish",
      recommendedResources: "Tavsiya etilgan manbalar",
    },
    // 2. Question Bank View (SQB)
    sqb_view: {
      badge: "Rasmiy Savollar Banki",
      title: "College Board Standartidagi Savollar Banki",
      startSetBtn: "Savollar to'plamini boshlash",
      totalQuestions: "Jami Savollar",
      completedQuestions: "Tugatilgan",
      overallAccuracy: "Aniqlik",
      avgTime: "O'rtacha Vaqt",
    },
    // 3. Mock Tests Catalog View
    mocks_view: {
      title: "Mock Testlar Katalogi",
      subtitle: "Haqiqiy Digital SAT formati, adaptiv Module 1 va Module 2 tizimi hamda rasmiy ball hisoblash algoritmi",
      testsTaken: "Topshirilgan Testlar",
      highestScore: "Eng Yuqori Score",
      avgScore: "O'rtacha Score",
      stage2Status: "Adaptiv Bosqich",
      stage2Desc: "Module 1 natijangizga qarab Module 2 avtomatik ravishda Hard yoki Easy darajaga moslashadi.",
      allTestsTab: "Barcha Testlar",
      officialTab: "College Board Rasmiy",
      courseMocksTab: "Kurs Mocklari",
      diagnosticTab: "Diagnostik",
      searchPlaceholder: "Test nomi yoki kodi bo'yicha qidirish...",
      statusAll: "Barchasi",
      statusNew: "Yangi",
      statusInProgress: "Jarayonda",
      statusCompleted: "Yakunlangan",
      accessAll: "Barchasi",
      accessPublic: "Ochiq (Public)",
      startBtn: "Testni Boshlash",
    },
    // 4. Vocabulary Mastery View
    vocab_view: {
      title: "SAT Lug'at Bazasi",
      mastered: "O'zlashtirilgan",
      dueReview: "Takrorlash Kerak",
      masteryRate: "O'zlashtirish Darajasi",
      totalInBook: "Lug'atdagi Jami So'zlar",
      downloadPdf: "PDF Lug'atni Yuklab Olish",
      flashcardsTab: "Fleshkartalar",
      quizTab: "Mini Quiz",
      tableTab: "Jadval Ko'rinishi",
    },
    // 5. Mistake Vault View
    mistakes_view: {
      totalLogged: "Jami Xatolar",
      dueToday: "Bugun Qaytadan Yechish Kerak",
      inCycle: "Faol Takrorlashda",
      mastered: "Mukammal O'zlashtirildi",
      tabAll: "Barchasi",
      tabReview: "Bugun Qaytarish",
      tabLearning: "O'rganilmoqda",
      tabMastered: "O'zlashtirildi",
      searchPlaceholder: "Xato savollar bo'yicha qidiruv...",
      emptyTitle: "Hozircha xatolar qayd etilmagan",
      emptyDesc: "Mock test yoki Savollar Banki yechish jarayonida xato qilgan savollaringiz avtomatik tarzda tahlil qilish uchun shu yerga tushadi.",
      diagnosticsTitle: "Xatolar Tahlili & Tavsiyalar",
      diagnosticsDesc: "Har bir xato qilingan savol ustida ishlab, to'g'ri tahlil qilsangiz, keyingi testlarda ushbu turdagi xatolar 90% ga kamayadi.",
    },
    // 6. Community Hub View
    community_view: {
      searchPlaceholder: "Kanal, guruh yoki xabarlarni qidirish...",
      tabAll: "Barchasi",
      tabChannels: "Kanallar",
      tabGroups: "Guruhlar",
      tabDirect: "Shaxsiy",
      tabSaved: "Saqlanganlar",
      readOnlyNotice: "Ushbu kanalda faqat administratorlar xabar yoza oladi.",
    },
  },
  en: {
    nav: {
      home: "Home",
      questions: "Question Bank",
      mocks: "Mock Tests",
      vocabulary: "SAT Vocabulary",
      mistakes: "Mistake Bank",
      community: "Community",
      admin: "Admin Panel",
      searchPlaceholder: "Search (people, groups, questions)...",
      login: "Log In",
      register: "Sign Up",
      logout: "Log Out",
      profile: "My Profile",
      settings: "Settings",
    },
    landing: {
      badge: "ASRON SAT • 2026 New Format",
      heroTitle: "Score 1500+ on the Digital SAT with Adaptive Mastery",
      heroSubtitle: "A professional, systematic, and unbiased preparation platform for the SAT exam.",
      startFree: "Sign Up Free",
      takeDiagnostic: "Take Free 7-Min Diagnostic Test",
      featuresTitle: "Why Choose ASRON SAT?",
      featuresSubtitle: "A system designed to pinpoint weaknesses and guide you to top percentiles.",
      statStudents: "Active Students",
      statAvgIncrease: "Average Score Increase",
      statAccuracy: "Question Accuracy",
      statTests: "Real Bluebook-standard Mocks",
      faqTitle: "Frequently Asked Questions",
      ctaTitle: "Start maximizing your SAT score today",
      ctaButton: "Get Started",
    },
    dashboard: {
      welcome: "Welcome back",
      targetScore: "Target Score",
      studyStreak: "Study Streak",
      dailyGoal: "Daily Goal",
      startPractice: "Start Practice",
      continueMock: "Continue Mock",
      recentActivity: "Recent Activity",
      viewAll: "View All",
      rwProgress: "Reading & Writing Progress",
      mathProgress: "Math Progress",
      desmosMastery: "Desmos Mastery",
      days: "days",
      questionsCount: "questions",
    },
    community: {
      searchPlaceholder: "Search groups, channels, or friends...",
      publicChannels: "Public Channels",
      directMessages: "Direct Messages",
      createChannel: "Create Channel",
      membersCount: "members",
      online: "online",
      typeMessage: "Type a message...",
      send: "Send",
      join: "Join",
      leave: "Leave",
      noResults: "No results found",
      startConversation: "Start the conversation",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      loading: "Loading...",
      success: "Successfully saved",
      errorOccurred: "An error occurred",
      installApp: "Install App",
      installAppDesc: "Install on your home screen for quick and seamless access.",
      installPwa: "Install",
      pwaBannerTitle: "ASRON SAT App",
      pwaBannerDesc: "Add to home screen & quick offline access",
      iosGuideTitle: "Install on iOS Safari",
      iosGuideSubtitle: "Add official web app to your Home Screen",
      iosStep1Title: "Open Share Menu",
      iosStep1Desc: "Tap the \"Share\" button at the bottom of the Safari toolbar.",
      iosStep1DescIpad: "Tap the \"Share\" button at the top of the Safari toolbar.",
      iosStep2Title: "Select Add to Home Screen",
      iosStep2Desc: "Scroll down the share sheet and tap \"Add to Home Screen\".",
      iosStep3Title: "Confirm & Add",
      iosStep3Desc: "Tap \"Add\" in the top-right corner of your screen.",
      iosInAppNotice: "For full installation, please open this page in Safari browser.",
      iosTapBelow: "Tap the \"Share\" button below",
      iosUnderstood: "Got it",
      pwaInstalledSuccess: "ASRON SAT app successfully installed!",
      later: "Later",
    },
    // 1. Home Dashboard View
    home_view: {
      greeting: "Welcome back",
      examPlanSubtitle: "Preparation schedule aligned with official College Board exam dates",
      streak: "Daily Streak",
      questions: "Solved Questions",
      accuracy: "Overall Accuracy",
      daysUnit: "days left",
      mainModules: "Core Modules",
      testsCard: "Full-length official and exclusive diagnostic practice tests",
      questionsCard: "Curated questions filtered by official domains, skills and difficulty",
      vocabCard: "High-frequency academic vocabulary curated for SAT success",
      communityCard: "Connect, discuss questions, and exchange strategies with peers",
      recommendedResources: "Recommended Resources",
    },
    // 2. Question Bank View (SQB)
    sqb_view: {
      badge: "Official Question Bank",
      title: "College Board Standard Question Bank",
      startSetBtn: "Start Practice Set",
      totalQuestions: "Total Questions",
      completedQuestions: "Completed",
      overallAccuracy: "Accuracy",
      avgTime: "Average Time",
    },
    // 3. Mock Tests Catalog View
    mocks_view: {
      title: "Mock Tests Catalog",
      subtitle: "Realistic Digital SAT format with adaptive Module 1 and Module 2 routing and official scoring algorithms",
      testsTaken: "Tests Completed",
      highestScore: "Highest Score",
      avgScore: "Average Score",
      stage2Status: "Adaptive Routing",
      stage2Desc: "Module 2 dynamically adapts to Hard Module or Easy Module based on your Module 1 performance.",
      allTestsTab: "All Tests",
      officialTab: "Official College Board",
      courseMocksTab: "Course Mocks",
      diagnosticTab: "Diagnostic",
      searchPlaceholder: "Search test by title or code...",
      statusAll: "All",
      statusNew: "New",
      statusInProgress: "In Progress",
      statusCompleted: "Completed",
      accessAll: "All",
      accessPublic: "Public",
      startBtn: "Start Test",
    },
    // 4. Vocabulary Mastery View
    vocab_view: {
      title: "SAT Vocabulary Mastery",
      mastered: "Mastered",
      dueReview: "Due for Review",
      masteryRate: "Mastery Rate",
      totalInBook: "Total Lexicon",
      downloadPdf: "Download PDF Vocabulary",
      flashcardsTab: "Flashcards",
      quizTab: "Mini Quiz",
      tableTab: "Table View",
    },
    // 5. Mistake Vault View
    mistakes_view: {
      totalLogged: "Total Logged",
      dueToday: "Due for Review Today",
      inCycle: "In Active Review",
      mastered: "Mastered",
      tabAll: "All",
      tabReview: "Review Today",
      tabLearning: "Learning",
      tabMastered: "Mastered",
      searchPlaceholder: "Search logged mistakes...",
      emptyTitle: "No mistakes recorded yet",
      emptyDesc: "Questions answered incorrectly during Mock Tests or Question Bank practice will automatically appear here for review.",
      diagnosticsTitle: "Mistake Diagnostics & Strategic Insights",
      diagnosticsDesc: "Targeting your recurring weak spots through spaced repetition reduces conceptual errors by over 90% on test day.",
    },
    // 6. Community Hub View
    community_view: {
      searchPlaceholder: "Search channels, groups, or messages...",
      tabAll: "All",
      tabChannels: "Channels",
      tabGroups: "Groups",
      tabDirect: "Direct",
      tabSaved: "Saved",
      readOnlyNotice: "This channel is broadcast-only. Only admins can send messages.",
    },
  },
  ru: {
    nav: {
      home: "Главная",
      questions: "Банк вопросов",
      mocks: "Mock Тесты",
      vocabulary: "Словарь SAT",
      mistakes: "Банк ошибок",
      community: "Сообщество",
      admin: "Панель админа",
      searchPlaceholder: "Поиск (люди, группы, вопросы)...",
      login: "Войти",
      register: "Регистрация",
      logout: "Выйти",
      profile: "Мой профиль",
      settings: "Настройки",
    },
    landing: {
      badge: "ASRON SAT • Формат 2026",
      heroTitle: "Наберите 1500+ на Digital SAT с адаптивной системой",
      heroSubtitle: "Профессиональная и системная платформа подготовки к экзамену SAT.",
      startFree: "Регистрация (Бесплатно)",
      takeDiagnostic: "Пройти 7-минутный диагностический тест",
      featuresTitle: "Почему выбирают ASRON SAT?",
      featuresSubtitle: "Система, выявляющая слабые места и ведущая к максимальному баллу.",
      statStudents: "Активных студентов",
      statAvgIncrease: "Средний прирост баллов",
      statAccuracy: "Точность вопросов",
      statTests: "Тесты по стандарту Bluebook",
      faqTitle: "Часто задаваемые вопросы",
      ctaTitle: "Начните повышать свой балл SAT уже сегодня",
      ctaButton: "Начать",
    },
    dashboard: {
      welcome: "С возвращением",
      targetScore: "Целевой балл",
      studyStreak: "Ударный режим",
      dailyGoal: "Дневная цель",
      startPractice: "Начать практику",
      continueMock: "Продолжить тест",
      recentActivity: "Недавняя активность",
      viewAll: "Смотреть все",
      rwProgress: "Прогресс Reading & Writing",
      mathProgress: "Прогресс Math",
      desmosMastery: "Навыки Desmos",
      days: "дней",
      questionsCount: "вопросов",
    },
    community: {
      searchPlaceholder: "Поиск групп, каналов или друзей...",
      publicChannels: "Публичные каналы",
      directMessages: "Личные сообщения",
      createChannel: "Создать канал",
      membersCount: "участников",
      online: "в сети",
      typeMessage: "Напишите сообщение...",
      send: "Отправить",
      join: "Подписаться",
      leave: "Выйти",
      noResults: "Ничего не найдено",
      startConversation: "Начните диалог",
    },
    common: {
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      edit: "Редактировать",
      loading: "Загрузка...",
      success: "Успешно сохранено",
      errorOccurred: "Произошла ошибка",
      installApp: "Установить приложение",
      installAppDesc: "Установите на главный экран для быстрого и удобного доступа.",
      installPwa: "Установить",
      pwaBannerTitle: "Приложение ASRON SAT",
      pwaBannerDesc: "На главный экран для быстрого доступа",
      iosGuideTitle: "Установка в iOS Safari",
      iosGuideSubtitle: "Добавьте официальное приложение на экран «Домой»",
      iosStep1Title: "Откройте меню «Поделиться»",
      iosStep1Desc: "Нажмите кнопку «Поделиться» (Share) на нижней панели Safari.",
      iosStep1DescIpad: "Нажмите кнопку «Поделиться» (Share) на верхней панели Safari.",
      iosStep2Title: "Выберите «На экран Домой»",
      iosStep2Desc: "Прокрутите меню вниз и выберите «На экран \"Домой\"» (Add to Home Screen).",
      iosStep3Title: "Подтвердите добавление",
      iosStep3Desc: "Нажмите «Добавить» (Add) в правом верхнем углу.",
      iosInAppNotice: "Для полноценной установки откройте страницу в Safari.",
      iosTapBelow: "Нажмите кнопку «Поделиться» (Share) внизу",
      iosUnderstood: "Понятно",
      pwaInstalledSuccess: "Приложение ASRON SAT успешно установлено!",
      later: "Позже",
    },
    // 1. Home Dashboard View
    home_view: {
      greeting: "Здравствуйте",
      examPlanSubtitle: "План подготовки, согласованный с официальными датами College Board",
      streak: "Серия дней",
      questions: "Решено вопросов",
      accuracy: "Общая точность",
      daysUnit: "дней осталось",
      mainModules: "Основные модули",
      testsCard: "Полноформатные официальные и авторские пробные тесты",
      questionsCard: "Банк заданий, разбитый по официальным доменам и сложности",
      vocabCard: "Высокочастотный академический словарь для успешной сдачи SAT",
      communityCard: "Общение, разбор трудных заданий и обмен опытом с учениками",
      recommendedResources: "Рекомендованные ресурсы",
    },
    // 2. Question Bank View (SQB)
    sqb_view: {
      badge: "Официальный банк вопросов",
      title: "Банк заданий по стандартам College Board",
      startSetBtn: "Начать сборник заданий",
      totalQuestions: "Всего вопросов",
      completedQuestions: "Пройдено",
      overallAccuracy: "Точность",
      avgTime: "Среднее время",
    },
    // 3. Mock Tests Catalog View
    mocks_view: {
      title: "Каталог пробных тестов",
      subtitle: "Реалистичный формат Digital SAT с адаптивными Module 1 и Module 2 и официальным алгоритмом оценивания",
      testsTaken: "Пройдено тестов",
      highestScore: "Максимальный Score",
      avgScore: "Средний Score",
      stage2Status: "Адаптивный этап",
      stage2Desc: "Module 2 автоматически адаптируется под Hard или Easy уровень на основе результатов Module 1.",
      allTestsTab: "Все тесты",
      officialTab: "Официальные College Board",
      courseMocksTab: "Курсовые тесты",
      diagnosticTab: "Диагностика",
      searchPlaceholder: "Поиск теста по названию или коду...",
      statusAll: "Все",
      statusNew: "Новые",
      statusInProgress: "В процессе",
      statusCompleted: "Завершенные",
      accessAll: "Все",
      accessPublic: "Открытые (Public)",
      startBtn: "Начать тест",
    },
    // 4. Vocabulary Mastery View
    vocab_view: {
      title: "Словарный запас SAT",
      mastered: "Освоено",
      dueReview: "Повторить",
      masteryRate: "Процент освоения",
      totalInBook: "Всего слов в словаре",
      downloadPdf: "Скачать словарь в PDF",
      flashcardsTab: "Карточки",
      quizTab: "Мини-тест",
      tableTab: "Таблица",
    },
    // 5. Mistake Vault View
    mistakes_view: {
      totalLogged: "Всего ошибок",
      dueToday: "Повторить сегодня",
      inCycle: "В цикле повторения",
      mastered: "Освоено",
      tabAll: "Все",
      tabReview: "Повторить сегодня",
      tabLearning: "Изучаются",
      tabMastered: "Освоено",
      searchPlaceholder: "Поиск по ошибкам...",
      emptyTitle: "Ошибок пока не зафиксировано",
      emptyDesc: "Вопросы с неверными ответами в тестах и банке заданий автоматически сохраняются здесь для детального разбора.",
      diagnosticsTitle: "Диагностика ошибок и рекомендации",
      diagnosticsDesc: "Работа над ошибками по методике интервального повторения снижает вероятность повторных ошибок на 90%.",
    },
    // 6. Community Hub View
    community_view: {
      searchPlaceholder: "Поиск каналов, групп или сообщений...",
      tabAll: "Все",
      tabChannels: "Каналы",
      tabGroups: "Группы",
      tabDirect: "Личные",
      tabSaved: "Избранное",
      readOnlyNotice: "Этот канал в режиме чтения. Только администраторы могут отправлять сообщения.",
    },
  },
};

export type TranslationKey = string;

/**
 * Universal backwards-compatible fallback mapping for flat keys used in legacy components
 */
const FLAT_ALIAS_MAP: Record<string, { uz: string; en: string; ru: string }> = {
  dashboard: { uz: 'Bosh sahifa', en: 'Home', ru: 'Главная' },
  home: { uz: 'Bosh sahifa', en: 'Home', ru: 'Главная' },
  qbank: { uz: 'Savollar Banki', en: 'Question Bank', ru: 'Банк вопросов' },
  practice: { uz: 'Savollar Banki', en: 'Question Bank', ru: 'Банк вопросов' },
  questions: { uz: 'Savollar Banki', en: 'Question Bank', ru: 'Банк вопросов' },
  bluebook: { uz: 'Mock Testlar', en: 'Mock Tests', ru: 'Mock Тесты' },
  mocks: { uz: 'Mock Testlar', en: 'Mock Tests', ru: 'Mock Тесты' },
  vocab: { uz: "SAT Lug'at", en: 'SAT Vocabulary', ru: 'Словарь SAT' },
  vocabulary: { uz: "SAT Lug'at", en: 'SAT Vocabulary', ru: 'Словарь SAT' },
  vault: { uz: 'Xatolar Ombori', en: 'Mistake Bank', ru: 'Банк ошибок' },
  mistakes: { uz: 'Xatolar Ombori', en: 'Mistake Bank', ru: 'Банк ошибок' },
  community: { uz: 'Hamjamiyat', en: 'Community', ru: 'Сообщество' },
  admin: { uz: 'Admin Panel', en: 'Admin Panel', ru: 'Панель админа' },
  adminPanel: { uz: 'Admin Panel', en: 'Admin Panel', ru: 'Панель админа' },
  mainSections: { uz: 'Asosiy Bo‘limlar', en: 'Main Sections', ru: 'Основные разделы' },

  language: { uz: 'Til', en: 'Language', ru: 'Язык' },
  selectLanguage: { uz: 'Tilni tanlang', en: 'Select language', ru: 'Выберите язык' },
  profile: { uz: 'Mening Profilim', en: 'My Profile', ru: 'Мой профиль' },
  myProfile: { uz: 'Mening Profilim', en: 'My Profile', ru: 'Мой профиль' },
  settings: { uz: 'Sozlamalar', en: 'Settings', ru: 'Настройки' },
  profileAndSettings: { uz: 'Profil & Sozlamalar', en: 'Profile & Settings', ru: 'Профиль и Настройки' },
  goToProfile: { uz: "Profilga o'tish", en: 'Go to Profile', ru: 'Перейти в профиль' },
  login: { uz: 'Kirish', en: 'Log In', ru: 'Войти' },
  register: { uz: "Ro'yxatdan o'tish", en: 'Sign Up', ru: 'Регистрация' },
  signUpFree: { uz: "Ro'yxatdan o'tish (Bepul)", en: 'Sign Up Free', ru: 'Регистрация (Бесплатно)' },
  logout: { uz: 'Chiqish', en: 'Log Out', ru: 'Выйти' },
  student: { uz: 'Talaba', en: 'Student', ru: 'Студент' },
  user: { uz: 'Foydalanuvchi', en: 'User', ru: 'Пользователь' },
  locked: { uz: 'Qulflangan', en: 'Locked', ru: 'Заблокировано' },

  all: { uz: 'Barchasi', en: 'All', ru: 'Все' },
  users: { uz: 'Foydalanuvchilar', en: 'Users', ru: 'Пользователи' },
  channels: { uz: 'Kanallar', en: 'Channels', ru: 'Каналы' },
  search: { uz: 'Qidiruv', en: 'Search', ru: 'Поиск' },
  searchPlaceholder: { uz: 'Qidirish (odamlar, guruhlar, savollar)...', en: 'Search (people, groups, questions)...', ru: 'Поиск (люди, группы, вопросы)...' },
  searchChannelsOrUsers: { uz: "Guruhlar, kanallar yoki do'stlarni qidirish...", en: 'Search groups, channels, or friends...', ru: 'Поиск групп, каналов или друзей...' },
  diagnosticTest: { uz: 'Diagnostik Test', en: 'Diagnostic Test', ru: 'Диагностический тест' },
  tenMinDrills: { uz: '10-Daqiqalik Mashq', en: '10-Min Drills', ru: '10-минутные тесты' },
  openMenu: { uz: 'Menyuni ochish', en: 'Open Menu', ru: 'Открыть меню' },

  overviewFeatures: { uz: "Umumiy ko'rinish & Imkoniyatlar", en: 'Overview & Features', ru: 'Обзор и Возможности' },
  blogSocial: { uz: 'Blog & Ijtimoiy', en: 'Blog & Social', ru: 'Блог и Соцсети' },
  expandSidebar: { uz: 'Kengaytirish', en: 'Expand sidebar', ru: 'Развернуть' },
  collapseSidebar: { uz: "Panelni yig'ish", en: 'Collapse sidebar', ru: 'Свернуть' },
  platformSettings: { uz: 'Platforma Sozlamalari', en: 'Platform Settings', ru: 'Настройки платформы' },
  signingOut: { uz: 'Chiqilmoqda...', en: 'Signing out...', ru: 'Выход...' },
  accuracy: { uz: 'Aniqlik', en: 'Accuracy', ru: 'Точность' },
  streak: { uz: 'Streak', en: 'Streak', ru: 'Серия' },
  active: { uz: 'Faol', en: 'Active', ru: 'Активно' },
  zero: { uz: 'Nol', en: 'Zero', ru: 'Ноль' },
  view: { uz: "Ko'rish", en: 'View', ru: 'Смотреть' },
  noMistakes: { uz: 'Xatolar mavjud emas', en: 'No mistakes recorded', ru: 'Ошибок нет' },
  mistakesCount: { uz: 'ta xato', en: 'mistakes', ru: 'ошибок' },
  changeDate: { uz: "Sanani o'zgartirish", en: 'Change Date', ru: 'Изменить дату' },
  timeRemaining: { uz: 'Imtihongacha Qolgan Vaqt', en: 'Time Remaining Until Exam', ru: 'Время до экзамена' },
  daysUpper: { uz: 'KUN', en: 'DAYS', ru: 'ДНЕЙ' },
  hoursUpper: { uz: 'SOAT', en: 'HOURS', ru: 'ЧАСОВ' },
  minutesUpper: { uz: 'DAQIQA', en: 'MINUTES', ru: 'МИНУТ' },
  secondsUpper: { uz: 'SEKUND', en: 'SECONDS', ru: 'СЕКУНД' },
  selectExamDate: { uz: 'SAT Imtihon Sanasini Tanlash', en: 'Select SAT Exam Date', ru: 'Выбор даты экзамена SAT' },
  currentDate: { uz: 'Hozirgi sana', en: 'Current date', ru: 'Текущая дата' },
  officialExamDates: { uz: 'Rasmiy Digital SAT Sanalari (2026)', en: 'Official Digital SAT Dates (2026)', ru: 'Официальные даты Digital SAT (2026)' },
  customDate: { uz: 'Boshqa (Maxsus) Sana Belgilash', en: 'Set Custom Date', ru: 'Указать свою дату' },
  dateSavedEverywhere: { uz: 'Sana barcha qurilmalarda saqlanadi', en: 'Date is synchronized across all devices', ru: 'Дата сохраняется на всех устройствах' },
  close: { uz: 'Yopish', en: 'Close', ru: 'Закрыть' },
};

/**
 * Universal Translation Resolver
 * - Resolves hierarchical dot paths: e.g. "nav.home", "landing.heroTitle", "dashboard.studyStreak"
 * - Resolves flat key aliases: e.g. "questions", "mocks", "goToProfile"
 * - Graceful fallback to default language ("uz") or custom fallback string
 */
export function t(key: TranslationKey | string, lang: Language = 'uz', fallback?: string): string {
  const safeLang: Language = (lang === 'uz' || lang === 'en' || lang === 'ru') ? lang : 'uz';
  const langDict = translations[safeLang] || translations.uz;

  if (typeof key === 'string') {
    // 1. Check dot notation (e.g., 'nav.home', 'dashboard.studyStreak', 'common.save')
    if (key.includes('.')) {
      const parts = key.split('.');
      let current: any = langDict;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          current = undefined;
          break;
        }
      }
      if (typeof current === 'string') {
        return current;
      }

      // Try fallback to 'uz' dictionary if missing in current lang
      let fallbackCurrent: any = translations.uz;
      for (const part of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && part in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[part];
        } else {
          fallbackCurrent = undefined;
          break;
        }
      }
      if (typeof fallbackCurrent === 'string') {
        return fallbackCurrent;
      }
    }

    // 2. Check each top-level section for direct key
    const sections = ['nav', 'landing', 'dashboard', 'community', 'common', 'home_view', 'sqb_view', 'mocks_view', 'vocab_view', 'mistakes_view', 'community_view'];
    for (const sec of sections) {
      const secDict = (langDict as any)[sec];
      if (secDict && key in secDict) {
        return secDict[key];
      }
    }

    // 3. Check legacy flat alias map
    if (key in FLAT_ALIAS_MAP) {
      const alias = FLAT_ALIAS_MAP[key];
      return alias[safeLang] || alias.uz;
    }
  }

  return fallback !== undefined ? fallback : String(key);
}
