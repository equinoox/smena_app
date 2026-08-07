// Fetches a single venue's profile by id, for the worker-facing venue detail screen.
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@shared/lib/queryKeys";
import { fetchVenueById } from "@features/venues/services/venuesService";

export function useVenueProfile(id: string) {
  return useQuery({
    queryKey: queryKeys.venueProfile(id),
    queryFn: () => fetchVenueById(id),
    enabled: !!id,
  });
}
