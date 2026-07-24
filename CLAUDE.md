# Smena — project rules for Claude Code

Smena is a two-sided hospitality marketplace (Serbia) connecting **workers** (waiters,
bartenders, baristas, cooks, hosts, kitchen helpers) with **venues** (cafés, bars,
restaurants, clubs, bakeries) that need shift coverage.

> Expo SDK 57 (React 19, RN 0.86, new architecture). When touching native/Expo APIs,
> check the versioned docs at https://docs.expo.dev/versions/v57.0.0/.

## Tech stack (do not swap without asking)

- Expo (managed) + React Native + TypeScript (strict)
- Expo Router (file-based, `(tabs)` group)
- Supabase (Postgres + Auth + Storage + Realtime), free tier
- NativeWind v4 (Tailwind for RN) — **the only styling mechanism**
- TanStack Query for all server state; Zustand only for local/UI state
- React Hook Form + Zod for all forms
- phosphor-react-native (icons), @expo-google-fonts/plus-jakarta-sans, AsyncStorage

## Hard rules

### Styling — NativeWind only
- Style **only** with Tailwind `className`. No `StyleSheet.create`, no inline `style` color
  objects. `style` is allowed **only** for dynamic numeric geometry that cannot be a class
  (e.g. `Avatar` size, safe-area padding), never for colors.
- **Every color comes from a token** in `tailwind.config.js` → never a raw hex in a component.
- Tokens are CSS variables in `global.css` and auto-switch light/dark. Class names use the
  token key, e.g. `bg-bg-surface`, `text-text-primary`, `border-border-default`.
- Radii/fonts are tokens too: `rounded-card`/`rounded-button`/`rounded-chip`,
  `font-sans` / `font-sans-medium` / `font-sans-semibold` / `font-sans-bold` / `font-sans-extrabold`.
- Imperative color props (icons, `placeholderTextColor`, `ActivityIndicator`) can't take
  classes → use `useThemeColors()`. Its palette (`src/shared/lib/themeColors.ts`) **must stay
  in sync** with `global.css`.

### Architecture — thin routes, decoupled features
- Every file in `app/` is a **thin wrapper**: import one screen and `return <XScreen />`.
  No logic or JSX beyond that. Exceptions: `_layout.tsx` files (navigators + root providers +
  redirect logic).
- Feature code lives in `src/features/<feature>/{screens,components,hooks,services,validation,store}`.
- **Features never import another feature's internals.** Cross-cutting code goes in `src/shared`
  (`components`, `hooks`, `lib`, `providers`, `i18n`, `types`). If two features need it, it's shared.
- Role-sensitive screens are **one route** that renders a `WorkerXView` / `VenueXView` based on
  `useUserRole()` — never duplicate routes per role.
- Prefer small, reusable components (`Button`, `Card`, `Chip`, `Input`, `ListingCard`,
  `ListingList`, `EmptyState`, …) over one-off markup.

### Data & state
- Server data → TanStack Query with keys from `src/shared/lib/queryKeys.ts`. Query/mutation
  errors surface automatically as toasts via the client's centralized handler.
- Local/UI state → Zustand. Never duplicate in Zustand what Query already owns.
- All Supabase access goes through typed services; types live in
  `src/shared/types/database.types.ts` (regenerate after schema changes — see `supabase/README.md`).

### i18n & theme
- No user-facing string is hardcoded. Add keys to **both** `en.json` and `sr.json` and use
  `useTranslation().t("dot.path")`. Default language is `sr`.
- Theme is `system | light | dark`, persisted, defaults to system (`ThemeProvider`).

### Errors
- `ErrorBoundary` wraps the app. Surface recoverable/service errors with `useToast()`.

## Conventions
- All code and comments in English.
- Every file starts with a 1–2 line comment: what it does + what it connects to. No long doc blocks.
- Responsive: use `useResponsive()` for scaling; don't paste fixed mockup pixel values.
- Prefer minimal, clean code — **refactor over rewrite**.

## Free-tier / cost flags
- Everything must run on Supabase + Expo free tiers while there are no users.
- **Phone OTP auth needs a paid SMS provider** — not wired. Auth is email/password; phone is
  profile data only. Ask before wiring phone OTP.
- Google Maps / `react-native-maps` not added yet. `venues.lat/lng` are stored so it can be
  added later (PostGIS block is commented in `supabase/migrations/0001_init.sql`). Don't make
  choices that block it.
- Flag any feature that would require a paid service **before** building it.

## Running the app
- **The user runs and tests the app on their own physical device. Never start a dev server
  (`expo start`) automatically.** Typecheck with `npm run typecheck`.
