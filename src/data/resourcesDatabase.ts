import { PlatformResource } from '../types';

export const INITIAL_PLATFORM_RESOURCES: PlatformResource[] = [
  // =========================================================================
  // 1. 📚 ARTICLES & GUIDES (Maqolalar & Qo'llanmalar)
  // =========================================================================
  {
    id: 'res-art-01',
    title: 'IELTS Reading: True / False / Not Given Tuzoqlarini Bartaraf Qilish',
    category: 'ARTICLES',
    examTag: 'IELTS',
    description: "IELTS imtihonida talabalar eng ko'p adashadigan Not Given va False o'rtasidagi chegara, kontekstual parafrazalash va 3 bosqichli tekshiruv usuli.",
    contentMarkdown: `
# IELTS Reading: True / False / Not Given Qoidasi

IELTS Reading bo'limida 13-14 ta savol aynan **True / False / Not Given** yoki **Yes / No / Not Given** shaklida beriladi.

### Eng Katta Xato:
- **False**: Matndagi fakt berilgan gapdagi faktga to'g'ridan-to'g'ri zid (qarama-qarshi).
- **Not Given**: Matnda bu mavzu haqida gapirilgan bo'lishi mumkin, lekin savoldagi da'voni isbotlash yoki rad etish uchun ma'lumot yetarli emas.

### 3 Bosqichli Yechish Algoritmi:
1. **Kalit so'zlarni ajrating** (O'zgarmas otlar, sanalar, joy nomlari).
2. **Kvalifikatorlarga (Qualifiers) e'tibor bering**: *always, sometimes, all, mainly, unlikely*. Bu so'zlar ma'noni 180 gradusga o'zgartiradi.
3. **Faktni tekshiring**: Matnda aynan shu fikr tasdiqlanganmi yoki taxmin qilyapsizmi? Agar siz bilgan hayotiy haqiqat matnda yo'q bo'lsa — bu **Not Given**!
`,
    pdfDownloadUrl: 'https://cdn.asronsat.uz/resources/ielts-reading-tfng-guide.pdf',
    pdfSizeBytes: '1.8 MB',
    author: 'ASRON IELTS Bo\'limi',
    orderIndex: 1,
    isPublished: true,
    tags: ['Reading', 'T/F/NG', 'Band 8+'],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'res-art-02',
    title: 'Digital SAT Reading: Dual-Passage Synthesis va Qiyosiy Tahlil',
    category: 'ARTICLES',
    examTag: 'SAT',
    description: "Ikki muallifning qarama-qarshi pozitsiyalarini sintez qilish, 60 soniyada umumiy nuqtalarni topish va Bluebook Module 2 Hard strategiyasi.",
    contentMarkdown: `
# Digital SAT: Dual-Passage Savollarini Yechish

Digital SAT Reading & Writing modulida har bir modulda 1-2 ta **Dual Passage** (Passage 1 va Passage 2) savoli uchraydi.

### Savol Turlari:
1. *Based on the texts, how would Author 2 respond to Author 1's claim about X?*
2. *Both authors would most likely agree on which aspect of Y?*

### Yechish Qadami:
- **1-matnni o'qing**: Muallifning asosiy g'oyasini (+ / - / neytral) bir so'z bilan belgilang.
- **2-matnni o'qing**: 2-muallif 1-muallifga qo'shiladimi, uning qaysidir qismini rad etadimi yoki unga yangi dalil qo'shadimi?
- **Variantlarni tahlil qiling**: Ikkala matnda ham aniq aytilmagan umumlashtiruvchi javoblarni (extreme generalizations) darhol chiqarib tashlang.
`,
    pdfDownloadUrl: 'https://cdn.asronsat.uz/resources/sat-dual-passage-mastery.pdf',
    pdfSizeBytes: '2.4 MB',
    author: 'SAT Research Team',
    orderIndex: 2,
    isPublished: true,
    tags: ['SAT Reading', 'Dual Passage', 'Module 2 Hard'],
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'res-art-03',
    title: 'IELTS Writing Task 2: Band 8.0 Essay Struktura va Koheziya',
    category: 'ARTICLES',
    examTag: 'IELTS',
    description: "4 paragrafli mukammal insho arxitekturasi: Kirish, 2 ta asosiy tana paragrafi, xulosa va akademik bog'lovchilar to'plami.",
    contentMarkdown: `
# IELTS Writing Task 2: Band 8.0 Standarti

Writing bo'limida 250+ so'zli insho umumiy Writing balining 66% qismini tashkil qiladi.

### 4 Bosqichli Arxitektura:
- **Introduction (2-3 gap)**:
  - Gap 1: Savolni parafrazalash (General background).
  - Gap 2: Thesis statement (Sizning pozitsiyangiz).
  - Gap 3: Outline sentence (Asosiy 2 argument).
- **Body 1 (4-5 gap)**:
  - Topic sentence (Birinchi asosiy sabab).
  - Explanation (Nima uchun bu shunday?).
  - Real-world example (Aniq dalil yoki ilmiy tadqiqot).
  - Concluding sentence / Result.
- **Body 2 (4-5 gap)**:
  - Ikkinchi asosiy sabab va taqqoslash.
- **Conclusion (2 gap)**:
  - Pozitsiyani qayta ta'kidlash va kelajakdagi xulosa.
`,
    pdfDownloadUrl: 'https://cdn.asronsat.uz/resources/ielts-band8-writing-templates.pdf',
    pdfSizeBytes: '3.1 MB',
    author: 'Senior IELTS Examiner',
    orderIndex: 3,
    isPublished: true,
    tags: ['Writing Task 2', 'Templates', 'Band 8.0'],
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },

  // =========================================================================
  // 2. 🎙️ PODCASTS & AUDIO (Podkastlar & Audio Tahlillar)
  // =========================================================================
  {
    id: 'res-pod-01',
    title: 'ASRON Audio #1: Band 8.5 Speaking Fluency va Tabiiy Idiomalar',
    category: 'PODCASTS',
    examTag: 'IELTS',
    description: "IELTS Speaking imtihonida sun'iy yodlangan so'zlardan qochish, intonatsiya va Part 2 hikoya qilish texnikasi bo'yicha 20 daqiqalik master-audio.",
    mediaUrl: 'https://cdn.asronsat.uz/audio/asron-speaking-mastery.mp3',
    durationMinutes: 22,
    author: 'Jahongir Rahimov (IELTS 8.5)',
    orderIndex: 4,
    isPublished: true,
    tags: ['Speaking', 'Audio Podcast', 'Fluency'],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'res-pod-02',
    title: 'SAT Talks: 1550+ Balldagi Talabalar Vaqtni Qanday Taqsimlaydi?',
    category: 'PODCASTS',
    examTag: 'SAT',
    description: "Reading & Writing 32 daqiqada 27 savol va Math 35 daqiqada 22 savolni hal qilish ritmi va psixologik charchoqni yengish audiosi.",
    mediaUrl: 'https://cdn.asronsat.uz/audio/sat-time-strategy.mp3',
    durationMinutes: 18,
    author: 'SAT 1580 Club',
    orderIndex: 5,
    isPublished: true,
    tags: ['Time Management', 'SAT Strategy', 'Podcast'],
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'res-pod-03',
    title: 'IELTS Listening Section 4: Akademik Ma\'ruza va Konspekt Qilish',
    category: 'PODCASTS',
    examTag: 'IELTS',
    description: "Section 4 audio tezligiga yetib olish, ko'p so'zli bo'shliqlarni to'ldirish va bir vaqtning o'zida tinglab yozish sirlari.",
    mediaUrl: 'https://cdn.asronsat.uz/audio/listening-sec4-drill.mp3',
    durationMinutes: 25,
    author: 'IELTS Listening Lead',
    orderIndex: 6,
    isPublished: true,
    tags: ['Listening', 'Section 4', 'Note-Taking'],
    createdAt: '2026-02-25T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },

  // =========================================================================
  // 3. 🎬 VIDEOS & MASTERCLASSES (Video Darslar)
  // =========================================================================
  {
    id: 'res-vid-01',
    title: 'Masterclass: IELTS Parafrazalash va Leksik Boylik (Band 7.5+)',
    category: 'VIDEOS',
    examTag: 'IELTS',
    description: "Oddiy so'zlarni akademik sinonimlarga aylantirish, kollokatsiyalarni tabiiy ishlatish va imtihonchiga taassurot qoldirish videodarsi.",
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // responsive embed
    durationMinutes: 34,
    author: 'Cambridge Certified Trainer',
    orderIndex: 7,
    isPublished: true,
    tags: ['Video Masterclass', 'Lexical Resource', 'IELTS 7.5+'],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-08T00:00:00Z',
  },
  {
    id: 'res-vid-02',
    title: 'Desmos Speedrun: 20 Sekundda Eng Murakkab SAT Math Savollari',
    category: 'VIDEOS',
    examTag: 'SAT',
    description: "Tenglamalar sistemasi, kvadratik funksiyalar va regressiya parametrlarini Desmos orqali qalam tekkizmasdan yechish video kursi.",
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationMinutes: 42,
    author: 'ASRON Math Master',
    orderIndex: 8,
    isPublished: true,
    tags: ['SAT Math', 'Desmos Hacks', 'Speedrun'],
    createdAt: '2026-03-03T00:00:00Z',
    updatedAt: '2026-03-08T00:00:00Z',
  },

  // =========================================================================
  // 4. 🧠 ROADMAPS & STRATEGY (Metodikalar & Yo'l Xaritasi)
  // =========================================================================
  {
    id: 'res-rdm-01',
    title: '30-Kunlik Intensiv IELTS Band 7.5 Yo\'l Xaritasi (To\'liq Reja)',
    category: 'ROADMAP',
    examTag: 'IELTS',
    description: "Kundalik 3 soatlik reja: Listening ertalabki sprint, Reading kunduzgi tahlil, Writing haftalik 3 insho va har 4 kunda to'liq mock.",
    contentMarkdown: `
# 30-Kunlik Intensiv IELTS Band 7.5 Rejasi

### 1-Hafta: Baza va Diagnostika
- **1-kun**: Cambridge 18 Test 1 Diagnostik to'liq imtihon. Xatolar daftarchasini ochish.
- **2-4 kun**: Reading T/F/NG va Headings bo'yicha 100 ta savol tahlili.
- **5-7 kun**: Listening Section 1 va 2 bo'yicha imlo xatolarini (spelling) 0 ga tushirish.

### 2-Hafta: Writing Task 1 & 2 Kuchaytirish
- **8-10 kun**: Bar chart, Line graph, Map va Process yozish shablonlarini o'zlashtirish.
- **11-14 kun**: Opinion va Discussion insholarini 40 daqiqada yozish mashg'uloti.

### 3-Hafta: Speaking va Section 3-4 Sprint
- Har kuni 15 daqiqa Part 2 kartochkalari bo'yicha audio yozish va qayta tinglash.
- Har 2 kunda 1 ta yangi Cambridge Listening Section 4.

### 4-Hafta: Rasmiy Sharoitdagi Mocklar
- Kunora to'liq 3 soatlik imtihon (9:00 dan 12:00 gacha).
- Zaif nuqtalarni takrorlash va ruhiy tayyorgarlik.
`,
    pdfDownloadUrl: 'https://cdn.asronsat.uz/resources/ielts-30day-roadmap.pdf',
    pdfSizeBytes: '4.2 MB',
    author: 'ASRON Metodika Kengashi',
    orderIndex: 9,
    isPublished: true,
    tags: ['Roadmap', '30-Days', 'Band 7.5', 'PDF Schedule'],
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'res-rdm-02',
    title: 'SAT 1550+ 60-Kunlik Strategik O\'quv Xaritasi (College Board Mos)',
    category: 'ROADMAP',
    examTag: 'SAT',
    description: "Rasmiy College Board Bluebook algoritmlariga asoslangan 8 haftalik bosqichma-bosqich o'sish xaritasi va Desmos integratsiyasi.",
    contentMarkdown: `
# SAT 1550+ 60-Kunlik Strategiya

### 1-2 Hafta: Math Foundations & Desmos
- Chiziqli va kvadratik tenglamalarni Desmos yordamida 20 soniyada yechish.
- Geometriya va trigonometriya formulalari.

### 3-4 Hafta: Reading & Writing Punctuation & Logic
- Vergul, nuqtali vergul va tire qoidalarini avtomatik darajaga yetkazish.
- Transition words va rhetoric synthesis savollari.

### 5-8 Hafta: Adaptive MST Stage 2 Hard Training
- Faqat Hard savollar bankidan (SQB) kuniga 30 ta savol yechish.
- Haftasiga 2 ta rasmiy Bluebook mock testi.
`,
    pdfDownloadUrl: 'https://cdn.asronsat.uz/resources/sat-60day-1550-roadmap.pdf',
    pdfSizeBytes: '5.0 MB',
    author: 'ASRON SAT Architects',
    orderIndex: 10,
    isPublished: true,
    tags: ['SAT Roadmap', '60-Days', '1550+ Club', 'PDF'],
    createdAt: '2026-03-07T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
];
