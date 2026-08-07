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
// `venue` is null for a venue-less (temporary-job) listing — `owner` is the posting
// profile, used as the display/contact fallback in that case.
export type ListingWithVenue = Listing & {
  venue: VenueSummary | null;
  owner: Pick<Profile, "id" | "full_name" | "avatar_url" | "phone"> | null;
};

// An application joined with the applying worker's profile (venue-facing applicant list).
export type ApplicationWithWorker = Application & {
  worker: Profile | null;
};
