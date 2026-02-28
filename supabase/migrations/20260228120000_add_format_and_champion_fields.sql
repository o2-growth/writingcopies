-- Migration: Add format field and champion copy fields
-- Features: #1 (company champion copies), #5+6 (format for champion system)

-- 1. Add `format` column to generations (video | static | null)
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS format text
    CHECK (format IN ('video', 'static'));

-- 2. Add `format` column to approved_copies
ALTER TABLE public.approved_copies
  ADD COLUMN IF NOT EXISTS format text
    CHECK (format IN ('video', 'static'));

-- 3. Add champion copy fields to company_settings (Feature 1)
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS champion_video_copy   text,
  ADD COLUMN IF NOT EXISTS champion_video_url    text,
  ADD COLUMN IF NOT EXISTS champion_static_copy  text,
  ADD COLUMN IF NOT EXISTS champion_static_url   text;

-- Index: format lookups in approved_copies (used by champion queries)
CREATE INDEX IF NOT EXISTS idx_approved_copies_format
  ON public.approved_copies(owner_id, format)
  WHERE format IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_generations_format
  ON public.generations(owner_id, format)
  WHERE format IS NOT NULL;
