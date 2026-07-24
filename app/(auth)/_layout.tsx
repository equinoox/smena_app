// Auth group layout — plain stack for sign-in / sign-up screens (headers off; screens draw their own).
import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
