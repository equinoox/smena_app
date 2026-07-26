// Home dashboard data access — worker profiles marked "available for work", shown to
// venues in the "Available workers" section. No geo/radius filtering yet — every
// available worker is returned; that ranking comes later.
import { supabase } from "@shared/lib/supabase";
import type { Profile } from "@shared/types/database.types";

export async function fetchAvailableWorkers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "worker")
    .eq("is_available", true)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
