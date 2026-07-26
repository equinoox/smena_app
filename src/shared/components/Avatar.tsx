// Avatar — remote image with a generic profile-icon fallback. Rounded square, token-styled.
import { User } from "phosphor-react-native";
import { Image, View } from "react-native";
import { useThemeColors } from "@shared/hooks/useThemeColors";

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: number;
};

// `name` is accepted for callers that still pass it (a11y label, future use) but no
// longer drives the fallback — a missing photo always shows the same profile icon.
export function Avatar({ uri, size = 44 }: AvatarProps) {
  const colors = useThemeColors();
  // Design uses rounded squares (not circles) for avatars/logos.
  const dimension = { width: size, height: size, borderRadius: Math.round(size * 0.3) };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={dimension}
        className="bg-bg-surface-alt"
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={dimension} className="items-center justify-center bg-bg-icon-tint">
      <User size={size * 0.55} weight="fill" color={colors.brand} />
    </View>
  );
}
