

## Plan: Add "Linha Editorial" field to Create page + quantity 5

### 1. Schema & Validation — `src/lib/validators.ts`
- Add `editorial_line_id: z.string().uuid().optional()` to `generateCopySchema`
- Change quantity max from 3 to 5

### 2. Create Page — `src/pages/create/Index.tsx`
- Import `useEditorialLines` hook
- Add a Select field for "Linha Editorial" (optional, same pattern as Product select with "none" option)
- Update quantity Select to include options 4 and 5

### 3. Edge Function — `supabase/functions/generate-copy/index.ts`
- Update validation: accept quantity up to 5, accept optional `editorial_line_id`
- If `editorial_line_id` provided, fetch the editorial line from DB (verify owner_id)
- Inject editorial line context into the user prompt (name, objective, content_style, champion_examples)

### 4. Generation hook — `src/hooks/useGenerateCopy.ts`
- No changes needed (passes input body as-is)

