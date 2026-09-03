// Direct Gemini Socratic AI Tutor Engine for ASRON SAT
import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Error initializing GoogleGenAI client:', err);
    return null;
  }
}

export const SOCRATIC_SYSTEM_PROMPT = `Siz ASRON SAT platformasining Sokratik AI Repetitorisiz (ASRON Socratic AI Tutor).
O'zingiz haqingizda so'ralganda aynan shunday javob berasiz: "Men sizning ASRON SAT Sokratik repetitoringizman."

QAT'IY QOIDALAR:
1. SOKRATIK METOD: Hech qachon to'g'ridan-to'g'ri yakuniy to'g'ri javob harfini darhol bermang. Talabaning o'zi fikrlab topishiga yo'l ko'rsating.
2. TUZILMA:
   - 1-Qadam: Talaba xatosini yoki tushunmagan joyini aniqlang (Diagnose error).
   - 2-Qadam: Noto'g'ri bo'lgan 2 ta variantni mantiqan chiqarib tashlash qoidasini ko'rsating (Eliminate 2 wrong choices).
   - 3-Qadam: Talabaga to'g'ri yo'lni ochib beruvchi 1 ta aniq savol bering (Ask 1 guiding question).
3. MATEMATIKA VA FORMULALAR: Barcha formulalar va o'zgaruvchilarni qat'iy LaTeX formatida yozing ($inline$ yoki $$display$$). Agar mos kelsa, Desmosda 20 soniyada yechish formulasi yoki trickini ko'rsating.
4. READING & WRITING: Rasmiy College Board grammatika qoidalarini aniq tushuntiring (independent/dependent clauses, comma splices, restrictive modifiers, transition logic).
5. USLUB: Hech qanday emoji (🤖, 🚀, 🔥, ✨, 💡, 🧠) va bolalarcha sun'iy intellekt maqtovlari ishlatmang. Qat'iy professional, qisqa, aniq va akademik ohangda javob bering.`;

export async function querySocraticTutor({
  question,
  userMessage,
  userWrongAnswer,
  chatHistory = [],
}: {
  question?: any;
  userMessage: string;
  userWrongAnswer?: string;
  chatHistory?: Array<{ role: 'user' | 'model'; text: string }>;
}): Promise<{ reply: string; isFallback?: boolean }> {
  const ai = getGeminiClient();

  const domain = question?.domain || 'Digital SAT Skill';
  const skill = question?.skill || 'Problem Solving';
  const passage = question?.passage || '';
  const qText = question?.questionText || '';
  const options = question?.options ? JSON.stringify(question?.options) : '';
  const wrongContext = userWrongAnswer ? `Talaba tanlagan noto'g'ri javob: Choice ${userWrongAnswer}.` : '';

  if (!ai) {
    const isRW = question?.section === 'READING_AND_WRITING';
    const fallback = isRW
      ? `Keling, ushbu **${skill}** savolini birgalikda tahlil qilamiz:\n\n1. **Qoida tahlili:** Nuqtalar o'rnidan oldingi va keyingi qismlarni mustaqil gap (independent clause) ekanligini tekshiring.\n2. **Variantlarni qisqartirish:** Mazmunga bog'liq bo'lmagan sabab-oqibat bog'lovchilarini chiqarib tashlang.\n3. **Yo'naltiruvchi savol:** Vergul va bog'lovchi ($FANBOYS$) orasidagi bog'liqlik haqida nima deya olasiz?`
      : `Ushbu **${skill}** masalasini tahlil qilaylik:\n\n1. **Berilgan shart:** Tenglamadagi asosiy invariantni aniqlang.\n2. **Desmos usuli:** Tenglamaning ikkala qismini alohida $y = f(x)$ va $y = g(x)$ deb kiritib, kesishish nuqtasini topish mumkin.\n3. **Yo'naltiruvchi savol:** Noma'lum hadni ajratib olganingizda, qanday kvadratik ko'rinish hosil bo'ladi?`;
    return { reply: fallback, isFallback: true };
  }

  const models = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.0-flash'];

  const prompt = `
Savol konteksti:
- Domen: ${domain}
- Ko'nikma (Skill): ${skill}
- Matn (Passage): ${passage || 'Mavjud emas'}
- Savol matni: ${qText}
- Variantlar: ${options}
${wrongContext}

Suhbat tarixi:
${JSON.stringify(chatHistory, null, 2)}

Talabaning so'rovi: "${userMessage}"

Sokratik usulda, 3 bosqichli professional tahlil bilan yo'naltiring:`;

  for (const modelName of models) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: SOCRATIC_SYSTEM_PROMPT,
          temperature: 0.6,
        },
      });

      if (response?.text) {
        return { reply: response.text };
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} call failed, trying next fallback:`, err?.message);
    }
  }

  return {
    reply: `Keling, ushbu **${skill}** savolini ko'rib chiqaylik:\n\n1. **Asosiy qoida:** ${skill} bo'yicha berilgan shartni ko'rib chiqing.\n2. **Mantiqiy tahlil:** Qaysi ikkita variant grammatika yoki tenglama shartiga zid keladi?\n3. **Savol:** Ushbu ikki variantni chiqarib tashlagach, qolgan ikkitasining farqi nimada deb o'ylaysiz?`,
    isFallback: true,
  };
}
