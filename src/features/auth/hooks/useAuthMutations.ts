// Auth mutations (sign-in / sign-up). Errors surface via the global React Query toast handler.
// On success the auth state change updates the session and the root layout redirects.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@shared/lib/queryKeys";
import {
  signInWithEmail,
  signUpVenue,
  signUpWorker,
  type VenueSignUpInput,
  type WorkerSignUpInput,
} from "@features/auth/services/authService";

export function useSignIn() {
  return useMutation({
    mutationFn: (vars: { email: string; password: string }) =>
      signInWithEmail(vars.email, vars.password),
    // Shown inline on the sign-in screen instead of the global error toast.
    meta: { suppressToast: true },
  });
}

export function useSignUpWorker() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkerSignUpInput) => signUpWorker(input),
    onSuccess: (data) => {
      // Seed the profile cache with the row we just created — the worker landing on
      // their own Profile tab right after signing up shouldn't have to wait for a
      // fresh network fetch of data we already have in hand.
      if (data.profile) {
        client.setQueryData(queryKeys.profile(data.profile.id), data.profile);
      }
    },
  });
}

export function useSignUpVenue() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: VenueSignUpInput) => signUpVenue(input),
    onSuccess: (data) => {
      // Same idea as useSignUpWorker — seed the venue list (and empty listings list) so
      // "Profil lokala" renders instantly instead of waiting on a first fetch. An owner
      // who skipped venue creation still gets an (empty) venues list seeded, rather than
      // leaving it to load from a query that would just return the same empty result.
      const ownerId = data.venue?.owner_id ?? data.user?.id;
      if (ownerId) {
        client.setQueryData(queryKeys.myVenues(ownerId), data.venue ? [data.venue] : []);
        client.setQueryData(queryKeys.venueListingsByOwner(ownerId), []);
      }
    },
  });
}
