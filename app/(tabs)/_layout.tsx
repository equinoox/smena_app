// Tabs layout — role-aware tab set with a custom token-styled tab bar.
// Workers get Home/Saved/Profile; venues get Home/Venue profile/Profile.
// "listings" (browse-all) lives outside this group (app/listings.tsx) precisely so it
// doesn't render inside Tabs — our TabBar shows for every screen in this navigator
// regardless of whether it has its own tab button, so a route with no button would still
// keep the bar visible if it stayed nested here.
import { Tabs } from "expo-router";
import { TabBar } from "@shared/components/TabBar";
import { useUserRole } from "@shared/hooks/useUserRole";

export default function TabsLayout() {
  const { role } = useUserRole();
  const isVenue = role === "venue";

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="saved" options={{ href: isVenue ? null : undefined }} />
      <Tabs.Screen name="venue-profile" options={{ href: isVenue ? undefined : null }} />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
