
-- Add profile column to company_settings
ALTER TABLE public.company_settings ADD COLUMN profile text NOT NULL DEFAULT 'company';

-- Drop existing unique constraint on owner_id and create new one on (owner_id, profile)
ALTER TABLE public.company_settings DROP CONSTRAINT IF EXISTS company_settings_owner_id_key;
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_owner_id_profile_key UNIQUE (owner_id, profile);

-- Add profile column to editorial_lines
ALTER TABLE public.editorial_lines ADD COLUMN profile text NOT NULL DEFAULT 'company';

-- Add profile column to copywriter_preferences
ALTER TABLE public.copywriter_preferences ADD COLUMN profile text NOT NULL DEFAULT 'company';
