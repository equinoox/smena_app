// Input — labelled text field with error state and icon slots. Presentational (pairs with RHF Controller).
import { forwardRef, useRef, useState } from "react";
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { cn } from "@shared/lib/cn";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useScrollIntoView, type MeasurableInstance } from "@shared/lib/scrollIntoView";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, leftIcon, rightIcon, onFocus, onBlur, className, ...rest },
  forwardedRef,
) {
  const [focused, setFocused] = useState(false);
  const colors = useThemeColors();
  const scrollIntoView = useScrollIntoView();
  const inputRef = useRef<TextInput>(null);

  return (
    <View className="gap-1.5 self-stretch">
      {label ? (
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {label}
        </Text>
      ) : null}

      <View
        className={cn(
          "flex-row gap-2 rounded-input border bg-bg-surface px-3",
          rest.multiline ? "h-24 items-start py-3" : "h-12 items-center",
          focused ? "border-brand" : "border-border-default",
          error && "border-warning",
        )}
      >
        {leftIcon}
        <TextInput
          ref={(node) => {
            inputRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          placeholderTextColor={colors.textMuted}
          textAlignVertical={rest.multiline ? "top" : "center"}
          className={cn(
            "flex-1 font-sans text-base text-text-primary",
            className,
          )}
          onFocus={(e) => {
            setFocused(true);
            scrollIntoView?.(inputRef.current as unknown as MeasurableInstance | null);
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
