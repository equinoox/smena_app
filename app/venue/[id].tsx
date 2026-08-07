// Route: /venue/[id] — thin wrapper, worker-facing read-only venue profile, reached by
// tapping a venue's name on one of its listings.
import { VenueDetailScreen } from "@features/venues/screens/VenueDetailScreen";

export default function VenueDetailRoute() {
  return <VenueDetailScreen />;
}
