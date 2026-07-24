// Input — labelled text field with error state and icon slots. Presentational (pairs with RHF Controller).
import { forwardRef, useState } from "react";
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { cn } from "@shared/lib/cn";
import { useThemeColors } from "@shared/hooks/useThemeColors";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, leftIcon, rightIcon, onFocus, onBlur, className, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const colors = useThemeColors();

  return (
    <View className="gap-1.5 self-stretch">
      {label ? (
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {label}
        </Text>
      ) : null}

      <View
        className={cn(
          "h-12 flex-row items-center gap-2 rounded-input border bg-bg-surface px-3",
          focused ? "border-brand" : "border-border-default",
          error && "border-warning",
        )}
      >
        {leftIcon}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          className={cn(
            "flex-1 font-sans text-base text-text-primary",
            className,
          )}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon}
      </View>

      {error ? (
        <Text className="font-sans text-xs text-warning">{error}</Text>
      ) : null}
    </View>
  );
});
