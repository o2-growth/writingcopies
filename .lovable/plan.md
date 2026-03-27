

## Plan: Conditional 150-char limit for S size

### Change: `supabase/functions/generate-copy/index.ts`

Update the `sizeGuide` for "S" to be dynamic instead of static. After building the size guide object, add a conditional override:

- Default S guide remains: `"Muito curto e conciso. Máximo 1-2 frases por campo."`
- When `channel === "instagram"` AND `copy_type === "completa"` AND `format === "static"`, override S to: `"Muito curto e conciso. Máximo absoluto de 150 caracteres no total da copy (somando todos os campos preenchidos). Seja direto e impactante."`

This is a single-line conditional added after the `sizeGuide` declaration — no other files need changes.

Redeploy the `generate-copy` edge function.

