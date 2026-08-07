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
  Only create the sub-folders a feature actually needs — don't scaffold empty ones. Never put
  feature code directly under `src/features/<feature>/` outside these sub-folders.
- **Features never import another feature's internals** (no `src/features/a/... ` imports from
  inside `src/features/b`). Cross-cutting code goes in `src/shared`
  (`components`, `hooks`, `lib`, `providers`, `i18n`, `types`). If two features need it, it's shared —
  move it the first time a second feature needs it, don't pre-emptively shared-ify on a guess.
- A feature communicates with another feature (if ever needed) only through a route (navigation)
  or through `src/shared` — never through a direct import or a shared mutable module.
- Role-sensitive screens are **one route** that renders a `WorkerXView` / `VenueXView` based on
  `useUserRole()` — never duplicate routes per role.
- Prefer small, reusable components (`Button`, `Card`, `Chip`, `Input`, `ListingCard`,
  `ListingList`, `EmptyState`, …) over one-off markup.
- Before adding a new file, check whether it belongs in an existing feature folder, `src/shared`,
  or is genuinely a new feature — don't invent new top-level folders or naming conventions.

### Data & state
- Server data → TanStack Query with keys from `src/shared/lib/queryKeys.ts`. Query/mutation
  errors surface automatically as toasts via the client's centralized handler.
- Local/UI state → Zustand. Never duplicate in Zustand what Query already owns.
- All Supabase access goes through typed services; types live in
  `src/shared/types/database.types.ts` (regenerate after schema changes — see `supabase/README.md`).
- **Test data**: `supabase/reset.sql` (wipe everything) and `supabase/seed.sql` (4 test
  accounts — 1 worker + 3 venues at different Belgrade locations, each with one listing)
  must be kept in sync whenever the schema changes — update them in the same change that
  adds/renames/drops a column they touch. Run by pasting both into the Supabase
  dashboard's SQL Editor (`reset.sql` then `seed.sql`) — no local `psql`/npm-script
  tooling for this, see `supabase/README.md`.

### i18n & theme
- No user-facing string is hardcoded. Add keys to **both** `en.json` and `sr.json` and use
  `useTranslation().t("dot.path")`. Default language is `sr`.
- Theme is `system | light | dark`, persisted, defaults to system (`ThemeProvider`).

### Errors
- `ErrorBoundary` wraps the app. Surface recoverable/service errors with `useToast()`.

### Responsiveness — every screen, every device
- Screens must work across phone sizes (small Android to large Pro Max) **and** tablets, in both
  orientations where the OS allows rotation. Never hardcode a layout for one mockup dimension.
- Use `useResponsive()` (`src/shared/lib/responsive.ts`) for scaling spacing, font size, and
  geometry. Never paste fixed pixel values copied from a design mockup.
- Prefer flexible layouts (`flex`, `gap`, `%`-based sizing, NativeWind responsive-ish patterns)
  over fixed widths/heights. Reserve fixed pixel `style` values for cases that truly can't be
  relative (see Styling rule above).
- Long lists/content must scroll safely with the keyboard and safe-area insets on all device
  sizes; test that nothing clips on the smallest and largest supported screens.

### Code quality & coupling
- Keep logic simple and linear. If a function needs more than a couple of nested
  conditionals/branches to explain, split it or extract named helpers instead of piling on
  complexity.
- No premature abstractions, config flags, or generic "just in case" layers. Solve the problem
  in front of you; generalize only when a second real caller shows up.
- Keep functions and components small and single-purpose. A screen component orchestrates;
  business logic belongs in hooks/services, not inlined in JSX.
- Minimize coupling everywhere, not just across features: a component shouldn't reach into
  another component's internals, and a hook/service shouldn't depend on UI state. Depend on
  the narrowest thing you actually need (a prop, not a whole store; a type, not a whole module).
- If two features start needing the same logic, extract it to `src/shared` once — don't
  duplicate it and don't reach across features to reuse it.

## Conventions
- All code and comments in English.
- Every file starts with a 1–2 line comment: what it does + what it connects to. No long doc blocks.
- Responsive: use `useResponsive()` for scaling; don't paste fixed mockup pixel values.
- Prefer minimal, clean code — **refactor over rewrite**.

## Free-tier / cost flags
- Everything must run on Supabase + Expo free tiers while there are no users.
- **Phone OTP auth needs a paid SMS provider** — not wired. Auth is email/password; phone is
  profile data only. Ask before wiring phone OTP.
- Maps: `@rnmapbox/maps` + `expo-location` are added (location picker on worker/venue
  sign-up + venue edit). Mapbox account requires a card on file even on the free tier
  (50k map loads/mo free) — accepted tradeoff, already wired, don't re-litigate. Radius/
  near-me search isn't built yet; `profiles.lat/lng` and `venues.lat/lng` are stored so
  it can be added later (PostGIS block is commented in `supabase/migrations/0001_init.sql`).
- Flag any feature that would require a paid service **before** building it.

## Running the app
- **The user runs and tests the app on their own physical device. Never start a dev server
  (`expo start`) automatically.** Typecheck with `npm run typecheck`.
- Native modules (e.g. `@rnmapbox/maps`) require a dev-client rebuild after install —
  never run `expo prebuild`/`eas build` automatically; tell the user the exact command.
- Reset/reseed test data by pasting `reset.sql`/`seed.sql` into the Supabase dashboard's
  SQL Editor (see `supabase/README.md`).
