// Listings data access — browse (with venue join), single listing, a venue's own listings,
// and creating/updating/deleting a listing (the venue's "post a shift" form). A listing may
// have no venue at all (a one-off temporary-job ad) — `venue` in the results is then null
// and `owner` (the posting profile) is the display/contact fallback.
import { supabase } from "@shared/lib/supabase";
import type { ListingFilters } from "@shared/lib/queryKeys";
import type {
  EmploymentType,
  PayPeriod,
  WorkerRole,
} from "@shared/types/database.types";
import type { ListingWithVenue } from "@shared/types/domain.types";
import type { LocationValue } from "@shared/types/location.types";

const VENUE_SELECT =
  "id, name, venue_type, city, address, logo_url, cover_photo_url, lat, lng, phone, rating_avg, rating_count";
const OWNER_SELECT = "id, full_name, avatar_url, phone";

export async function fetchListings(
  filters: ListingFilters,
): Promise<ListingWithVenue[]> {
  // venue is a left join by default so venue-less listings still come back (with
  // venue: null). !inner is only added when searching by venue name — that filter
  // can't match a venue-less listing anyway, so requiring the join there is correct
  // (see the PostgREST note: filtering an embedded resource's column only actually
  // excludes non-matching top-level rows when the embed is `!inner`).
  const venueEmbed = filters.search?.trim() ? `venues!inner` : `venues`;
  let query = supabase
    .from("listings")
    .select(`*, venue:${venueEmbed}(${VENUE_SELECT}), owner:profiles(${OWNER_SELECT})`)
    .eq("status", "open")
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.employmentType && filters.employmentType !== "all") {
    query = query.eq("employment_type", filters.employmentType);
  }
  if (filters.roleNeeded) {
    query = query.eq("role_needed", filters.roleNeeded);
  }
  if (filters.noVenueOnly) {
    query = query.is("venue_id", null);
  }
  if (filters.search?.trim()) {
    query = query.ilike("venue.name", `%${filters.search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ListingWithVenue[];
}

// Total open listings across the platform (worker listings screen header count).
export async function countOpenListings(): Promise<number> {
  const { count, error } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");
  if (error) throw error;
  return count ?? 0;
}

export async function fetchListingById(
  id: string,
): Promise<ListingWithVenue | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(`*, venue:venues(${VENUE_SELECT}, description), owner:profiles(${OWNER_SELECT})`)
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
    .select(`*, venue:venues(${VENUE_SELECT}), owner:profiles(${OWNER_SELECT})`)
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ListingWithVenue[];
}

// All of an owner's listings across every venue they run, plus any venue-less
// (temporary-job) listings they've posted — used by the "see all" / dashboard views
// that aren't scoped to one specific venue.
export async function fetchVenueListingsByOwner(
  ownerId: string,
): Promise<ListingWithVenue[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(`*, venue:venues(${VENUE_SELECT}), owner:profiles(${OWNER_SELECT})`)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ListingWithVenue[];
}

export type CreateListingInput = {
  ownerId: string;
  // Omitted for a venue-less (temporary-job) listing.
  venueId?: string;
  title: string;
  roleNeeded: WorkerRole;
  employmentType: EmploymentType;
  description?: string;
  payAmount?: number;
  payPeriod: PayPeriod;
  startHour?: number;
  endHour?: number;
  isUrgent: boolean;
  requirements: string[];
  // The one-off job location — only used (and only meaningful) when venueId is omitted.
  location?: LocationValue;
};

export async function createListing(input: CreateListingInput) {
  const { data, error } = await supabase
    .from("listings")
    .insert({
      owner_id: input.ownerId,
      venue_id: input.venueId ?? null,
      title: input.title,
      role_needed: input.roleNeeded,
      employment_type: input.employmentType,
      description: input.description ?? null,
      pay_amount: input.payAmount ?? null,
      pay_period: input.payPeriod,
      start_hour: input.startHour ?? null,
      end_hour: input.endHour ?? null,
      is_urgent: input.isUrgent,
      requirements: input.requirements,
      address: input.location?.address ?? null,
      city: input.location?.city ?? null,
      lat: input.location?.lat ?? null,
      lng: input.location?.lng ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Same shape as create, minus venueId/ownerId — a listing never changes owning venue
// or owner. `location` is still editable (relevant only for a venue-less listing).
export type UpdateListingInput = Omit<CreateListingInput, "venueId" | "ownerId">;

export async function updateListing(id: string, input: UpdateListingInput) {
  const { data, error } = await supabase
    .from("listings")
    .update({
      title: input.title,
      role_needed: input.roleNeeded,
      employment_type: input.employmentType,
      description: input.description ?? null,
      pay_amount: input.payAmount ?? null,
      pay_period: input.payPeriod,
      start_hour: input.startHour ?? null,
      end_hour: input.endHour ?? null,
      is_urgent: input.isUrgent,
      requirements: input.requirements,
      ...(input.location
        ? {
            address: input.location.address,
            city: input.location.city,
            lat: input.location.lat,
            lng: input.location.lng,
          }
        : {}),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}
