// TanStack Query client with centralized error handling.
// The toast layer registers a handler via setQueryErrorHandler (see ToastProvider bridge).
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

type ErrorHandler = (error: unknown) => void;

let handleError: ErrorHandler = () => {};

// Called once by the app so query/mutation failures can surface as toasts.
export function setQueryErrorHandler(handler: ErrorHandler) {
  handleError = handler;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleError(error),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
