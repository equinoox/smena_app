// Route: /venue-profile/[id] — thin wrapper, renders a specific lokal's own profile.
// Reached from the "Moji lokali" list when the owner runs more than one venue.
import { useLocalSearchParams, useRouter } from "expo-router";
import { VenueProfileScreen } from "@features/profile/screens/VenueProfileScreen";

export default function VenueProfileByIdRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <VenueProfileScreen venueId={id} onBack={() => router.back()} />;
}
