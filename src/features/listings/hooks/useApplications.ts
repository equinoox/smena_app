// Hooks for the worker application flow: check own application, apply, count per listing.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import {
  applyToListing,
  countListingApplications,
  fetchMyApplication,
} from "@features/listings/services/applicationsService";

export function useMyApplication(listingId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["application", listingId, user?.id ?? "anon"],
    queryFn: () => fetchMyApplication(listingId, user!.id),
    enabled: !!user && !!listingId,
  });
}

export function useApply(listingId: string) {
  const { user } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (message?: string) =>
      applyToListing(listingId, user!.id, message),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ["application", listingId, user?.id ?? "anon"],
      });
      client.invalidateQueries({
        queryKey: queryKeys.listingApplications(listingId),
      });
    },
  });
}

export function useListingApplicationsCount(listingId: string) {
  return useQuery({
    queryKey: queryKeys.listingApplications(listingId),
    queryFn: () => countListingApplications(listingId),
    enabled: !!listingId,
  });
}
