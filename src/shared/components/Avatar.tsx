// Avatar — remote image with initials fallback. Circular, token-styled.
import { Image, Text, View } from "react-native";
import { cn } from "@shared/lib/cn";

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: number;
};

function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ uri, name, size = 44 }: AvatarProps) {
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
    <View
      style={dimension}
      className={cn("items-center justify-center bg-bg-icon-tint")}
    >
      <Text
        className="font-sans-bold text-brand"
        style={{ fontSize: size * 0.4 }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}
