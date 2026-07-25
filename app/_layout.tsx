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
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@shared/components/ErrorBoundary";
import { ToastProvider } from "@shared/components/Toast";
import { useOnboardingStatus } from "@shared/hooks/useOnboardingStatus";
import { I18nProvider } from "@shared/i18n/I18nProvider";
import { AuthProvider, useAuth } from "@shared/providers/AuthProvider";
import { ThemeProvider } from "@shared/providers/ThemeProvider";
import { queryClient } from "@shared/lib/queryClient";

// Gates onboarding / auth / tabs based on onboarding flag + session. Stack.Protected
// (unlike the old manual router.replace effect) also purges history entries for a
// screen the moment its guard flips false, so a signed-up user can't gesture/back
// their way into onboarding or auth again.
//
// `completed` only decides whether onboarding is still reachable — it must NOT gate
// (auth) too, since the sign-up screens (which live in (auth)) are exactly what flips
// `completed` to true. Gating (auth) on `completed` would block the role-selection
// buttons from ever navigating anywhere pre-signup. (auth) is reachable any time
// there's no session, independent of onboarding status.
function RootNavigator() {
  const { session, initializing } = useAuth();
  const { completed } = useOnboardingStatus();

  // Hold render until we know both flags — avoids briefly mounting the wrong guard.
  if (initializing || completed === null) return null;

  const isSignedIn = !!session;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!completed && !isSignedIn}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listing/[id]" />
        <Stack.Screen name="profile-edit" />
        <Stack.Screen name="listing-create" options={{ presentation: "modal" }} />
      </Stack.Protected>
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
