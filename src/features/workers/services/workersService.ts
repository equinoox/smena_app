// Worker directory data access — fetching a single worker's profile by id, for the
// venue-facing worker detail screen.
import { supabase } from "@shared/lib/supabase";
import type { Profile } from "@shared/types/database.types";

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
