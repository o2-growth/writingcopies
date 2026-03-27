CREATE TABLE public.editorial_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  objective text,
  content_style text,
  champion_examples text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.editorial_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own editorial lines" ON public.editorial_lines FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own editorial lines" ON public.editorial_lines FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own editorial lines" ON public.editorial_lines FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own editorial lines" ON public.editorial_lines FOR DELETE USING (owner_id = auth.uid());