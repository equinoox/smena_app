// Zod schemas for auth forms. Factories take the translator so messages are localized.
import { z } from "zod";
import { EXPERIENCE_LEVELS } from "@shared/lib/roleIcon";
import type { TranslationKey } from "@shared/i18n/I18nProvider";

type Translate = (key: TranslationKey) => string;

const VENUE_TYPES = ["cafe", "bar", "restaurant", "club", "bakery"] as const;

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
    city: z.string().optional(),
  };
}

export function workerSignUpSchema(t: Translate) {
  return z
    .object({
      ...baseSignUp(t),
      phone: z.string().min(1, t("validation.required")),
      city: z.string().min(1, t("validation.required")),
      experienceLevel: z.enum(EXPERIENCE_LEVELS, {
        message: t("validation.required"),
      }),
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

export function venueSignUpSchema(t: Translate) {
  return z
    .object({
      email: z.email({ message: t("validation.emailInvalid") }),
      password: z.string().min(8, t("validation.passwordMin")),
      confirmPassword: z.string(),
      fullName: z.string().min(2, t("validation.nameMin")),
      // Step 2 — venue details.
      venueName: z.string().min(2, t("validation.required")),
      venueType: z.enum(VENUE_TYPES),
      address: z.string().min(1, t("validation.required")),
      pib: z.string().min(1, t("validation.required")),
      phone: z.string().min(1, t("validation.required")),
      description: z.string().optional(),
      logoUri: z.string().optional(),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t("validation.passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type VenueSignUpValues = z.infer<ReturnType<typeof venueSignUpSchema>>;
