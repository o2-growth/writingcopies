

## Plan: Update logo name to "Oxy Writer"

Update the logo text in 4 locations:

### 1. `src/components/AppShell.tsx`
- **Desktop sidebar (line 91-93)**: Change to `<span className="text-primary">Oxy</span> Writer` (Oxy in green, Writer in foreground/white)
- **Mobile header (line 184-186)**: Same change

### 2. `src/pages/Login.tsx` (line 49-51)
- Change `Copy<span>Lab</span>` → `<span className="text-primary">Oxy</span> Writer`

### 3. `src/pages/ResetPassword.tsx` (line 45-47)
- Same change as Login

