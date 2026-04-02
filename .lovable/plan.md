

## Plan: Add "Legenda" (caption) field for Instagram channel

### Problem
When generating copies for Instagram, there's no caption ("legenda") field. Instagram posts need a caption separate from the copy content (title/body/cta or carousel slides).

### Approach
When channel is `instagram`, add a `caption` field to the AI output for all format types (standard, carousel, video/script). Display it in the result card and include it in clipboard/approve flows.

### 1. Edge function — `supabase/functions/generate-copy/index.ts`

- Detect `isInstagram = body.channel === "instagram"`
- When Instagram, modify the output JSON format to include `"caption": "..."` alongside existing fields (in all 3 branches: standard, carousel, script)
- Add prompt instruction: `"Quando o canal for Instagram, inclua um campo 'caption' com a legenda do post. A legenda deve incluir hashtags relevantes se apropriado."`

### 2. Result card — `src/components/CopyResultCard.tsx`

- Add `caption?: string` to the `CopyResult` interface
- After all content sections (standard, carousel, or video), render a "Legenda" block if `copy.caption` exists
- Include caption in `fullText` for clipboard

### 3. Create page — `src/pages/create/Index.tsx`

- Update `handleSaveApproved` to append caption to the body when saving (so it's preserved in approved_copies)

### Files affected
1. `supabase/functions/generate-copy/index.ts` — caption in output format + prompt rules
2. `src/components/CopyResultCard.tsx` — render caption section
3. `src/pages/create/Index.tsx` — include caption in approve flow

