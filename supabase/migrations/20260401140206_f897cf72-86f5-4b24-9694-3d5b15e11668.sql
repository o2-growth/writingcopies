
CREATE TABLE public.formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  value text NOT NULL,
  prompt_instructions text NOT NULL DEFAULT '',
  channels text[] DEFAULT NULL,
  has_script_output boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.formats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own formats" ON public.formats FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own formats" ON public.formats FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own formats" ON public.formats FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own formats" ON public.formats FOR DELETE USING (owner_id = auth.uid());
