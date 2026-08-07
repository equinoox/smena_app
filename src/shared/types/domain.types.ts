// Composite/joined shapes returned by services (Supabase relational selects).
import type { Application, Listing, Profile, Venue } from "./database.types";

export type VenueSummary = Pick<
  Venue,
  | "id"
  | "name"
  | "venue_type"
  | "city"
  | "address"
  | "logo_url"
  | "cover_photo_url"
  | "lat"
  | "lng"
  | "phone"
  | "rating_avg"
  | "rating_count"
>;

// A listing joined with its parent venue (as returned by listings queries).
export type ListingWithVenue = Listing & {
  venue: VenueSummary | null;
};

// An application joined with the applying worker's profile (venue-facing applicant list).
export type ApplicationWithWorker = Application & {
  worker: Profile | null;
};
