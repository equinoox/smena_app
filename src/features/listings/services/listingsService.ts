// Listings data access — browse (with venue join), single listing, and a venue's own listings.
import { supabase } from "@shared/lib/supabase";
import type { ListingFilters } from "@shared/lib/queryKeys";
import type { ListingWithVenue } from "@shared/types/domain.types";

const VENUE_SELECT = "id, name, venue_type, city, logo_url, lat, lng";

export async function fetchListings(
  filters: ListingFilters,
): Promise<ListingWithVenue[]> {
  let query = supabase
    .from("listings")
    .select(`*, venue:venues(${VENUE_SELECT})`)
    .eq("status", "open")
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.employmentType && filters.employmentType !== "all") {
    query = query.eq("employment_type", filters.employmentType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ListingWithVenue[];
}

export async function fetchListingById(
  id: string,
): Promise<ListingWithVenue | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(`*, venue:venues(${VENUE_SELECT}, description, address)`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ListingWithVenue) ?? null;
}

export async function fetchVenueListings(
  venueId: string,
): Promise<ListingWithVenue[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(`*, venue:venues(${VENUE_SELECT})`)
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ListingWithVenue[];
}
