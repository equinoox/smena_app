// Shared error-message extraction (toasts + inline form errors both need this).
// Supabase/Postgrest errors are plain objects with a `message` field, not real
// `Error` instances — `err instanceof Error` misses them and silently falls back
// to a generic string, so both shapes are handled here.
export function extractErrorMessage(err: unknown): string | null {
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
