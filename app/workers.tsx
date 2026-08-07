// Route: /workers — thin wrapper, venue-facing browse-all-workers screen. Lives at the
// root (not inside (tabs)) so pushing into it hides the bottom tab bar — reached only
// via "Prikaži sve" on the venue Home dashboard.
import { WorkersScreen } from "@features/workers/screens/WorkersScreen";

export default function WorkersRoute() {
  return <WorkersScreen />;
}
