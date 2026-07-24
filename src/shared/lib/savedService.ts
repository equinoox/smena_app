// Saved-listings data access (shared: consumed by home, listings, and the saved screen).
import { supabase } from "@shared/lib/supabase";
import type { ListingWithVenue } from "@shared/types/domain.types";

const VENUE_SELECT = "id, name, venue_type, city, logo_url, lat, lng";

export async function fetchSavedListings(
  workerId: string,
): Promise<ListingWithVenue[]> {
  const { data, error } = await supabase
    .from("saved_listings")
    .select(`listing:listings(*, venue:venues(${VENUE_SELECT}))`)
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? [])
    .map((row) => (row as unknown as { listing: ListingWithVenue | null }).listing)
    .filter((listing): listing is ListingWithVenue => listing != null);
}

export async function fetchSavedIds(workerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("worker_id", workerId);
  if (error) throw error;
  return (data ?? []).map((row) => row.listing_id);
}

export async function saveListing(workerId: string, listingId: string) {
  const { error } = await supabase
    .from("saved_listings")
    .insert({ worker_id: workerId, listing_id: listingId });
  if (error) throw error;
}

export async function unsaveListing(workerId: string, listingId: string) {
  const { error } = await supabase
    .from("saved_listings")
    .delete()
    .eq("worker_id", workerId)
    .eq("listing_id", listingId);
  if (error) throw error;
}
