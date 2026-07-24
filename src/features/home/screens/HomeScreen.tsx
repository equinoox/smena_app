// Home — one route, role-aware: renders the worker or venue home view.
import { Loader } from "@shared/components/Loader";
import { useUserRole } from "@shared/hooks/useUserRole";
import { VenueHomeView } from "@features/home/components/VenueHomeView";
import { WorkerHomeView } from "@features/home/components/WorkerHomeView";

export function HomeScreen() {
  const { role, profile, isLoading } = useUserRole();

  if (isLoading) return <Loader />;

  return role === "venue" ? (
    <VenueHomeView name={profile?.full_name} />
  ) : (
    <WorkerHomeView name={profile?.full_name} />
  );
}
