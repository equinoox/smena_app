// Venue directory data access — fetching a single venue by id, for the worker-facing
// venue detail screen (reached by tapping a venue's name on a listing), and worker →
// venue ratings.
import { supabase } from "@shared/lib/supabase";
import type { Venue, VenueRating } from "@shared/types/database.types";

export async function fetchVenueById(id: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type VenueRatingInput = {
  conditions: number;
  atmosphere: number;
  benefits: number;
};

// The worker's own existing rating of this venue, if any — prefills the edit form.
export async function fetchMyVenueRating(
  venueId: string,
  raterId: string,
): Promise<VenueRating | null> {
  const { data, error } = await supabase
    .from("venue_ratings")
    .select("*")
    .eq("venue_id", venueId)
    .eq("rater_id", raterId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Upsert so resubmitting (one rater per venue) edits the existing rating in place.
export async function submitVenueRating(
  venueId: string,
  raterId: string,
  input: VenueRatingInput,
): Promise<VenueRating> {
  const { data, error } = await supabase
    .from("venue_ratings")
    .upsert(
      { venue_id: venueId, rater_id: raterId, ...input },
      { onConflict: "venue_id,rater_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
