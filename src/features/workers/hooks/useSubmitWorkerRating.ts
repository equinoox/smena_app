// Mutation hook for a venue owner submitting (or editing) their rating of a worker.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import {
  submitWorkerRating,
  type WorkerRatingInput,
} from "@features/workers/services/workersService";

export function useSubmitWorkerRating(workerId: string) {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkerRatingInput) =>
      submitWorkerRating(workerId, user!.id, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.workerProfile(workerId) });
      client.invalidateQueries({ queryKey: queryKeys.allWorkers() });
      client.invalidateQueries({ queryKey: queryKeys.availableWorkers() });
      client.invalidateQueries({
        queryKey: queryKeys.myWorkerRating(workerId, user?.id ?? "anon"),
      });
    },
  });
}
