// Listing views data access — log a view (worker opens a listing) and read counts (venue stats).
import { supabase } from "@shared/lib/supabase";

export async function logListingView(
  listingId: string,
  viewerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("listing_views")
    .insert({ listing_id: listingId, viewer_id: viewerId });
  if (error) throw error;
}

// Views logged since `sinceIso`, across a set of listings (venue home stats).
export async function countViewsSince(
  listingIds: string[],
  sinceIso: string,
): Promise<number> {
  if (listingIds.length === 0) return 0;
  const { count, error } = await supabase
    .from("listing_views")
    .select("id", { count: "exact", head: true })
    .in("listing_id", listingIds)
    .gte("created_at", sinceIso);
  if (error) throw error;
  return count ?? 0;
}

// All-time view count for a single listing (venue's own listing detail screen).
export async function countListingViews(listingId: string): Promise<number> {
  const { count, error } = await supabase
    .from("listing_views")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);
  if (error) throw error;
  return count ?? 0;
}

// All-time view count per listing, batched (venue home listing rows).
export async function fetchViewCountsByListing(
  listingIds: string[],
): Promise<Record<string, number>> {
  if (listingIds.length === 0) return {};
  const { data, error } = await supabase
    .from("listing_views")
    .select("listing_id")
    .in("listing_id", listingIds);
  if (error) throw error;
  return (data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.listing_id] = (acc[row.listing_id] ?? 0) + 1;
    return acc;
  }, {});
}
