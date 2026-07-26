// Uploads a locally-picked image to Supabase Storage, under the owner's own id folder
// (required by the storage policies — see supabase/migrations/0003_storage.sql).
import { supabase } from "@shared/lib/supabase";

export async function uploadImage(
  bucket: "avatars" | "venue-logos",
  ownerId: string,
  filename: string,
  localUri: string,
) {
  const ext = localUri.split(".").pop()?.toLowerCase() ?? "jpg";
  // A unique path per upload (rather than a fixed name + upsert) — Supabase's storage
  // CDN caches by object path and doesn't reliably bust that cache on overwrite, so
  // re-uploading to the same path can keep serving the old bytes for a while even
  // with a cache-busting query string on the URL. A brand new path has nothing to
  // have cached, so the new photo always shows immediately.
  const path = `${ownerId}/${filename}-${Date.now()}.${ext}`;
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, { contentType: `image/${ext}` });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
