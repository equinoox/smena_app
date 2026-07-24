// Listings — one route, role-aware: worker browses open shifts, venue sees its own.
import { Loader } from "@shared/components/Loader";
import { useUserRole } from "@shared/hooks/useUserRole";
import { VenueListingsView } from "@features/listings/components/VenueListingsView";
import { WorkerListingsView } from "@features/listings/components/WorkerListingsView";

export function ListingsScreen() {
  const { role, isLoading } = useUserRole();

  if (isLoading) return <Loader />;

  return role === "venue" ? <VenueListingsView /> : <WorkerListingsView />;
}
