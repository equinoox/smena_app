// Profile data access — worker-specific profile fields (positions + experience),
// editable after sign-up from the profile tab rather than only at registration.
import { supabase } from "@shared/lib/supabase";
import type { ExperienceLevel, WorkerRole } from "@shared/types/database.types";

export async function updateWorkerProfile(
  userId: string,
  input: { workerRoles: WorkerRole[]; experienceLevel: ExperienceLevel },
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      worker_roles: input.workerRoles,
      experience_level: input.experienceLevel,
    })
    .eq("id", userId);
  if (error) throw error;
}
