// Applications data access — apply to a listing, check own application, count per listing.
import { supabase } from "@shared/lib/supabase";
import type { Application } from "@shared/types/database.types";

export async function applyToListing(
  listingId: string,
  workerId: string,
  message?: string,
): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .insert({ listing_id: listingId, worker_id: workerId, message: message ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// Returns the worker's application for a listing, or null if they haven't applied.
export async function fetchMyApplication(
  listingId: string,
  workerId: string,
): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("listing_id", listingId)
    .eq("worker_id", workerId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function countListingApplications(
  listingId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);
  if (error) throw error;
  return count ?? 0;
}
