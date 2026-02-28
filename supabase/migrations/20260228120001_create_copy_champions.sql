-- Migration: Create copy_champions table
-- Features: #5 (mark as champion), #6 (Copy Controle screen)
--
-- Design:
--   - One active champion per category: (owner_id, product_id, channel, format)
--   - replaced_at IS NULL = currently active champion
--   - replaced_at IS NOT NULL = historical (was champion, now replaced)
--   - product_id NULL = copy not tied to a specific product

CREATE TABLE IF NOT EXISTS public.copy_champions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  copy_id        uuid        NOT NULL REFERENCES public.approved_copies(id) ON DELETE CASCADE,
  product_id     uuid        REFERENCES public.products(id) ON DELETE SET NULL,
  channel        text        NOT NULL,
  format         text        NOT NULL CHECK (format IN ('video', 'static')),
  champion_at    timestamptz NOT NULL DEFAULT now(),
  replaced_at    timestamptz,          -- NULL = currently active; NOT NULL = historical
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.copy_champions IS
  'Tracks champion copies per category (owner + product + channel + format). Active champion has replaced_at IS NULL.';

COMMENT ON COLUMN public.copy_champions.replaced_at IS
  'When this champion was replaced by a newer one. NULL means currently active.';

-- Indexes for champion queries
-- Active champion lookup per category
CREATE INDEX IF NOT EXISTS idx_copy_champions_active
  ON public.copy_champions(owner_id, product_id, channel, format)
  WHERE replaced_at IS NULL;

-- History queries (all champions for a category, ordered by time)
CREATE INDEX IF NOT EXISTS idx_copy_champions_history
  ON public.copy_champions(owner_id, champion_at DESC);

-- Lookup by copy_id (to check if a specific copy is/was champion)
CREATE INDEX IF NOT EXISTS idx_copy_champions_copy_id
  ON public.copy_champions(copy_id);

-- RLS
ALTER TABLE public.copy_champions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own champions"
  ON public.copy_champions FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own champions"
  ON public.copy_champions FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own champions"
  ON public.copy_champions FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own champions"
  ON public.copy_champions FOR DELETE
  USING (owner_id = auth.uid());
