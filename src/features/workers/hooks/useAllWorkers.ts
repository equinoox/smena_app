// Fetches every worker (available-first), for the venue-facing "browse all workers" screen.
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@shared/lib/queryKeys";
import { fetchAllWorkers } from "@features/workers/services/workersService";

export function useAllWorkers() {
  return useQuery({
    queryKey: queryKeys.allWorkers(),
    queryFn: fetchAllWorkers,
  });
}
