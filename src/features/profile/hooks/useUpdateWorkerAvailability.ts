// Mutation hook for toggling the worker's "available for shifts" status.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import { updateWorkerAvailability } from "@features/profile/services/profileService";

export function useUpdateWorkerAvailability() {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      updateWorkerAvailability(user!.id, isAvailable),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? "anon") });
    },
  });
}
