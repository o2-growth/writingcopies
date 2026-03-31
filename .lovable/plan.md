

## Plan: Inject engagement-specific rules when objective is "engajamento"

### What changes
**Single file:** `supabase/functions/generate-copy/index.ts`

When `body.objective === "engajamento"`, inject a dedicated block of instructions into the system prompt that enforces pure engagement content — no brand mentions, no commercial CTAs, no product bridges.

### Technical details

1. **Define engagement rules block** (new constant or inline string, ~lines 157-158 area):
   - Contains all the prohibitions and directives provided by the user
   - Instructs the AI to omit company name, products, USP, claims, and disclaimers from the copy body
   - Overrides the CTA field to be empty string when `copy_type` includes CTA

2. **Conditionally inject into `systemPrompt`** (~line 159):
   - If objective is "engajamento", append the engagement rules block after the style packs/blend instructions

3. **Conditionally strip commercial context from `userPrompt`** (~lines 182-196):
   - When objective is "engajamento", suppress product details (name, description, benefits, features, objections, pain points), USP, claims, and disclaimers from the prompt — these create commercial bias
   - Keep only: brand voice (for tone), audience (for targeting), and editorial line (for thematic direction)

4. **Force CTA field empty for engagement**:
   - Add instruction: when objective is "engajamento", the `cta` field must always be an empty string, regardless of `copy_type`

5. **Redeploy** the `generate-copy` edge function.

### No other files change
The frontend already passes `objective` correctly; no UI or validation changes needed.

