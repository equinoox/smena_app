// Zod schema for editing an existing venue's business details (edit-venue screen).
import { z } from "zod";
import { VENUE_TYPES } from "@shared/lib/roleIcon";
import type { TranslationKey } from "@shared/i18n/I18nProvider";

type Translate = (key: TranslationKey) => string;

export function venueEditSchema(t: Translate) {
  return z.object({
    venueName: z.string().min(2, t("validation.required")),
    venueType: z.enum(VENUE_TYPES),
    address: z.string().min(1, t("validation.required")),
    pib: z.string().min(1, t("validation.required")),
    phone: z.string().min(1, t("validation.required")),
    description: z.string().optional(),
    logoUri: z.string().optional(),
    coverPhotoUri: z.string().optional(),
  });
}
export type VenueEditValues = z.infer<ReturnType<typeof venueEditSchema>>;
