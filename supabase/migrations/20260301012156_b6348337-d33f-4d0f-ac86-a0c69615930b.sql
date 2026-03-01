ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS format text
    CHECK (format IN ('video', 'static'));

ALTER TABLE public.approved_copies
  ADD COLUMN IF NOT EXISTS format text
    CHECK (format IN ('video', 'static'));

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS champion_video_copy   text,
  ADD COLUMN IF NOT EXISTS champion_video_url    text,
  ADD COLUMN IF NOT EXISTS champion_static_copy  text,
  ADD COLUMN IF NOT EXISTS champion_static_url   text;

CREATE INDEX IF NOT EXISTS idx_approved_copies_format
  ON public.approved_copies(owner_id, format)
  WHERE format IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_generations_format
  ON public.generations(owner_id, format)
  WHERE format IS NOT NULL;