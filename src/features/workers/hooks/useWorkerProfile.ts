// Fetches a single worker's profile by id, for the venue-facing worker detail screen.
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@shared/lib/queryKeys";
import { fetchWorkerById } from "@features/workers/services/workersService";

export function useWorkerProfile(id: string) {
  return useQuery({
    queryKey: queryKeys.workerProfile(id),
    queryFn: () => fetchWorkerById(id),
    enabled: !!id,
  });
}
