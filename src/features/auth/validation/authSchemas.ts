// Zod schemas for auth forms. Factories take the translator so messages are localized.
import { z } from "zod";
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
    .object(baseSignUp(t))
    .refine((v) => v.password === v.confirmPassword, {
      message: t("validation.passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type WorkerSignUpValues = z.infer<ReturnType<typeof workerSignUpSchema>>;

export function venueSignUpSchema(t: Translate) {
  return z
    .object({
      ...baseSignUp(t),
      venueName: z.string().min(2, t("validation.required")),
      venueType: z.enum(VENUE_TYPES),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t("validation.passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type VenueSignUpValues = z.infer<ReturnType<typeof venueSignUpSchema>>;
