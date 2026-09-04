import { supabase } from './supabase';
import { VocabularyBook, VocabularyWord, UserVocabProgress } from '../types';
import { INITIAL_VOCAB_BOOKS, INITIAL_VOCAB_WORDS } from '../data/vocabularyDatabase';

const STORAGE_KEYS = {
  BOOKS: 'asron_vocab_books',
  WORDS: 'asron_vocab_words',
  PROGRESS_PREFIX: 'asron_vocab_progress_',
};

/**
 * Fetch all authoritative vocabulary books
 */
export async function fetchVocabBooks(): Promise<VocabularyBook[]> {
  let books: VocabularyBook[] = INITIAL_VOCAB_BOOKS;

  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.BOOKS);
      if (cached) {
        books = JSON.parse(cached);
      }
    } catch {}
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('vocabulary_books')
        .select('*')
        .order('order_index', { ascending: true });

      if (data && !error && data.length > 0) {
        books = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          slug: d.slug,
          author: d.author,
          description: d.description || '',
          pdfUrl: d.pdf_url || '',
          orderIndex: d.order_index ?? 0,
          isOfficial: d.is_official ?? true,
          coverColor: d.cover_color || '#E07A5F',
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
        }
      }
    }
  } catch (err) {
    console.warn('Notice fetching vocabulary_books from Supabase:', err);
  }

  return books;
}

/**
 * Persist or update a vocabulary book
 */
export async function saveVocabBookRemote(book: VocabularyBook): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchVocabBooks();
      const idx = current.findIndex((b) => b.id === book.id);
      const updated = idx >= 0 ? current.map((b) => (b.id === book.id ? book : b)) : [...current, book];
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updated));
    } catch {}
  }

  try {
    if (supabase) {
      await supabase.from('vocabulary_books').upsert({
        id: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author || '',
        description: book.description,
        pdf_url: book.pdfUrl || '',
        order_index: book.orderIndex,
        is_official: book.isOfficial ?? true,
        cover_color: book.coverColor || '#E07A5F',
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Notice saving vocabulary_book to Supabase:', err);
  }
}

/**
 * Delete a vocabulary book
 */
export async function deleteVocabBookRemote(bookId: string): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchVocabBooks();
      const updated = current.filter((b) => b.id !== bookId);
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updated));
    } catch {}
  }

  try {
    if (supabase) {
      await supabase.from('vocabulary_books').delete().eq('id', bookId);
    }
  } catch (err) {
    console.warn('Notice deleting vocabulary_book from Supabase:', err);
  }
}

/**
 * Fetch vocabulary words (optionally filtered by bookId)
 */
export async function fetchVocabWords(bookId?: string): Promise<VocabularyWord[]> {
  let words: VocabularyWord[] = INITIAL_VOCAB_WORDS;

  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (cached) {
        words = JSON.parse(cached);
      }
    } catch {}
  }

  try {
    if (supabase) {
      let query = supabase.from('vocabulary_words').select('*');
      if (bookId) {
        query = query.eq('book_id', bookId);
      }

      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        const remoteWords: VocabularyWord[] = data.map((d: any) => ({
          id: d.id,
          bookId: d.book_id,
          bookSource: d.book_source,
          word: d.word,
          partOfSpeech: d.part_of_speech,
          phonetic: d.phonetic,
          definition: d.definition,
          definitionUz: d.definition_uz,
          sampleSentence: d.sample_sentence,
          synonyms: d.synonyms || [],
          antonyms: d.antonyms || [],
          difficulty: d.difficulty,
          tone: d.tone,
          etymology: d.etymology,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));

        if (!bookId && typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(remoteWords));
          words = remoteWords;
        } else if (bookId) {
          return remoteWords;
        }
      }
    }
  } catch (err) {
    console.warn('Notice fetching vocabulary_words from Supabase:', err);
  }

  if (bookId) {
    return words.filter((w) => w.bookId === bookId);
  }

  return words;
}

/**
 * Persist or update a single vocabulary word
 */
export async function saveVocabWordRemote(word: VocabularyWord): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchVocabWords();
      const idx = current.findIndex((w) => w.id === word.id);
      const updated = idx >= 0 ? current.map((w) => (w.id === word.id ? word : w)) : [word, ...current];
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(updated));
    } catch {}
  }

  try {
    if (supabase) {
      await supabase.from('vocabulary_words').upsert({
        id: word.id,
        book_id: word.bookId,
        book_source: word.bookSource,
        word: word.word,
        part_of_speech: word.partOfSpeech,
        phonetic: word.phonetic || '',
        definition: word.definition,
        definition_uz: word.definitionUz || '',
        sample_sentence: word.sampleSentence,
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        difficulty: word.difficulty || 'MEDIUM',
        tone: word.tone || 'Neutral',
        etymology: word.etymology || '',
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Notice saving vocabulary_word to Supabase:', err);
  }
}

/**
 * Delete a single vocabulary word
 */
export async function deleteVocabWordRemote(wordId: string): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchVocabWords();
      const updated = current.filter((w) => w.id !== wordId);
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(updated));
    } catch {}
  }

  try {
    if (supabase) {
      await supabase.from('vocabulary_words').delete().eq('id', wordId);
    }
  } catch (err) {
    console.warn('Notice deleting vocabulary_word from Supabase:', err);
  }
}

/**
 * Fast bulk import for vocabulary words
 */
export async function bulkImportVocabWordsRemote(words: VocabularyWord[]): Promise<number> {
  if (!words || words.length === 0) return 0;

  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchVocabWords();
      const existingIds = new Set(current.map((w) => w.id));
      const fresh = words.filter((w) => !existingIds.has(w.id));
      const updated = [...fresh, ...current];
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(updated));
    } catch {}
  }

  try {
    if (supabase) {
      const payload = words.map((w) => ({
        id: w.id,
        book_id: w.bookId,
        book_source: w.bookSource,
        word: w.word,
        part_of_speech: w.partOfSpeech,
        phonetic: w.phonetic || '',
        definition: w.definition,
        definition_uz: w.definitionUz || '',
        sample_sentence: w.sampleSentence,
        synonyms: w.synonyms || [],
        antonyms: w.antonyms || [],
        difficulty: w.difficulty || 'MEDIUM',
        tone: w.tone || 'Neutral',
        etymology: w.etymology || '',
      }));

      await supabase.from('vocabulary_words').upsert(payload, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('Notice during bulk import of vocabulary_words:', err);
  }

  return words.length;
}

/**
 * Fetch student vocabulary progress map
 */
export async function fetchUserVocabProgress(userId: string): Promise<Record<string, UserVocabProgress>> {
  const result: Record<string, UserVocabProgress> = {};
  if (!userId) return result;

  const storageKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${userId}`;
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('user_vocab_progress')
        .select('*')
        .eq('user_id', userId);

      if (data && !error) {
        data.forEach((d: any) => {
          result[d.word_id] = {
            id: d.id,
            userId: d.user_id,
            wordId: d.word_id,
            srsStage: d.srs_stage ?? 0,
            isKnown: d.is_known ?? false,
            correctCount: d.correct_count ?? 0,
            incorrectCount: d.incorrect_count ?? 0,
            lastReviewedAt: d.last_reviewed_at,
          };
        });

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(result));
        }
      }
    }
  } catch (err) {
    console.warn('Notice fetching user_vocab_progress from Supabase:', err);
  }

  return result;
}

/**
 * Save / Update student progress on a word
 */
export async function saveUserVocabProgressRemote(
  userId: string,
  wordId: string,
  srsStage: number,
  isKnown: boolean
): Promise<void> {
  if (!userId || !wordId) return;

  const storageKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${userId}`;
  const now = new Date().toISOString();

  if (typeof localStorage !== 'undefined') {
    try {
      const current = await fetchUserVocabProgress(userId);
      const existing = current[wordId];
      current[wordId] = {
        id: existing?.id || `prog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId,
        wordId,
        srsStage,
        isKnown,
        correctCount: isKnown ? (existing?.correctCount || 0) + 1 : existing?.correctCount || 0,
        incorrectCount: !isKnown ? (existing?.incorrectCount || 0) + 1 : existing?.incorrectCount || 0,
        lastReviewedAt: now,
      };
      localStorage.setItem(storageKey, JSON.stringify(current));
    } catch {}
  }

  try {
    if (supabase) {
      await supabase.from('user_vocab_progress').upsert(
        {
          user_id: userId,
          word_id: wordId,
          srs_stage: srsStage,
          is_known: isKnown,
          last_reviewed_at: now,
        },
        { onConflict: 'user_id,word_id' }
      );
    }
  } catch (err) {
    console.warn('Notice saving user_vocab_progress to Supabase:', err);
  }
}
