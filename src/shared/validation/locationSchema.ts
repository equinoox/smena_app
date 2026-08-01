// Zod schema for a map-picked LocationValue. Shared by auth and profile-edit forms
// so both sign-up and post-signup editing validate/store location the same way.
import { z } from "zod";
import type { TranslationKey } from "@shared/i18n/I18nProvider";

type Translate = (key: TranslationKey) => string;

export function locationSchema(t: Translate) {
  return z.object({
    address: z.string().min(1, t("validation.required")),
    city: z.string().nullable(),
    lat: z.number(),
    lng: z.number(),
  });
}
