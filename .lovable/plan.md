

## Plan: Carousel output as single `body` field with slide separators

### Problem
Currently, carousel copies return as an array of `{slide_number, text}` objects. The user wants carousel content in a **single `body` field** with clear slide separators (e.g. `Slide 1:\n...\nSlide 2:\n...`).

### Approach
Change the AI output format for carousels from `slides[]` to a single `body` field, and update the frontend to parse/render slide separators.

### 1. Edge function — `supabase/functions/generate-copy/index.ts`

- Change carousel output format from `{"slides": [...]}` to `{"body": "Slide 1:\n...\n\nSlide 2:\n...", "cta": "..."}`
- Update prompt instructions to tell the AI to output all slides in a single `body` field, separated by `Slide 1:`, `Slide 2:`, etc.
- Keep the `caption` field for Instagram

### 2. Result card — `src/components/CopyResultCard.tsx`

- Remove `Slide` interface and `slides`-based detection/rendering
- Carousel copies now arrive as standard `body` field — render with `whitespace-pre-wrap` (same as standard body)
- The slide separators (`Slide 1:`, `Slide 2:`, etc.) will be visible naturally in the text
- Optionally: parse `Slide N:` markers to render with the existing styled separator UI

### 3. Create page — `src/pages/create/Index.tsx`

- Update `handleSaveApproved` — carousel copies now use `body` directly (no more `slides.map()` conversion)

### Files affected
1. `supabase/functions/generate-copy/index.ts` — change carousel output format
2. `src/components/CopyResultCard.tsx` — simplify rendering (remove slides array logic)
3. `src/pages/create/Index.tsx` — simplify approve handler

