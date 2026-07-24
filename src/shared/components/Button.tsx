// Button — primary/secondary/ghost/danger variants, sizes, loading + icon slots. Token-styled.
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { cn } from "@shared/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const containerByVariant: Record<Variant, string> = {
  primary: "bg-brand active:bg-brand-dark",
  secondary: "bg-bg-surface-alt border border-border-default active:opacity-80",
  ghost: "bg-transparent active:opacity-60",
  danger: "bg-warning-bg border border-warning active:opacity-80",
};

const textByVariant: Record<Variant, string> = {
  primary: "text-on-brand",
  secondary: "text-text-primary",
  ghost: "text-brand",
  danger: "text-warning",
};

const containerBySize: Record<Size, string> = {
  sm: "h-10 px-4 rounded-chip",
  md: "h-12 px-5 rounded-button",
  lg: "h-14 px-6 rounded-button",
};

const textBySize: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-center gap-2",
        containerBySize[size],
        containerByVariant[variant],
        fullWidth && "self-stretch",
        isDisabled && "opacity-50",
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text
            className={cn(
              "font-sans-bold",
              textByVariant[variant],
              textBySize[size],
            )}
          >
            {label}
          </Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}
