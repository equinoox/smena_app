// React Query hooks for browsing listings, a single listing, and a venue's own listings.
import { useQuery } from "@tanstack/react-query";
import { queryKeys, type ListingFilters } from "@shared/lib/queryKeys";
import {
  fetchListingById,
  fetchListings,
  fetchVenueListings,
} from "@features/listings/services/listingsService";

export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: queryKeys.listings(filters),
    queryFn: () => fetchListings(filters),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: () => fetchListingById(id),
    enabled: !!id,
  });
}

export function useVenueListings(venueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.venueListings(venueId ?? "none"),
    queryFn: () => fetchVenueListings(venueId!),
    enabled: !!venueId,
  });
}
