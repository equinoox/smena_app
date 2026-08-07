// Fetches the signed-in worker's own existing rating of a venue, if any — used to
// prefill the RateVenueModal in edit mode.
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import { fetchMyVenueRating } from "@features/venues/services/venuesService";

export function useMyVenueRating(venueId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.myVenueRating(venueId, user?.id ?? "anon"),
    queryFn: () => fetchMyVenueRating(venueId, user!.id),
    enabled: !!user && !!venueId,
  });
}
