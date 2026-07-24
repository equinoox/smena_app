// Root layout: loads fonts + global styles, mounts all providers, runs protected-route
// redirect logic (onboarding -> auth -> tabs). Every other route renders under this.
import "../global.css";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@shared/components/ErrorBoundary";
import { ToastProvider } from "@shared/components/Toast";
import { useOnboardingStatus } from "@shared/hooks/useOnboardingStatus";
import { I18nProvider } from "@shared/i18n/I18nProvider";
import { AuthProvider, useAuth } from "@shared/providers/AuthProvider";
import { ThemeProvider } from "@shared/providers/ThemeProvider";
import { queryClient } from "@shared/lib/queryClient";

// Redirects between onboarding / auth / tabs based on onboarding flag + session.
function RootNavigator() {
  const { session, initializing } = useAuth();
  const { completed } = useOnboardingStatus();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing || completed === null) return;

    const group = segments[0];
    const inAuth = group === "(auth)";
    const inOnboarding = group === "onboarding";

    if (!completed) {
      // Mid sign-up (picked a role, filling the form) counts as "not yet completed" but
      // must not be bounced back to onboarding on every render — only a fresh app open
      // outside onboarding/auth does that.
      if (!inOnboarding && !inAuth) router.replace("/onboarding");
      return;
    }
    if (!session) {
      if (!inAuth && !inOnboarding) router.replace("/sign-in");
      return;
    }
    // Signed in: keep the user out of onboarding/auth.
    if (inAuth || inOnboarding) router.replace("/");
  }, [session, initializing, completed, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="listing/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Hold render until fonts are ready to avoid a flash of the system font.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <ToastProvider>
                  <ErrorBoundary>
                    <StatusBar style="auto" />
                    <RootNavigator />
                  </ErrorBoundary>
                </ToastProvider>
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
