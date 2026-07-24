// Composite/joined shapes returned by services (Supabase relational selects).
import type { Listing, Venue } from "./database.types";

export type VenueSummary = Pick<
  Venue,
  "id" | "name" | "venue_type" | "city" | "logo_url" | "lat" | "lng"
>;

// A listing joined with its parent venue (as returned by listings queries).
export type ListingWithVenue = Listing & {
  venue: VenueSummary | null;
};
