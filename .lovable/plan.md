

## Plan: Wire up Login and all routes with auth protection

The core problem: `App.tsx` only has a placeholder `/` route. The Login page, AppShell, and all other pages exist but are not connected in the router. We need to:

### Changes

**1. Rewrite `src/App.tsx`** to include:
- `/login` route rendering `Login` page
- Auth-protected layout route using `AppShell` (with `<Outlet/>`) wrapping:
  - `/create` → Create page
  - `/library` → Library page
  - `/history` → History page
  - `/admin/company` → Company page
  - `/admin/products` → Products page
  - `/admin/copywriters` → Copywriters page
- A `ProtectedRoute` wrapper component that checks `useAuth()` — if loading show spinner, if no user redirect to `/login`, otherwise render children
- `/` redirects to `/create`

**2. Enable auto-confirm for email signups** (using configure-auth tool) so testing is immediate without email verification — since the spec says "somente admin" and this is an internal tool.

### Technical details

- `ProtectedRoute` component inline in App.tsx: uses `useAuth()` hook, renders `<Navigate to="/login" />` if unauthenticated
- All child routes nested under `<Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>` 
- Login page already handles redirect to `/create` on success

