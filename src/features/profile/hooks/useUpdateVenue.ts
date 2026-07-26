// Mutation hook for saving edits to the signed-in venue owner's business profile.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import {
  updateVenue,
  type UpdateVenueInput,
} from "@features/profile/services/venueProfileService";

export function useUpdateVenue(venueId: string | undefined) {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateVenueInput) => updateVenue(venueId!, user!.id, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.myVenue(user?.id ?? "anon") });
    },
  });
}
