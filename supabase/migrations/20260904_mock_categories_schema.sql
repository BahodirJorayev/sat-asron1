-- Mock Test Kategoriyalari jadvali
CREATE TABLE IF NOT EXISTS public.mock_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mock testlar jadvaliga category_id qo'shish
ALTER TABLE public.mock_tests 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.mock_categories(id) ON DELETE SET NULL;

-- Dastlabki standart toifalarni kiritish
INSERT INTO public.mock_categories (id, name, slug, order_index, description) VALUES
('11111111-c001-4000-8000-000000000001', 'Rasmiy Bluebook Testlari', 'official-bluebook', 1, 'Rasmiy College Board formati va adaptiv MST tizimidagi to''liq mock testlar.'),
('22222222-c002-4000-8000-000000000002', 'Maxsus Kurs Mocklari', 'private-course', 2, 'Faqat maxsus kurs talabalari uchun kod orqali ochiladigan eksklyuziv testlar.'),
('33333333-c003-4000-8000-000000000003', 'Diagnostik Testlar', 'diagnostic', 3, 'Talabaning kuchli va zaif tomonlarini aniqlashga mo''ljallangan diagnostik testlar.')
ON CONFLICT (slug) DO NOTHING;

-- RLS Qoidalari
ALTER TABLE public.mock_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read mock categories" ON public.mock_categories;
CREATE POLICY "Public read mock categories" ON public.mock_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage mock categories" ON public.mock_categories;
CREATE POLICY "Admin manage mock categories" ON public.mock_categories FOR ALL USING (true);
