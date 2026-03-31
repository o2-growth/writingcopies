

## Plan: Add Profile selector (Company vs CEO) to Create Copy

### Concept
Add a `profile` column (`'company'` or `'ceo'`) to three tables: `company_settings`, `editorial_lines`, and `copywriter_preferences`. The Create page gets a prominent profile selector (two cards/buttons) as the first field. Selecting a profile filters editorial lines, copywriters, and pulls the correct brand voice.

### 1. Database migration
- **`company_settings`**: Add `profile text not null default 'company'`. Change the unique constraint from `owner_id` to `(owner_id, profile)` so each user can have two rows (one per profile).
- **`editorial_lines`**: Add `profile text not null default 'company'`.
- **`copywriter_preferences`**: Add `profile text not null default 'company'`.

### 2. Validator — `src/lib/validators.ts`
- Add `profile: z.enum(['company', 'ceo'])` to `generateCopySchema`.
- Add `profile` to `companySettingsSchema` and `editorialLineSchema`.

### 3. Company admin — `src/pages/admin/Company.tsx` + `src/hooks/useCompany.ts`
- Add a profile toggle (two tabs/cards) at the top of the Company page so the user can configure brand voice, audience, USP etc. separately for "O2 Inc." and "CEO".
- `useCompany` hook: accept a `profile` parameter, query with `.eq('profile', profile)`. The upsert uses `onConflict: 'owner_id,profile'`.

### 4. Editorial Lines admin — `src/pages/admin/EditorialLines.tsx` + `src/hooks/useEditorialLines.ts`
- Add profile toggle at the top. Filter lines by selected profile.
- When creating a new editorial line, attach the current profile.

### 5. Copywriters admin — `src/pages/admin/Copywriters.tsx` + `src/hooks/useCopywriters.ts`
- Add profile toggle at the top. Preferences are per-profile: a copywriter can be active for "company" but not for "ceo".
- `useCopywriters` hook: accept `profile` parameter, filter preferences by profile.

### 6. Create page — `src/pages/create/Index.tsx`
- Add `profile` field as **first element** on the page, rendered as two side-by-side cards/buttons with visual highlight on the selected one.
- Default to `'company'`.
- When profile changes: reset `editorial_line_id`, `copywriter_ids`, and re-filter available options.
- Pass `profile` to `useCompany`, `useEditorialLines`, `useCopywriters` hooks for filtering.
- Send `profile` in the request body to the edge function.

### 7. Edge function — `supabase/functions/generate-copy/index.ts`
- Add `profile` to validation.
- When loading `company_settings`, filter by `.eq('profile', body.profile)` to pull the correct brand voice, audience, USP etc.

### 8. Files affected
1. Database migration (new columns + constraint)
2. `src/lib/validators.ts`
3. `src/hooks/useCompany.ts`
4. `src/pages/admin/Company.tsx`
5. `src/hooks/useEditorialLines.ts`
6. `src/pages/admin/EditorialLines.tsx`
7. `src/hooks/useCopywriters.ts`
8. `src/pages/admin/Copywriters.tsx`
9. `src/pages/create/Index.tsx`
10. `supabase/functions/generate-copy/index.ts`

