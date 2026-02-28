

## Plan: 3 UI Changes

### 1. Move theme toggle to top-right of main content area
In `src/components/AppShell.tsx`:
- Remove theme toggle from sidebar footer
- Add a fixed header bar in the main content area (desktop) with the Sun/Moon button aligned to the right
- Keep the existing mobile top bar toggle as-is

### 2. Update color scheme to vivid green (#6CF269) + intense gray (#494949)
In `src/index.css`, replace the blue-based primary with green-based:
- **Light mode**: Primary becomes `118 84% 68%` (vivid green), accent tones adjusted to green
- **Dark mode**: Primary adjusted to a slightly brighter green for dark backgrounds
- Ring, sidebar-primary, sidebar-accent all updated to match green palette
- Foreground/surface grays adjusted toward the intense gray (#494949 → `0 0% 29%`)

### 3. Remove "Copies Campeãs" section from Company page
In `src/pages/admin/Company.tsx`:
- Remove the entire second `<Card>` block (Copies Campeãs) with the `ChampionField` components
- Remove the `ChampionField` component definition and unused imports (`Trophy`, `Link`, `FileText`, `Video`, `Image`, `Tabs`, `TabsList`, `TabsTrigger`)
- Remove champion fields from `useForm` reset and validator if needed

