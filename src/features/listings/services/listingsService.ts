// Listings data access — browse (with venue join), single listing, a venue's own listings,
// and creating/updating/deleting a listing (the venue's "post a shift" form).
import { supabase } from "@shared/lib/supabase";
import type { ListingFilters } from "@shared/lib/queryKeys";
import type {
  EmploymentType,
  PayPeriod,
  WorkerRole,
} from "@shared/types/database.types";
import type { ListingWithVenue } from "@shared/types/domain.types";

const VENUE_SELECT =
  "id, name, venue_type, city, address, logo_url, cover_photo_url, lat, lng, phone, rating_avg, rating_count";

export async function fetchListings(
  filters: ListingFilters,
): Promise<ListingWithVenue[]> {
  // !inner so a filter on the embedded venue (e.g. name search) actually excludes
  // non-matching listings instead of just shaping the embed (every listing has a
  // venue via the FK, so this never drops rows that would otherwise be included).
  let query = supabase
    .from("listings")
    .select(`*, venue:venues!inner(${VENUE_SELECT})`)
    .eq("status", "open")
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.employmentType && filters.employmentType !== "all") {
    query = query.eq("employment_type", filters.employmentType);
  }
  if (filters.roleNeeded) {
    query = query.eq("role_needed", filters.roleNeeded);
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
    .select(`*, venue:venues(${VENUE_SELECT}, description)`)
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

// Same as fetchVenueListings, but keyed by the venue's owner id instead of the venue's
// own id — lets the venue-profile screen fetch its venue and that venue's listings in
// parallel (both keyed off the signed-in user) instead of waiting for the venue fetch
// to resolve first before it even knows which venue_id to filter on.
export async function fetchVenueListingsByOwner(
  ownerId: string,
): Promise<ListingWithVenue[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(`*, venue:venues!inner(${VENUE_SELECT})`)
    .eq("venue.owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ListingWithVenue[];
}

export type CreateListingInput = {
  venueId: string;
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
};

export async function createListing(input: CreateListingInput) {
  const { data, error } = await supabase
    .from("listings")
    .insert({
      venue_id: input.venueId,
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
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Same shape as create, minus venueId — a listing never changes owning venue.
export type UpdateListingInput = Omit<CreateListingInput, "venueId">;

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
