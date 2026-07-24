// Typed EXPO_PUBLIC_* env vars (inlined by Expo at build time).
// Allow importing the Tailwind CSS entrypoint in the root layout.
declare module "*.css";

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}
