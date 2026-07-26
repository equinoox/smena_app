// SmartCoverImage — fills a fixed-aspect-ratio banner slot with a photo. Prefers
// resizeMode="cover" (edge-to-edge fill) but falls back to a centered "contain" fit when
// the source image's own aspect ratio is too different from the slot's — avoids
// over-cropping a badly-shaped upload (e.g. a square or portrait photo in a wide banner).
// The parent's own background shows through as the letterbox fill in the fallback case.
import { useEffect, useState } from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";

type SmartCoverImageProps = {
  uri: string;
  // width / height of the slot this image fills, e.g. 3 for a 3:1 banner.
  aspectRatio: number;
  style?: StyleProp<ImageStyle>;
};

// Below this fraction of the source image kept on-screen, a "cover" crop starts
// looking broken — fall back to "contain". Older uploads cropped at a previous
// banner ratio sit right around 0.6 kept, which still reads as a bad crop, so this
// stays generous about bailing out to "contain" rather than a borderline cover.
const MIN_KEPT_FRACTION = 0.8;

export function SmartCoverImage({ uri, aspectRatio, style }: SmartCoverImageProps) {
  const [imageAspect, setImageAspect] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImageAspect(null);
    Image.getSize(
      uri,
      (width, height) => {
        if (!cancelled && height > 0) setImageAspect(width / height);
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  // Until the source's real aspect ratio is known, assume it fits reasonably —
  // avoids a visible flash of "contain" before the size check resolves.
  const keptFraction =
    imageAspect != null
      ? Math.min(imageAspect / aspectRatio, aspectRatio / imageAspect)
      : 1;

  return (
    <Image
      source={{ uri }}
      style={[{ width: "100%", height: "100%" }, style]}
      resizeMode={keptFraction < MIN_KEPT_FRACTION ? "contain" : "cover"}
    />
  );
}
