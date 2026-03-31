

## Plan: Adapt video format output — script/scene directions instead of title/subtitle

### Problem
When format is "video", the AI generates title/subtitle/body/cta structure, but video copies only need **spoken text (roteiro)** or **scene directions**. Title and subtitle don't apply.

### Approach
Add a third output format branch in the edge function (alongside standard and carousel) for video. Update the result card to render video copies differently.

### 1. Edge function — `supabase/functions/generate-copy/index.ts`

Add a `isVideo = body.format === 'video'` check. When video:

- **Output JSON format**: `{ "copies": [{ "script": "..." }] }` — single field for the spoken text / scene directions
- **Prompt rules**: New `videoRules` block injected into system prompt:
  - "Gere um roteiro de vídeo. Não inclua título ou subtítulo."
  - "O campo `script` deve conter o texto falado e/ou direções de cena."
  - "Use marcações como [CENA], [NARRAÇÃO], [TEXTO NA TELA] para organizar."
  - Respect the `size` guide for length
- **Override** `copyTypeInstructions` — ignore copy_type for video (like carousel does)

### 2. Result card — `src/components/CopyResultCard.tsx`

- Add `isVideo` detection: `copy.script && typeof copy.script === 'string'`
- Render video copies as a single block with label "Roteiro" instead of title/subtitle/body/cta
- Update `fullText` for copy-to-clipboard to use `copy.script`
- Update the `CopyResult` interface to include `script?: string`

### 3. Create page — `src/pages/create/Index.tsx`

- When format is "video", hide or disable the "Tipo" (copy_type) selector since it doesn't apply (like carousel behavior)
- Update `handleSaveApproved` to handle video copies (use `script` as body)

### 4. Approve flow

- When approving a video copy, store `copy.script` as the `body` field in approved_copies

### Files affected
1. `supabase/functions/generate-copy/index.ts` — video prompt rules + output format
2. `src/components/CopyResultCard.tsx` — video rendering
3. `src/pages/create/Index.tsx` — hide copy_type for video, handle approve

