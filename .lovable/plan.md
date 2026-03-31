

## Plan: Structured champion examples for Products and Editorial Lines

### Problem
Currently, "Melhores Anúncios" (Products) and "Exemplos de Copies Campeãs" (Editorial Lines) are single text fields. Each example needs to be an individual entry tagged with **format** (vídeo, estático, carrossel) and **channel** (twitter, instagram, linkedin, email, whatsapp).

### Approach
Create a new `champion_examples` table to store individual examples linked to either a product or an editorial line. Remove the old text fields (`best_ads` from products, `champion_examples` from editorial_lines`).

### 1. Database migration
- Create table `champion_examples`:
  - `id` uuid PK
  - `owner_id` uuid (for RLS)
  - `product_id` uuid nullable (FK to products)
  - `editorial_line_id` uuid nullable (FK to editorial_lines)
  - `body` text not null (the copy text)
  - `format` text not null (video, static, carousel)
  - `channel` text not null (twitter, instagram, linkedin, email, whatsapp)
  - `created_at` timestamptz default now()
  - CHECK: exactly one of product_id or editorial_line_id is set
- RLS: owner-based CRUD policies
- Drop columns `products.best_ads` and `editorial_lines.champion_examples`

### 2. Validators — `src/lib/validators.ts`
- Remove `best_ads` from `productSchema`
- Remove `champion_examples` from `editorialLineSchema`
- Add `championExampleSchema` with body, format, channel fields

### 3. New hook — `src/hooks/useChampionExamples.ts`
- CRUD hook that accepts `{ product_id?: string, editorial_line_id?: string }` filter
- Queries `champion_examples` table filtered by the parent entity

### 4. UI component — `src/components/ChampionExamplesEditor.tsx`
- Reusable component used in both Products and Editorial Lines dialogs
- Shows list of existing examples (each with body preview, format badge, channel badge, delete button)
- "Add example" button opens inline form with: Textarea (body), Select (format), Select (channel)
- Saves immediately to DB (not part of parent form submit)

### 5. Products admin — `src/pages/admin/Products.tsx`
- Remove `best_ads` Textarea field
- Add `ChampionExamplesEditor` component inside the dialog, passing `product_id` when editing

### 6. Editorial Lines admin — `src/pages/admin/EditorialLines.tsx`
- Remove `champion_examples` Textarea field
- Add `ChampionExamplesEditor` component inside the dialog, passing `editorial_line_id` when editing

### 7. Create page — `src/pages/create/Index.tsx`
- Update `use_best_ads` checkbox logic: instead of checking `product.best_ads`, check if the selected product has any champion examples in the DB
- Pass relevant info to the edge function

### 8. Edge function — `supabase/functions/generate-copy/index.ts`
- When `use_best_ads` is true and a product is selected: query `champion_examples` where `product_id = body.product_id`, optionally filtered by `channel` and `format` matching the current request
- When an editorial line is selected: query `champion_examples` where `editorial_line_id = body.editorial_line_id`
- Inject each example into the prompt with its format and channel metadata:
  ```
  **Exemplos de referência:**
  1. [Canal: Instagram | Formato: Carrossel] "texto da copy..."
  2. [Canal: LinkedIn | Formato: Estático] "texto da copy..."
  ```

### Files affected
1. Database migration (new table + drop old columns)
2. `src/lib/validators.ts`
3. `src/hooks/useChampionExamples.ts` (new)
4. `src/components/ChampionExamplesEditor.tsx` (new)
5. `src/pages/admin/Products.tsx`
6. `src/pages/admin/EditorialLines.tsx`
7. `src/hooks/useProducts.ts` (remove best_ads references)
8. `src/pages/create/Index.tsx`
9. `supabase/functions/generate-copy/index.ts`
10. Redeploy edge function

