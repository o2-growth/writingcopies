

## Plan: Add "Sobre a empresa" and "Clientes" fields to Company Settings

### 1. Database migration
Add two new text columns to `company_settings`:
- `about` (text, nullable) — "Sobre a empresa"
- `past_clients` (text, nullable) — "Clientes que a empresa já atendeu"

### 2. Update `src/lib/validators.ts`
Add `about` and `past_clients` to `companySettingsSchema` (both optional, max 5000 chars).

### 3. Update `src/pages/admin/Company.tsx`
- Add two new `<Textarea>` fields in the form for "Sobre a empresa" and "Clientes"
- Include them in the `reset()` call when loading existing data

### 4. Update `src/hooks/useCompany.ts`
No changes needed — it already uses `select('*')` and spreads the full input on upsert.

