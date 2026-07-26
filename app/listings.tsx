// Route: /listings — thin wrapper, renders the role-aware listings screen. Lives at the
// root (not inside (tabs)) so pushing into it hides the bottom tab bar — it's reached only
// via "see all", never as a tab.
import { ListingsScreen } from "@features/listings/screens/ListingsScreen";

export default function ListingsRoute() {
  return <ListingsScreen />;
}
