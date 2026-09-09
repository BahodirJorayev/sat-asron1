'use client';

export type ActiveView = 
  | 'landing' 
  | 'dashboard' 
  | 'questions' 
  | 'mocks' 
  | 'vocabulary' 
  | 'mistakes' 
  | 'community' 
  | 'admin' 
  | 'profile'
  | 'arena'
  | 'ai-tutor'
  | 'roadmap'
  | 'daily-workout'
  | 'blog';

export const resolveRoute = (hashOrPath: string): ActiveView => {
  if (!hashOrPath) return 'dashboard';
  const clean = hashOrPath.toLowerCase().replace(/^[#/]+/, '').split('?')[0].split('/')[0].trim();

  // 1. Landing & Marketing
  if (clean === '' || clean === 'landing' || clean === 'welcome') return 'landing';

  // 2. Dashboard / Home
  if (clean === 'dashboard' || clean === 'home' || clean === 'app' || clean === 'uy') return 'dashboard';

  // 3. Question Bank
  if (clean === 'qbank' || clean === 'questions' || clean === 'sqb' || clean === 'savollar' || clean === 'practice') return 'questions';

  // 4. Mock Tests & Bluebook (PREVENTS #/bluebook BLANK SCREEN)
  if (
    clean === 'mocks' || 
    clean === 'mock' || 
    clean === 'test' || 
    clean === 'tests' || 
    clean === 'testlar' || 
    clean === 'bluebook' || 
    clean === 'exam' ||
    clean === 'mst'
  ) {
    return 'mocks';
  }

  // 5. SAT Vocabulary
  if (clean === 'vocab' || clean === 'vocabulary' || clean === 'words' || clean === 'lugat' || clean === "lug'at") return 'vocabulary';

  // 6. Mistake Bank
  if (clean === 'mistakes' || clean === 'mistake' || clean === 'errors' || clean === 'xatolar' || clean === 'vault') return 'mistakes';

  // 7. Community & Chat
  if (clean === 'community' || clean === 'chat' || clean === 'hamjamiyat' || clean === 'channels') return 'community';

  // 8. Admin Panel
  if (clean === 'admin' || clean === 'admin-dashboard' || clean === 'management') return 'admin';

  // 9. Profile Settings
  if (clean === 'profile' || clean === 'settings' || clean === 'sozlamalar') return 'profile';

  // 10. Additional Platform Views
  if (clean === 'arena') return 'arena';
  if (clean === 'ai-tutor' || clean === 'tutor') return 'ai-tutor';
  if (clean === 'roadmap') return 'roadmap';
  if (clean === 'daily-workout' || clean === 'workout') return 'daily-workout';
  if (clean === 'blog') return 'blog';

  // SAFE DEFENSIVE FALLBACK (NEVER RETURN NULL OR BLANK)
  return 'dashboard';
};
