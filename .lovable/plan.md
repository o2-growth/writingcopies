

## Plan: Fix carousel detection in edge function

### Problem
The carousel output format (single `body` field with "Slide N:" separators) isn't working because the detection relies on hardcoded string matching: `formatRecord?.value === "carousel"` or `body.format === "carousel"`. If the user created a format with a different slug (e.g., "carrossel"), neither check matches and the AI defaults to the standard title/subtitle/body/cta output.

### Root cause
Line 192 in `generate-copy/index.ts`:
```ts
const isCarousel = formatRecord?.value === "carousel" || body.format === "carousel";
```

### Solution
Since the formats system is now fully dynamic, we should NOT hardcode format types. Instead:

1. **Add an `output_mode` field logic**: Use `has_script_output` for script formats (already works). For carousel, we need a way to flag that the output should use a single `body` field with slide separators.

2. **Simplest fix**: Add a `is_carousel` boolean column to the `formats` table (similar to `has_script_output`), OR better yet, remove carousel-specific output format handling entirely — carousels can use the standard `body` field naturally since the `prompt_instructions` already tell the AI how to structure the content with slide markers.

**Recommended approach**: Remove all hardcoded carousel detection. Make ALL non-script formats use the standard `{title, subtitle, body, cta}` output. The carousel's `prompt_instructions` (set by the user in admin) already instructs the AI to put slide content in the `body` field with "Slide 1:", "Slide 2:" markers. The output JSON structure doesn't need to be different.

### Changes

#### 1. Edge function — `supabase/functions/generate-copy/index.ts`
- Remove `isCarousel` variable and all carousel-specific branching
- Simplify to two output modes only: `hasScriptOutput` (script) vs standard (title/subtitle/body/cta)
- The format's `prompt_instructions` handle all structural guidance (carousel slides, etc.)
- Remove hardcoded channel-specific carousel adaptations (these should be in the format's `prompt_instructions` in admin)
- Keep the `caption` field for Instagram in both output modes

#### 2. No other files need changes
The `CopyResultCard` and `create/Index.tsx` already handle the standard `body` field with `whitespace-pre-wrap`, which naturally displays slide separators.

### Files affected
1. `supabase/functions/generate-copy/index.ts` — remove carousel-specific output branching, simplify to 2 modes (script vs standard)

