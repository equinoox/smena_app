// Hooks for listing views: log a view (worker opens a listing) and batched per-listing counts.
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@shared/lib/queryKeys";
import { fetchApplicationCountsByListing } from "@features/listings/services/applicationsService";
import {
  countListingViews,
  fetchViewCountsByListing,
  logListingView,
} from "@features/listings/services/listingViewsService";

export function useLogListingView() {
  return useMutation({
    mutationFn: (vars: { listingId: string; viewerId: string }) =>
      logListingView(vars.listingId, vars.viewerId),
  });
}

// Single-listing view count (venue's own listing detail screen).
export function useListingViewsCount(listingId: string) {
  return useQuery({
    queryKey: queryKeys.listingViews(listingId),
    queryFn: () => countListingViews(listingId),
    enabled: !!listingId,
  });
}

export type ListingCounts = { applications: number; views: number };

// Batched applicant + view counts for a set of listings (venue home listing rows).
export function useListingCounts(listingIds: string[]) {
  return useQuery({
    queryKey: queryKeys.listingCounts(listingIds),
    queryFn: async () => {
      const [applications, views] = await Promise.all([
        fetchApplicationCountsByListing(listingIds),
        fetchViewCountsByListing(listingIds),
      ]);
      const counts: Record<string, ListingCounts> = {};
      for (const id of listingIds) {
        counts[id] = {
          applications: applications[id] ?? 0,
          views: views[id] ?? 0,
        };
      }
      return counts;
    },
    enabled: listingIds.length > 0,
  });
}
