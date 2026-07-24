// Display formatting helpers shared across features (pay, employment tag styling).
import type { EmploymentType, Listing } from "@shared/types/database.types";
import type { TranslationKey } from "@shared/i18n/I18nProvider";

type Translate = (key: TranslationKey) => string;

// e.g. "800 RSD/hr" — returns null when no pay is set.
export function formatPay(listing: Listing, t: Translate): string | null {
  if (listing.pay_amount == null) return null;
  const amount = Number(listing.pay_amount).toLocaleString("sr-RS");
  const period = t(`pay.${listing.pay_period}` as TranslationKey);
  return `${amount} ${listing.currency}${period}`;
}

// "16:00–24:00" from timestamps; null when no start time is set.
export function formatTimeRange(
  startIso: string | null,
  endIso: string | null,
): string | null {
  if (!startIso) return null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("sr-RS", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return endIso ? `${fmt(startIso)}–${fmt(endIso)}` : fmt(startIso);
}

// Chip variant matching the design's employment-type tag colors:
// full-time = green (success); fill-in and part-time = orange (warning).
export function employmentChipVariant(
  type: EmploymentType,
): "success" | "warning" {
  return type === "full_time" ? "success" : "warning";
}
