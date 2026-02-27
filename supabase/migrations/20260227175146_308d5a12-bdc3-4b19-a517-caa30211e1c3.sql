
-- A) company_settings
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  brand_voice text NOT NULL,
  audience text,
  usp text,
  claims_allowed text,
  disclaimers text,
  language text DEFAULT 'pt-BR',
  updated_at timestamptz DEFAULT now()
);

-- B) products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  benefits text,
  features text,
  objections text,
  pricing_notes text,
  links text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- C) copywriters
CREATE TABLE public.copywriters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_preset boolean NOT NULL DEFAULT true,
  name text NOT NULL UNIQUE,
  era text,
  notes text,
  style_guide_text text NOT NULL,
  dos text,
  donts text
);

-- D) copywriter_samples
CREATE TABLE public.copywriter_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copywriter_id uuid NOT NULL REFERENCES public.copywriters(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL,
  source text,
  created_at timestamptz DEFAULT now()
);

-- E) copywriter_preferences
CREATE TABLE public.copywriter_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  copywriter_id uuid NOT NULL REFERENCES public.copywriters(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(owner_id, copywriter_id)
);

-- F) generations
CREATE TABLE public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  copywriter_a_id uuid REFERENCES public.copywriters(id) ON DELETE SET NULL,
  copywriter_b_id uuid REFERENCES public.copywriters(id) ON DELETE SET NULL,
  channel text NOT NULL,
  objective text NOT NULL,
  copy_type text NOT NULL,
  size text NOT NULL,
  quantity int NOT NULL,
  prompt_compiled text NOT NULL,
  result_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- G) approved_copies
CREATE TABLE public.approved_copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  generation_id uuid REFERENCES public.generations(id) ON DELETE SET NULL,
  title text,
  body text NOT NULL,
  channel text NOT NULL,
  objective text NOT NULL,
  copy_type text NOT NULL,
  size text NOT NULL,
  copywriter_a_id uuid REFERENCES public.copywriters(id) ON DELETE SET NULL,
  copywriter_b_id uuid REFERENCES public.copywriters(id) ON DELETE SET NULL,
  tags text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_products_owner ON public.products(owner_id);
CREATE INDEX idx_generations_owner_date ON public.generations(owner_id, created_at DESC);
CREATE INDEX idx_approved_copies_owner_date ON public.approved_copies(owner_id, created_at DESC);
CREATE INDEX idx_copywriter_prefs_owner ON public.copywriter_preferences(owner_id);

-- RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copywriter_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copywriters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copywriter_samples ENABLE ROW LEVEL SECURITY;

-- company_settings policies
CREATE POLICY "Users can view own company" ON public.company_settings FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own company" ON public.company_settings FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own company" ON public.company_settings FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own company" ON public.company_settings FOR DELETE USING (owner_id = auth.uid());

-- products policies
CREATE POLICY "Users can view own products" ON public.products FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own products" ON public.products FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE USING (owner_id = auth.uid());

-- copywriter_preferences policies
CREATE POLICY "Users can view own prefs" ON public.copywriter_preferences FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own prefs" ON public.copywriter_preferences FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own prefs" ON public.copywriter_preferences FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own prefs" ON public.copywriter_preferences FOR DELETE USING (owner_id = auth.uid());

-- generations policies
CREATE POLICY "Users can view own generations" ON public.generations FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own generations" ON public.generations FOR INSERT WITH CHECK (owner_id = auth.uid());

-- approved_copies policies
CREATE POLICY "Users can view own approved" ON public.approved_copies FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own approved" ON public.approved_copies FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own approved" ON public.approved_copies FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own approved" ON public.approved_copies FOR DELETE USING (owner_id = auth.uid());

-- copywriters: read-only for all authenticated users
CREATE POLICY "Anyone can read copywriters" ON public.copywriters FOR SELECT USING (true);

-- copywriter_samples: read-only for all authenticated users
CREATE POLICY "Anyone can read samples" ON public.copywriter_samples FOR SELECT USING (true);
