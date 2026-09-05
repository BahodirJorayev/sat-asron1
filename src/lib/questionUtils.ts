import { Question, SectionType, Difficulty, QuestionType } from '../types';
import { supabase } from './supabase';

export interface NormalizedOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
  imageUrl?: string | null;
}

/**
 * Normalizes any question options representation (object map, string array, or object array)
 * into a standard, safe array of NormalizedOption.
 * Strictly prevents runtime TypeError crashes like "options.map is not a function" or "options is not iterable".
 */
export function normalizeQuestionOptions(options: any): NormalizedOption[] {
  if (!options) return [];

  // Case 1: Standard Array
  if (Array.isArray(options)) {
    return options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      if (typeof opt === 'string') {
        return { id: letter, text: opt };
      }
      if (typeof opt === 'object' && opt !== null) {
        return {
          id: opt.id || opt.key || letter,
          text: opt.text || opt.content || opt.value || opt.label || '',
          imageUrl: opt.image_url || opt.imageUrl || null,
        };
      }
      return { id: letter, text: String(opt || '') };
    });
  }

  // Case 2: Object Map e.g. { A: "...", B: "...", C: "...", D: "..." }
  if (typeof options === 'object' && options !== null) {
    const defaultKeys = ['A', 'B', 'C', 'D'];
    const objectKeys = Object.keys(options);
    const keysToUse = objectKeys.length > 0 ? objectKeys : defaultKeys;

    return keysToUse.map((key, idx) => {
      const val = options[key];
      const letter = key.length === 1 ? key.toUpperCase() : String.fromCharCode(65 + idx);

      if (typeof val === 'string') {
        return { id: letter, text: val };
      }
      if (typeof val === 'object' && val !== null) {
        return {
          id: val.id || letter,
          text: val.text || val.content || '',
          imageUrl: val.image_url || val.imageUrl || null,
        };
      }
      return { id: letter, text: val ? String(val) : '' };
    });
  }

  return [];
}

/**
 * Safely extracts question stem/prompt across all schema variants
 */
export function safeStem(question?: Partial<Question> | any): string {
  if (!question) return '';
  return question.stem || question.questionText || question.prompt || '';
}

/**
 * Safely extracts reading passage
 */
export function safePassage(question?: Partial<Question> | any): string {
  if (!question) return '';
  return question.passage || '';
}

/**
 * Safely extracts explanation
 */
export function safeExplanation(question?: Partial<Question> | any): string {
  if (!question) return '';
  return question.explanation || '';
}

/**
 * Upload problem image or pasted screenshot to Supabase Storage 'sat-questions' bucket.
 * Includes base64 and object URL fallbacks for zero data loss.
 */
export async function uploadQuestionImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name ? file.name.split('.').pop() || 'png' : 'png';
    const fileName = `q-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `diagrams/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('sat-questions')
      .upload(filePath, file, { upsert: true, contentType: file.type || 'image/png' });

    if (uploadError) {
      console.warn('Supabase sat-questions upload notice, using base64 fallback:', uploadError.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result as string, error: null });
        };
        reader.onerror = (err) => {
          resolve({ url: URL.createObjectURL(file), error: err });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage.from('sat-questions').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string, error: null });
      };
      reader.onerror = () => {
        resolve({ url: URL.createObjectURL(file), error: null });
      };
      reader.readAsDataURL(file);
    });
  }
}
