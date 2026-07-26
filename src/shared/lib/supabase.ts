// Supabase client — Postgres/Auth/Storage/Realtime. Reads keys from EXPO_PUBLIC_* env.
// Session is persisted in AsyncStorage; used by the auth provider and all services.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import type { Database } from "@shared/types/database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Keep module evaluation safe in release builds. RootLayout renders a useful
// configuration error when EAS variables are absent instead of Android closing
// the app because of an uncaught import-time exception.
export const supabase = createClient<Database>(
  supabaseUrl ?? "https://configuration-missing.invalid",
  supabaseAnonKey ?? "configuration-missing",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Keep the session token fresh only while the app is in the foreground.
AppState.addEventListener("change", (state) => {
  if (state === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
