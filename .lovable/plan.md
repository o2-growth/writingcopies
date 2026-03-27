

## Plan: Add "Linha Editorial" admin section

### 1. Database migration
Create a new `editorial_lines` table:

```sql
CREATE TABLE public.editorial_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  objective text,
  content_style text,
  champion_examples text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.editorial_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own editorial lines" ON public.editorial_lines FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can insert own editorial lines" ON public.editorial_lines FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own editorial lines" ON public.editorial_lines FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own editorial lines" ON public.editorial_lines FOR DELETE USING (owner_id = auth.uid());
```

Fields:
- **name** — Nome da Linha Editorial (required)
- **objective** — Objetivo
- **content_style** — Estilo do conteúdo
- **champion_examples** — Exemplos de copies campeãs de audiência

### 2. New files

- **`src/hooks/useEditorialLines.ts`** — Hook with CRUD operations (query, create, update, remove), following the same pattern as `useProducts.ts`
- **`src/lib/validators.ts`** — Add `editorialLineSchema` with zod validation
- **`src/pages/admin/EditorialLines.tsx`** — CRUD page with card list + dialog form, same pattern as Products page. Fields: Nome (Input, required), Objetivo (Textarea), Estilo do Conteúdo (Textarea), Exemplos de Copies Campeãs (Textarea with more rows)

### 3. Routing and navigation

- **`src/App.tsx`** — Add route `/admin/editorial-lines` pointing to the new page
- **`src/components/AppShell.tsx`** — Add nav item `{ to: '/admin/editorial-lines', label: 'Linha Editorial', icon: FileText }` to `adminItems` array

