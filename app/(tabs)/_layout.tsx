// Tabs layout — role-aware tab set with a custom token-styled tab bar.
// Workers get Home/Saved/Profile; venues get Home/Venue profile/Profile.
// "listings" has no tab (browsing still reaches it via "see all" pushes) — it stays
// registered so /listings remains a valid route without appearing in the bar.
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
      <Tabs.Screen name="listings" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: isVenue ? null : undefined }} />
      <Tabs.Screen name="venue-profile" options={{ href: isVenue ? undefined : null }} />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
