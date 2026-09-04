-- =========================================================
-- ASRON SAT: SAT Lug'at (Vocabulary Engine) Database Schema
-- Migration: 20260904_vocabulary_engine_schema.sql
-- =========================================================

-- 1. Vocabulary Books Table
CREATE TABLE IF NOT EXISTS public.vocabulary_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT,
  description TEXT,
  pdf_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_official BOOLEAN NOT NULL DEFAULT true,
  cover_color TEXT DEFAULT '#E07A5F',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Vocabulary Words Table
CREATE TABLE IF NOT EXISTS public.vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.vocabulary_books(id) ON DELETE CASCADE,
  book_source TEXT NOT NULL,
  word TEXT NOT NULL,
  part_of_speech TEXT NOT NULL DEFAULT 'adj.',
  phonetic TEXT,
  definition TEXT NOT NULL,
  definition_uz TEXT NOT NULL,
  sample_sentence TEXT NOT NULL,
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  antonyms TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
  tone TEXT DEFAULT 'Neutral',
  etymology TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_vocab_words_book_id ON public.vocabulary_words(book_id);
CREATE INDEX IF NOT EXISTS idx_vocab_words_word ON public.vocabulary_words(word);
CREATE INDEX IF NOT EXISTS idx_vocab_books_slug ON public.vocabulary_books(slug);

-- 3. Student Vocab Progress Table (Strict 0-State Spaced Repetition)
CREATE TABLE IF NOT EXISTS public.user_vocab_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  word_id UUID REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  srs_stage INT NOT NULL DEFAULT 0, -- 0: New, 1: Learning, 2: Review, 3: Mastered
  is_known BOOLEAN NOT NULL DEFAULT false,
  correct_count INT NOT NULL DEFAULT 0,
  incorrect_count INT NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_user_id ON public.user_vocab_progress(user_id);

-- 4. Enable Row Level Security
ALTER TABLE public.vocabulary_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocab_progress ENABLE ROW LEVEL SECURITY;

-- RLS: Public reading for authenticated & guest users
DROP POLICY IF EXISTS "Public can view vocabulary books" ON public.vocabulary_books;
CREATE POLICY "Public can view vocabulary books"
  ON public.vocabulary_books FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view vocabulary words" ON public.vocabulary_words;
CREATE POLICY "Public can view vocabulary words"
  ON public.vocabulary_words FOR SELECT
  USING (true);

-- RLS: Progress records managed strictly by the user
DROP POLICY IF EXISTS "Users can view and manage their own vocab progress" ON public.user_vocab_progress;
CREATE POLICY "Users can view and manage their own vocab progress"
  ON public.user_vocab_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS: Admins have full access to books and words
DROP POLICY IF EXISTS "Admins manage vocabulary books" ON public.vocabulary_books;
CREATE POLICY "Admins manage vocabulary books"
  ON public.vocabulary_books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admins manage vocabulary words" ON public.vocabulary_words;
CREATE POLICY "Admins manage vocabulary words"
  ON public.vocabulary_words FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 5. Seed Initial Authoritative SAT Books
INSERT INTO public.vocabulary_books (id, title, slug, author, description, pdf_url, order_index, is_official, cover_color)
VALUES
  (
    'a1111111-b001-4000-8000-000000000001',
    'Erica Meltzer SAT Vocabulary',
    'erica-meltzer',
    'Erica L. Meltzer',
    'Digital SAT Reading & Writing bo''limida eng ko''p uchraydigan akademik va kontekstual so''zlar to''plami.',
    '/assets/books/erica-meltzer-sat-vocabulary.pdf',
    1,
    true,
    '#E07A5F'
  ),
  (
    'a2222222-b002-4000-8000-000000000002',
    'College Board Essential Words',
    'college-board',
    'College Board Official',
    'Rasmiy Bluebook testlari va haqiqiy imtihonlarda eng yuqori chastota bilan tushadigan kalit so''zlar bazasi.',
    '/assets/books/college-board-essential-words.pdf',
    2,
    true,
    '#2A9D8F'
  ),
  (
    'a3333333-b003-4000-8000-000000000003',
    'Barron''s SAT 1100',
    'barrons-1100',
    'Barron''s Educational Series',
    '1500+ ball nishoniga ega o''quvchilar uchun yuqori darajadagi murakkab akademik va falsafiy leksika.',
    '/assets/books/barrons-sat-1100.pdf',
    3,
    true,
    '#3D405B'
  ),
  (
    'a4444444-b004-4000-8000-000000000004',
    'Maxsus Kurs So''zlari',
    'maxsus-kurs',
    'ASRON SAT Academic Team',
    'ASRON SAT maxsus o''quv dasturi va saralangan topshiriqlar asosida tuzilgan eksklyuziv so''zlar ombori.',
    '/assets/books/asron-sat-exclusive-vocabulary.pdf',
    4,
    true,
    '#E76F51'
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  description = EXCLUDED.description,
  pdf_url = EXCLUDED.pdf_url,
  order_index = EXCLUDED.order_index;
