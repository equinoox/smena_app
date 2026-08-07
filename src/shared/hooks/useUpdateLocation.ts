// Mutation hooks backing the topbar "change location" flow (EditableLocationRow) for
// both roles — worker's own home address, and a venue owner's business address.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import {
  updateVenueLocation,
  updateWorkerLocation,
} from "@shared/lib/locationMutationService";
import { queryKeys } from "@shared/lib/queryKeys";
import type { LocationValue } from "@shared/types/location.types";

export function useUpdateWorkerLocation() {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (location: LocationValue) => updateWorkerLocation(user!.id, location),
    // Returning this promise makes mutateAsync() wait for the refetch too, not just the
    // write — so callers that close a "saving" UI on success show the new location-
    // derived data (e.g. nearby listings) immediately, instead of a stale flash.
    onSuccess: () => {
      return client.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? "anon") });
    },
  });
}

export function useUpdateVenueLocation(venueId: string | undefined) {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (location: LocationValue) => updateVenueLocation(venueId!, location),
    onSuccess: () => {
      return client.invalidateQueries({ queryKey: queryKeys.myVenues(user?.id ?? "anon") });
    },
  });
}
