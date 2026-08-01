// Display formatting helpers shared across features (pay, employment tag styling).
import type { EmploymentType, Listing } from "@shared/types/database.types";
import type { Language, TranslationKey } from "@shared/i18n/I18nProvider";

type Translate = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

// e.g. "800 RSD/hr" — returns null when no pay is set.
export function formatPay(listing: Listing, t: Translate): string | null {
  if (listing.pay_amount == null) return null;
  const amount = Number(listing.pay_amount).toLocaleString("sr-RS");
  const period = t(`pay.${listing.pay_period}` as TranslationKey);
  return `${amount} ${listing.currency}${period}`;
}

// "16:00–24:00" (sr, 24h) or "4:00 PM–12:00 AM" (en, 12h) from timestamps;
// null when no start time is set.
export function formatTimeRange(
  startIso: string | null,
  endIso: string | null,
  language: Language,
): string | null {
  if (!startIso) return null;
  const locale = language === "en" ? "en-US" : "sr-RS";
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: language === "en",
    });
  return endIso ? `${fmt(startIso)}–${fmt(endIso)}` : fmt(startIso);
}

// A single hour (0-24, 24 meaning midnight/end of day) as shown in the shift-time
// picker — "16h" (sr, 24h) or "4 PM" (en, 12h).
export function formatHour(hour: number, language: Language): string {
  if (language !== "en") return `${String(hour).padStart(2, "0")}h`;
  const h24 = hour % 24;
  const period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12} ${period}`;
}

// Chip variant matching the design's employment-type tag colors:
// full-time = green (success); fill-in and part-time = orange (warning).
export function employmentChipVariant(
  type: EmploymentType,
): "success" | "warning" {
  return type === "full_time" ? "success" : "warning";
}

// "Objavljeno pre 2h" / "Objavljeno juče" / "Objavljeno pre 3 dana" — relative post age.
export function formatPostedAt(createdAtIso: string, t: Translate): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAtIso).getTime()) / 60000),
  );
  if (minutes < 60) {
    return t("listings.postedMinutesAgo", { count: minutes });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t("listings.postedHoursAgo", { count: hours });
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return t("listings.postedYesterday");
  return t("listings.postedDaysAgo", { count: days });
}

// "Knez Mihailova 5, Beograd" — joins address + city, omitting whichever is missing;
// null when both are missing.
export function formatLocation(
  address: string | null | undefined,
  city: string | null | undefined,
): string | null {
  const parts = [address, city].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

// "1.2 km" — distance chip label.
export function formatDistanceKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

// "Sačuvano pre 2h" / "Sačuvano juče" / "Sačuvano pre 3 dana" — relative save age.
export function formatSavedAt(savedAtIso: string, t: Translate): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(savedAtIso).getTime()) / 60000),
  );
  if (minutes < 60) {
    return t("saved.savedMinutesAgo", { count: minutes });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t("saved.savedHoursAgo", { count: hours });
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return t("saved.savedYesterday");
  return t("saved.savedDaysAgo", { count: days });
}
