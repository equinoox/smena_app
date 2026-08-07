// Fetches the signed-in venue owner's own existing rating of a worker, if any —
// used to prefill the RateWorkerModal in edit mode.
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@shared/hooks/useAuth";
import { queryKeys } from "@shared/lib/queryKeys";
import { fetchMyWorkerRating } from "@features/workers/services/workersService";

export function useMyWorkerRating(workerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.myWorkerRating(workerId, user?.id ?? "anon"),
    queryFn: () => fetchMyWorkerRating(workerId, user!.id),
    enabled: !!user && !!workerId,
  });
}
