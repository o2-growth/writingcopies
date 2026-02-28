

## Plan: Adjust green primary for better contrast with white text

The current primary `119 84% 68%` (light vivid green) has insufficient contrast against white text (fails WCAG AA). 

### Change in `src/index.css`

Darken the primary green to improve readability:

- **Light mode**: `--primary: 142 64% 40%` (~#25A244 — a rich, darker green with strong white text contrast)
- **Dark mode**: `--primary: 142 64% 45%` (slightly brighter for dark backgrounds)
- Update `--ring`, `--sidebar-primary`, `--sidebar-ring` to match
- Adjust `--accent` and `--sidebar-accent` tones to harmonize with the new green

This keeps the green identity but shifts to a deeper tone that passes WCAG AA contrast with white foreground text.

