

## Plan: Add "Carrossel" format for Instagram and LinkedIn

### Overview
Add "carrossel" as a new format option, visible only when the channel is Instagram or LinkedIn. When selected, the edge function injects detailed carousel-specific prompt rules (slide structure, retention techniques, cover slide formula, closing slide rules, channel adaptations) and changes the JSON output format to deliver slide-by-slide text.

### Changes

#### 1. Constants — `src/lib/constants.ts`
- Add `{ value: 'carousel', label: 'Carrossel' }` to the `FORMATS` array.

#### 2. Validator — `src/lib/validators.ts`
- Add `'carousel'` to the `format` enum: `z.enum(['video', 'static', 'carousel'])`.

#### 3. Create page — `src/pages/create/Index.tsx`
- Watch the `channel` field. Filter the `FORMATS` list shown in the Format select:
  - If channel is `instagram` or `linkedin`: show all three formats (Vídeo, Estático, Carrossel).
  - Otherwise: show only Vídeo and Estático (current behavior).
- When channel changes to one that doesn't support carousel, reset format to `undefined` if it was `carousel`.

#### 4. Edge function validation — `supabase/functions/generate-copy/index.ts`
- Add `"carousel"` to the `formats` array in `validateBody` (or add format validation if missing).

#### 5. Edge function prompt — `supabase/functions/generate-copy/index.ts`
When `body.format === "carousel"`:

- **Override copy_type behavior**: Carousel ignores the standard copy_type fields (title/subtitle/body/cta). Instead, inject carousel-specific instructions with the full ruleset provided by the user (slide structure, 6-15 slides, max 45 words/slide, cliffhanger rules, cover slide formula, closing slide rules, channel-specific adaptations for Instagram vs LinkedIn).

- **Change JSON output format** to:
  ```json
  {
    "copies": [
      {
        "slides": [
          { "slide_number": 1, "text": "..." },
          { "slide_number": 2, "text": "..." }
        ]
      }
    ]
  }
  ```

- **Size and copy_type selectors become irrelevant** for carousel — the prompt will instruct the AI to ignore them and follow carousel rules instead.

- **Quantity** still applies (generate N carousel variations).

#### 6. Result display — `src/components/CopyResultCard.tsx`
- Detect if the result has a `slides` array instead of `title/subtitle/body/cta`.
- When slides are present, render each slide as a numbered block (e.g., "Slide 1", "Slide 2", etc.) with the slide text.
- The "Copy" button copies all slides as formatted text.

#### 7. Approved copy handling
- When approving a carousel copy, concatenate all slides into the `body` field with slide markers for storage in the library.

### Files affected
1. `src/lib/constants.ts` — add carousel format
2. `src/lib/validators.ts` — add carousel to enum
3. `src/pages/create/Index.tsx` — conditional format filtering
4. `supabase/functions/generate-copy/index.ts` — carousel prompt + output format
5. `src/components/CopyResultCard.tsx` — carousel slide rendering
6. Redeploy `generate-copy` edge function

