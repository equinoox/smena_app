// React Query hooks for browsing listings, a single listing, a venue's own listings,
// and creating/updating/deleting a listing.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, type ListingFilters } from "@shared/lib/queryKeys";
import {
  countOpenListings,
  createListing,
  deleteListing,
  fetchListingById,
  fetchListings,
  fetchVenueListings,
  updateListing,
  type CreateListingInput,
  type UpdateListingInput,
} from "@features/listings/services/listingsService";
import { fetchVenueStats } from "@features/listings/services/venueStatsService";

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

export function useOpenListingsCount() {
  return useQuery({
    queryKey: queryKeys.openListingsCount(),
    queryFn: () => countOpenListings(),
  });
}

export function useVenueStats(venueId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.venueStats(venueId ?? "none"),
    queryFn: () => fetchVenueStats(venueId!),
    enabled: !!venueId,
  });
}

export function useCreateListing(venueId: string | undefined) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateListingInput) => createListing(input),
    onSuccess: () => {
      if (!venueId) return;
      client.invalidateQueries({ queryKey: queryKeys.venueListings(venueId) });
      client.invalidateQueries({ queryKey: queryKeys.venueStats(venueId) });
    },
  });
}

export function useUpdateListing(venueId: string | undefined) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateListingInput }) =>
      updateListing(vars.id, vars.input),
    onSuccess: (_data, vars) => {
      client.invalidateQueries({ queryKey: queryKeys.listing(vars.id) });
      if (!venueId) return;
      client.invalidateQueries({ queryKey: queryKeys.venueListings(venueId) });
    },
  });
}

export function useDeleteListing(venueId: string | undefined) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      if (!venueId) return;
      client.invalidateQueries({ queryKey: queryKeys.venueListings(venueId) });
      client.invalidateQueries({ queryKey: queryKeys.venueStats(venueId) });
    },
  });
}
