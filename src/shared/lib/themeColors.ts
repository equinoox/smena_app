// JS mirror of the CSS token palette in global.css, for imperative color props that
// can't take Tailwind classes (Phosphor icons, placeholderTextColor, StatusBar, etc.).
// KEEP IN SYNC with global.css — same hex values per theme.
type Palette = {
  bgCanvas: string;
  bgScreen: string;
  bgSurface: string;
  bgSurfaceAlt: string;
  bgIconTint: string;
  borderDefault: string;
  borderMuted: string;
  brand: string;
  brandDark: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  textFaint: string;
  success: string;
  warning: string;
  accentBadge: string;
  info: string;
  onBrand: string;
  onAccent: string;
};

export const themeColors: { light: Palette; dark: Palette } = {
  light: {
    bgCanvas: "#FAF7F2",
    bgScreen: "#F4EFE8",
    bgSurface: "#FFFFFF",
    bgSurfaceAlt: "#F0EAE1",
    bgIconTint: "#FBE7DF",
    borderDefault: "#E7E0D6",
    borderMuted: "#D9D1C5",
    brand: "#FF5C39",
    brandDark: "#E23D1C",
    textPrimary: "#1B1712",
    textSecondary: "#4A423A",
    textTertiary: "#6E675C",
    textMuted: "#938B7F",
    textFaint: "#A79F92",
    success: "#2E9A5B",
    warning: "#C25E1F",
    accentBadge: "#E8991A",
    info: "#1E82C8",
    onBrand: "#FFFFFF",
    onAccent: "#1B1712",
  },
  dark: {
    bgCanvas: "#000000",
    bgScreen: "#17140F",
    bgSurface: "#221D19",
    bgSurfaceAlt: "#2A2420",
    bgIconTint: "#3A241C",
    borderDefault: "#322B25",
    borderMuted: "#3A332C",
    brand: "#FF5C39",
    brandDark: "#E23D1C",
    textPrimary: "#F1ECE3",
    textSecondary: "#C9C2B7",
    textTertiary: "#9C958A",
    textMuted: "#7E786E",
    textFaint: "#6E685E",
    success: "#63C489",
    warning: "#F0894A",
    accentBadge: "#FFC24B",
    info: "#6EBEFF",
    onBrand: "#FFFFFF",
    onAccent: "#0D0B09",
  },
};

export type ThemeColors = Palette;
