// Venue home dashboard stats: active listing count + this-week applications/views.
import { supabase } from "@shared/lib/supabase";
import { countApplicationsSince } from "@features/listings/services/applicationsService";
import { countViewsSince } from "@features/listings/services/listingViewsService";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type VenueStats = {
  activeListings: number;
  weeklyApplications: number;
  weeklyViews: number;
};

export async function fetchVenueStats(venueId: string): Promise<VenueStats> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, status")
    .eq("venue_id", venueId);
  if (error) throw error;

  const listingIds = (data ?? []).map((row) => row.id);
  const activeListings = (data ?? []).filter((row) => row.status === "open").length;
  const sinceIso = new Date(Date.now() - WEEK_MS).toISOString();

  const [weeklyApplications, weeklyViews] = await Promise.all([
    countApplicationsSince(listingIds, sinceIso),
    countViewsSince(listingIds, sinceIso),
  ]);

  return { activeListings, weeklyApplications, weeklyViews };
}
