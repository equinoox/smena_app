// Serbian mobile phone helpers — every phone field in the app enters only the local
// digits after a fixed "+381 6" prefix (see PhoneInput); these convert to/from the
// full value that actually gets stored.
const SERBIAN_MOBILE_PREFIX = "+3816";

export function toSerbianPhone(localDigits: string): string {
  return `${SERBIAN_MOBILE_PREFIX}${localDigits.replace(/\D/g, "")}`;
}

export function fromSerbianPhone(stored: string | null | undefined): string {
  if (!stored) return "";
  return stored.startsWith(SERBIAN_MOBILE_PREFIX)
    ? stored.slice(SERBIAN_MOBILE_PREFIX.length)
    : stored;
}
