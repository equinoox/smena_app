// Mutation hook for saving the worker's positions + experience level from their profile.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import type { ExperienceLevel, WorkerRole } from "@shared/types/database.types";
import { updateWorkerProfile } from "@features/profile/services/profileService";

export function useUpdateWorkerProfile() {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { workerRoles: WorkerRole[]; experienceLevel: ExperienceLevel }) =>
      updateWorkerProfile(user!.id, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? "anon") });
    },
  });
}
