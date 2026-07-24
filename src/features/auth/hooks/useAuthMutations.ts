// Auth mutations (sign-in / sign-up). Errors surface via the global React Query toast handler.
// On success the auth state change updates the session and the root layout redirects.
import { useMutation } from "@tanstack/react-query";
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
  });
}

export function useSignUpWorker() {
  return useMutation({
    mutationFn: (input: WorkerSignUpInput) => signUpWorker(input),
  });
}

export function useSignUpVenue() {
  return useMutation({
    mutationFn: (input: VenueSignUpInput) => signUpVenue(input),
  });
}
