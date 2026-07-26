// Profile data access — worker-specific profile fields (positions + experience),
// editable after sign-up from the profile tab rather than only at registration.
import { uploadImage } from "@shared/lib/imageUpload";
import { supabase } from "@shared/lib/supabase";
import type {
  Database,
  ExperienceLevel,
  WorkerRole,
} from "@shared/types/database.types";

export async function updateWorkerProfile(
  userId: string,
  input: {
    workerRoles: WorkerRole[];
    experienceLevel: ExperienceLevel;
    avatarUri?: string; // local file picked this edit — only set if a new one was picked
  },
) {
  const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
    worker_roles: input.workerRoles,
    experience_level: input.experienceLevel,
  };

  if (input.avatarUri) {
    updates.avatar_url = await uploadImage("avatars", userId, "avatar", input.avatarUri);
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
  if (error) throw error;
}

export async function updateWorkerAvailability(userId: string, isAvailable: boolean) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_available: isAvailable })
    .eq("id", userId);
  if (error) throw error;
}
