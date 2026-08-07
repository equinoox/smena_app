// Worker directory data access — fetching a single worker's profile by id, for the
// venue-facing worker detail screen, and venue → worker ratings.
import { supabase } from "@shared/lib/supabase";
import type { Profile, WorkerRating } from "@shared/types/database.types";

export async function fetchWorkerById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "worker")
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Every worker, available ones first (then most-recently-updated) — the venue-facing
// "browse all workers" screen. Position/experience/proximity filtering happens
// client-side (see WorkersFilterModal) since the dataset is small and unpaginated.
export async function fetchAllWorkers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "worker")
    .order("is_available", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type WorkerRatingInput = {
  productivity: number;
  reliability: number;
  quality: number;
};

// The venue's own existing rating of this worker, if any — prefills the edit form.
export async function fetchMyWorkerRating(
  workerId: string,
  raterId: string,
): Promise<WorkerRating | null> {
  const { data, error } = await supabase
    .from("worker_ratings")
    .select("*")
    .eq("worker_id", workerId)
    .eq("rater_id", raterId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Upsert so resubmitting (one rater per worker) edits the existing rating in place.
export async function submitWorkerRating(
  workerId: string,
  raterId: string,
  input: WorkerRatingInput,
): Promise<WorkerRating> {
  const { data, error } = await supabase
    .from("worker_ratings")
    .upsert(
      { worker_id: workerId, rater_id: raterId, ...input },
      { onConflict: "worker_id,rater_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
