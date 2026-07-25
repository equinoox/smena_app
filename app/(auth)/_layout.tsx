// Auth group layout — plain stack for sign-in / sign-up screens (headers off; screens draw their own).
import { Stack } from "expo-router";

// Explicit anchor: whenever this group is (re-)entered fresh (e.g. right after sign-out),
// land on sign-in rather than relying on file-alphabetical order.
export const unstable_settings = {
  initialRouteName: "sign-in",
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
