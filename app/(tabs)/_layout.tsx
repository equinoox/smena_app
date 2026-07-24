// Tabs layout — role-aware tab set with a custom token-styled tab bar.
// Workers get Home/Listings/Saved/Profile; venues drop Saved (worker-only feature).
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
      <Tabs.Screen name="listings" />
      <Tabs.Screen name="saved" options={{ href: isVenue ? null : undefined }} />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
