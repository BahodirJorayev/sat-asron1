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

export const translations = {
  // Navigation
  home: {
    uz: 'Uy',
    en: 'Home',
    ru: 'Главная',
  },
  dashboard: {
    uz: 'Uy',
    en: 'Home',
    ru: 'Главная',
  },
  questions: {
    uz: 'Savollar',
    en: 'Questions',
    ru: 'Вопросы',
  },
  qbank: {
    uz: 'Savollar',
    en: 'Questions',
    ru: 'Вопросы',
  },
  mocks: {
    uz: 'Testlar',
    en: 'Tests',
    ru: 'Тесты',
  },
  bluebook: {
    uz: 'Testlar',
    en: 'Tests',
    ru: 'Тесты',
  },
  vocabulary: {
    uz: "Lug'at",
    en: 'Vocabulary',
    ru: 'Словарь',
  },
  vocab: {
    uz: "Lug'at",
    en: 'Vocabulary',
    ru: 'Словарь',
  },
  mistakes: {
    uz: 'Xatolar',
    en: 'Mistakes',
    ru: 'Ошибки',
  },
  vault: {
    uz: 'Xatolar',
    en: 'Mistakes',
    ru: 'Ошибки',
  },
  community: {
    uz: 'Hamjamiyat',
    en: 'Community',
    ru: 'Сообщество',
  },
  admin: {
    uz: 'Admin',
    en: 'Admin',
    ru: 'Админ',
  },
  adminPanel: {
    uz: 'Admin Panel',
    en: 'Admin Panel',
    ru: 'Админ панель',
  },
  mainSections: {
    uz: 'Asosiy Bo‘limlar',
    en: 'Main Sections',
    ru: 'Основные разделы',
  },

  // Actions & Headers
  search: {
    uz: 'Qidiruv',
    en: 'Search',
    ru: 'Поиск',
  },
  searchPlaceholder: {
    uz: 'Qidiruv...',
    en: 'Search...',
    ru: 'Поиск...',
  },
  searchChannelsOrUsers: {
    uz: 'Foydalanuvchilar, guruhlar yoki kanallarni qidiring...',
    en: 'Search users, groups, or channels...',
    ru: 'Поиск пользователей, групп или каналов...',
  },
  all: {
    uz: 'Barchasi',
    en: 'All',
    ru: 'Все',
  },
  users: {
    uz: 'Foydalanuvchilar',
    en: 'Users',
    ru: 'Пользователи',
  },
  channels: {
    uz: 'Kanallar',
    en: 'Channels',
    ru: 'Каналы',
  },
  login: {
    uz: 'Kirish',
    en: 'Log In',
    ru: 'Войти',
  },
  register: {
    uz: "Ro'yxatdan o'tish",
    en: 'Sign Up',
    ru: 'Регистрация',
  },
  signUpFree: {
    uz: "Bepul ro'yxatdan o'tish",
    en: 'Sign Up Free',
    ru: 'Регистрация бесплатно',
  },
  logout: {
    uz: 'Chiqish',
    en: 'Log Out',
    ru: 'Выйти',
  },
  profile: {
    uz: 'Profil',
    en: 'Profile',
    ru: 'Профиль',
  },
  settings: {
    uz: 'Sozlamalar',
    en: 'Settings',
    ru: 'Настройки',
  },
  profileAndSettings: {
    uz: 'Profil & Sozlamalar',
    en: 'Profile & Settings',
    ru: 'Профиль и Настройки',
  },
  myProfile: {
    uz: 'Mening Profilim',
    en: 'My Profile',
    ru: 'Мой профиль',
  },
  language: {
    uz: 'Til',
    en: 'Language',
    ru: 'Язык',
  },
  selectLanguage: {
    uz: 'Tilni tanlang',
    en: 'Select language',
    ru: 'Выберите язык',
  },
  overviewFeatures: {
    uz: "Umumiy ko'rinish",
    en: 'Overview & Features',
    ru: 'Обзор и возможности',
  },
  blogSocial: {
    uz: 'Blog & Ijtimoiy',
    en: 'Blog & Social',
    ru: 'Блог и Сообщество',
  },
  diagnosticTest: {
    uz: 'Diagnostik Test',
    en: 'Diagnostic Test',
    ru: 'Диагностический тест',
  },
  tenMinDrills: {
    uz: '10-Daqiqalik Mashq',
    en: '10-Min Drills',
    ru: '10-минутные тесты',
  },
  openMenu: {
    uz: 'Menyuni ochish',
    en: 'Open Menu',
    ru: 'Открыть меню',
  },
  goToProfile: {
    uz: "Profilga o'tish",
    en: 'Go to Profile',
    ru: 'Перейти в профиль',
  },
  student: {
    uz: 'Talaba',
    en: 'Student',
    ru: 'Студент',
  },
  user: {
    uz: 'Foydalanuvchi',
    en: 'User',
    ru: 'Пользователь',
  },
  locked: {
    uz: 'Qulflangan',
    en: 'Locked',
    ru: 'Заблокировано',
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey | string, lang: Language = 'uz', fallback?: string): string {
  if (key in translations) {
    const entry = (translations as Record<string, Record<Language, string>>)[key];
    if (entry) {
      return entry[lang] || entry['uz'] || fallback || String(key);
    }
  }
  return fallback !== undefined ? fallback : String(key);
}
