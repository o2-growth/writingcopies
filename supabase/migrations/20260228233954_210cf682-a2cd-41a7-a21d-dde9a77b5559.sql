CREATE TABLE public.copy_champions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL,
  copy_id uuid NOT NULL REFERENCES public.approved_copies(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  channel text NOT NULL,
  format text NOT NULL,
  champion_at timestamptz NOT NULL DEFAULT now(),
  replaced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.copy_champions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own champions" ON public.copy_champions FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own champions" ON public.copy_champions FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own champions" ON public.copy_champions FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own champions" ON public.copy_champions FOR DELETE USING (owner_id = auth.uid());