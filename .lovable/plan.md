

## Plan: Add "Melhores Anúncios" field to Products + inject into commercial prompts

### 1. Database migration
Add column `best_ads text` (nullable) to the `products` table.

### 2. Validator — `src/lib/validators.ts`
Add `best_ads: z.string().max(10000).optional()` to `productSchema`.

### 3. Products admin — `src/pages/admin/Products.tsx`
- Add "Melhores Anúncios" Textarea field (rows=4) in the product form, after "Quais dores resolve".
- Update `openNew` and `openEdit` reset calls to include `best_ads`.

### 4. Edge function — `supabase/functions/generate-copy/index.ts`
When `product` is loaded and `product.best_ads` exists, AND objective is one of `conversao`, `leads`, or `vendas`:
- Inject into `userPrompt`: `**Melhores anúncios de referência:**\n${product.best_ads}`
- Add a system prompt instruction: "Use os melhores anúncios fornecidos como inspiração de estrutura, tom e abordagem — mas NÃO copie. Crie variações originais."

When objective is `awareness` or `engajamento`, the best_ads field is NOT included (no commercial bias).

### Files affected
1. Database migration (add `best_ads` column)
2. `src/lib/validators.ts`
3. `src/pages/admin/Products.tsx`
4. `supabase/functions/generate-copy/index.ts`
5. Redeploy edge function

