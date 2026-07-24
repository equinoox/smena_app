// Saved-listings hooks (shared): full list, saved-id set, and a save/unsave toggle.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import {
  fetchSavedIds,
  fetchSavedListings,
  saveListing,
  unsaveListing,
} from "@shared/lib/savedService";

export function useSavedListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.savedListings(user?.id ?? "anon"),
    queryFn: () => fetchSavedListings(user!.id),
    enabled: !!user,
  });
}

export function useSavedIds() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [...queryKeys.savedListings(user?.id ?? "anon"), "ids"],
    queryFn: () => fetchSavedIds(user!.id),
    enabled: !!user,
  });
  return new Set(query.data ?? []);
}

export function useToggleSaved() {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, saved }: { listingId: string; saved: boolean }) =>
      saved
        ? unsaveListing(user!.id, listingId)
        : saveListing(user!.id, listingId),
    onSuccess: () => {
      const key = queryKeys.savedListings(user?.id ?? "anon");
      client.invalidateQueries({ queryKey: key });
      client.invalidateQueries({ queryKey: [...key, "ids"] });
    },
  });
}
