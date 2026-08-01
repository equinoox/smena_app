// Mapbox SDK setup — access token + theme-aware map styles. Read at runtime from
// EXPO_PUBLIC_* env (see supabase.ts for the same configuration-guard pattern).
import Mapbox from "@rnmapbox/maps";

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

export const isMapboxConfigured = Boolean(MAPBOX_ACCESS_TOKEN);

// Only call the native setter when a real token exists — an obviously-invalid
// value can throw/log noisily on some platforms, unlike Supabase's dummy fallback.
if (isMapboxConfigured) {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN as string);
}

export const MAPBOX_STYLE_URL = {
  light: "mapbox://styles/mapbox/streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
} as const;

export { Mapbox };
