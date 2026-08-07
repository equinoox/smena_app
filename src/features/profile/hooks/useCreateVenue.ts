// Mutation hook for adding another venue under the signed-in owner (multi-venue).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import {
  createVenue,
  type UpdateVenueInput,
} from "@features/profile/services/venueProfileService";

export function useCreateVenue() {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateVenueInput) => createVenue(user!.id, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.myVenues(user?.id ?? "anon") });
    },
  });
}
