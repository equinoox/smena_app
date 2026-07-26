// Fetches workers currently marked available for work, for the venue home dashboard.
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@shared/lib/queryKeys";
import { fetchAvailableWorkers } from "@features/home/services/homeService";

export function useAvailableWorkers() {
  return useQuery({
    queryKey: queryKeys.availableWorkers(),
    queryFn: fetchAvailableWorkers,
  });
}
