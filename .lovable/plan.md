

## Plan: Update Products — remove pricing_notes/links, add pain_points

### 1. Database migration
- Remove columns `pricing_notes` and `links` from `products` table
- Add column `pain_points text` (nullable)

### 2. Validator — `src/lib/validators.ts`
- Remove `pricing_notes` and `links` from `productSchema`
- Add `pain_points: z.string().max(5000).optional()`

### 3. Products page — `src/pages/admin/Products.tsx`
- Remove "Notas de Preço" (Input) and "Links" (Input) fields
- Add "Quais dores resolve" (Textarea, 2 rows) field
- Update `openNew` and `openEdit` reset calls to use `pain_points` instead of `pricing_notes`/`links`

### 4. Edge function — `supabase/functions/generate-copy/index.ts`
- Replace `pricing_notes` reference in prompt with `pain_points` (e.g., `Dores que resolve: ${product.pain_points}`)

### 5. Hook — `src/hooks/useProducts.ts`
- No changes needed (uses `...input` spread, will adapt automatically)

