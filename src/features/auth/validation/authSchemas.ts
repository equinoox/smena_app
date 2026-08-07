// Zod schemas for auth forms. Factories take the translator so messages are localized.
import { z } from "zod";
import { EXPERIENCE_LEVELS, VENUE_TYPES, WORKER_ROLES } from "@shared/lib/roleIcon";
import { locationSchema } from "@shared/validation/locationSchema";
import type { TranslationKey } from "@shared/i18n/I18nProvider";

type Translate = (key: TranslationKey) => string;

export function signInSchema(t: Translate) {
  return z.object({
    email: z.email({ message: t("validation.emailInvalid") }),
    password: z.string().min(8, t("validation.passwordMin")),
  });
}
export type SignInValues = z.infer<ReturnType<typeof signInSchema>>;

function baseSignUp(t: Translate) {
  return {
    email: z.email({ message: t("validation.emailInvalid") }),
    password: z.string().min(8, t("validation.passwordMin")),
    confirmPassword: z.string(),
    fullName: z.string().min(2, t("validation.nameMin")),
    phone: z.string().optional(),
  };
}

// Step 1 (credentials) fields — used to trigger partial validation before advancing.
export const WORKER_STEP1_FIELDS = [
  "fullName",
  "email",
  "password",
  "confirmPassword",
] as const;

// Step 2 (profile basics) fields — used to trigger partial validation before advancing.
// experienceLevel moved to step 3, alongside position — validated at final submit only.
export const WORKER_STEP2_FIELDS = ["location", "phone"] as const;

export function workerSignUpSchema(t: Translate) {
  return z
    .object({
      ...baseSignUp(t),
      phone: z.string().min(1, t("validation.required")),
      location: locationSchema(t),
      experienceLevel: z.enum(EXPERIENCE_LEVELS, {
        message: t("validation.required"),
      }),
      avatarUri: z.string().optional(),
      // Step 3 — bio + skills + the positions the worker takes shifts for.
      bio: z.string().optional(),
      skills: z.array(z.string()),
      workerRoles: z
        .array(z.enum(WORKER_ROLES))
        .min(1, t("validation.selectPosition"))
        .max(3, t("validation.selectPositionMax")),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t("validation.passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type WorkerSignUpValues = z.infer<ReturnType<typeof workerSignUpSchema>>;

// Step 1 (contact person) fields — used to trigger partial validation before advancing.
export const VENUE_STEP1_FIELDS = [
  "fullName",
  "email",
  "password",
  "confirmPassword",
] as const;

// Step 2 (venue identity) fields — used to trigger partial validation before advancing.
export const VENUE_STEP2_FIELDS = ["venueName", "venueType"] as const;

export function venueSignUpSchema(t: Translate) {
  return z
    .object({
      email: z.email({ message: t("validation.emailInvalid") }),
      password: z.string().min(8, t("validation.passwordMin")),
      confirmPassword: z.string(),
      fullName: z.string().min(2, t("validation.nameMin")),
      ownerPhone: z.string().optional(),
      // Step 2 — venue details.
      venueName: z.string().min(2, t("validation.required")),
      venueType: z.enum(VENUE_TYPES),
      location: locationSchema(t),
      pib: z.string().min(1, t("validation.required")),
      phone: z.string().min(1, t("validation.required")),
      description: z.string().optional(),
      logoUri: z.string().optional(),
      coverPhotoUri: z.string().optional(),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t("validation.passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type VenueSignUpValues = z.infer<ReturnType<typeof venueSignUpSchema>>;
