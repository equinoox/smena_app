// Mutation hook for a worker submitting (or editing) their rating of a venue.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import {
  submitVenueRating,
  type VenueRatingInput,
} from "@features/venues/services/venuesService";

export function useSubmitVenueRating(venueId: string) {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: VenueRatingInput) =>
      submitVenueRating(venueId, user!.id, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.venueProfile(venueId) });
      // Broad prefix — covers the worker-facing browse-listings cache and the venue's
      // own listing lists, all of which embed the venue (and its rating) by join.
      client.invalidateQueries({ queryKey: ["listings"] });
      client.invalidateQueries({
        queryKey: queryKeys.myVenueRating(venueId, user?.id ?? "anon"),
      });
    },
  });
}
