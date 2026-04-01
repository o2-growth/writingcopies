

## Plan: Dynamic Formats managed via Admin

### Problem
Formats (Vídeo, Estático, Carrossel) are hardcoded in constants and the edge function has format-specific prompt rules baked in. Adding a new format requires code changes. The user wants formats to be a dynamic admin section where each format includes structural instructions that get injected into the prompt automatically.

### Approach
Create a `formats` table in the database. Build an admin CRUD page for formats. Replace hardcoded format constants and prompt rules with data from the DB.

### 1. Database migration
Create table `formats`:
- `id` uuid PK default gen_random_uuid()
- `owner_id` uuid not null (for RLS)
- `name` text not null (display name, e.g. "Carrossel")
- `value` text not null (slug, e.g. "carousel")
- `prompt_instructions` text not null (the structural rules injected into the prompt — e.g. all the carousel rules currently hardcoded)
- `channels` text[] nullable (restrict to specific channels, e.g. `{instagram, linkedin}` for carousel; null = all channels)
- `has_script_output` boolean default false (video-like formats output `script` instead of title/subtitle/body/cta)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

RLS: owner-based CRUD policies (same pattern as other tables).

Seed the 3 existing formats (Vídeo, Estático, Carrossel) with their current prompt instructions via an INSERT in the migration — but tied to no owner (these will need to be created by each user in admin, or we make them owner-independent presets). 

**Decision**: Since formats are user-specific (RLS), we won't seed. Users create their own formats in admin.

### 2. New hook — `src/hooks/useFormats.ts`
- CRUD hook for the `formats` table, filtered by owner
- Returns `formats`, `create`, `update`, `remove`

### 3. New admin page — `src/pages/admin/Formats.tsx`
- CRUD interface similar to Products/EditorialLines
- Fields: Nome, Slug (value), Instruções do Prompt (textarea for structural rules), Canais Permitidos (multi-select, optional), Saída em Roteiro (checkbox for script output)
- List view with edit/delete

### 4. Navigation — `src/components/AppShell.tsx`
- Add "Formatos" link under admin section

### 5. Routing — `src/App.tsx`
- Add route `/admin/formats` → FormatsPage

### 6. Constants — `src/lib/constants.ts`
- Remove `FORMATS` constant (will come from DB now)
- Keep `Format` type or make it dynamic

### 7. Validators — `src/lib/validators.ts`
- Update `generateCopySchema`: change `format` from enum to `z.string().optional()` (now dynamic)
- Add `formatSchema` for admin CRUD

### 8. Create page — `src/pages/create/Index.tsx`
- Fetch formats from DB via `useFormats` hook
- Replace hardcoded `FORMATS` / `availableFormats` with DB formats, filtered by selected channel
- When a format with `has_script_output` is selected, hide "Tipo" selector (same as current video behavior)
- Pass `format_id` instead of format string to edge function (or pass format value + the prompt instructions)

### 9. Edge function — `supabase/functions/generate-copy/index.ts`
- Accept `format_id` in body (optional)
- When present, fetch the format from DB to get `prompt_instructions`, `has_script_output`, `channels`
- Replace hardcoded `carouselRules` and `videoRules` with the format's `prompt_instructions`
- Use `has_script_output` to determine output JSON structure (script vs title/subtitle/body/cta)
- Remove hardcoded format validation (validate against DB instead)
- Keep carousel channel restriction logic but driven by the format's `channels` field

### Files affected
1. Database migration (new `formats` table)
2. `src/hooks/useFormats.ts` (new)
3. `src/pages/admin/Formats.tsx` (new)
4. `src/components/AppShell.tsx` (add nav link)
5. `src/App.tsx` (add route)
6. `src/lib/constants.ts` (remove FORMATS)
7. `src/lib/validators.ts` (update format validation)
8. `src/pages/create/Index.tsx` (use dynamic formats)
9. `supabase/functions/generate-copy/index.ts` (fetch format from DB, inject prompt_instructions)
10. `src/components/ChampionExamplesEditor.tsx` (format select should also use dynamic formats)

