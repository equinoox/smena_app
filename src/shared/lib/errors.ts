// Shared error-message extraction (toasts + inline form errors both need this).
// Supabase/Postgrest errors are plain objects with a `message` field, not real
// `Error` instances — `err instanceof Error` misses them and silently falls back
// to a generic string, so both shapes are handled here.
export function extractErrorMessage(err: unknown): string | null {
  const message = rawErrorMessage(err);
  // Some error types (e.g. Supabase's AuthRetryableFetchError on a 5xx) put the raw
  // fetch response — a JSON blob — in `.message` instead of a human-readable string.
  // Never surface that verbatim; let the caller fall back to a generic message instead.
  if (message && message.trim().startsWith("{")) return null;
  return message;
}

function rawErrorMessage(err: unknown): string | null {
  if (err instanceof Error && err.message) return err.message;
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string" &&
    (err as { message: string }).message
  ) {
    return (err as { message: string }).message;
  }
  return null;
}
