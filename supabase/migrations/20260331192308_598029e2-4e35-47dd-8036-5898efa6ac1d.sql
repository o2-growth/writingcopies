
-- Create champion_examples table
CREATE TABLE public.champion_examples (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  editorial_line_id uuid REFERENCES public.editorial_lines(id) ON DELETE CASCADE,
  body text NOT NULL,
  format text NOT NULL,
  channel text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exactly_one_parent CHECK (
    (product_id IS NOT NULL AND editorial_line_id IS NULL) OR
    (product_id IS NULL AND editorial_line_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.champion_examples ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own champion examples"
  ON public.champion_examples FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own champion examples"
  ON public.champion_examples FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own champion examples"
  ON public.champion_examples FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own champion examples"
  ON public.champion_examples FOR DELETE
  USING (owner_id = auth.uid());

-- Drop old text columns
ALTER TABLE public.products DROP COLUMN IF EXISTS best_ads;
ALTER TABLE public.editorial_lines DROP COLUMN IF EXISTS champion_examples;
