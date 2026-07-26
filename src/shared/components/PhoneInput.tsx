// PhoneInput — phone field with a fixed "+381 6" prefix (Serbian mobile format). The
// bound RHF value is only the local digits typed after that prefix; callers reattach
// it at submit time with toSerbianPhone (and strip it back off with fromSerbianPhone
// when pre-filling from a stored value) — see @shared/lib/phone.
import { Phone } from "phosphor-react-native";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Text, View } from "react-native";
import { Input } from "@shared/components/Input";
import { useThemeColors } from "@shared/hooks/useThemeColors";

type PhoneInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

export function PhoneInput<T extends FieldValues>({
  control,
  name,
  label,
}: PhoneInputProps<T>) {
  const colors = useThemeColors();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          label={label}
          value={(field.value as string | undefined) ?? ""}
          onChangeText={(v) => field.onChange(v.replace(/[^\d ]/g, ""))}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          keyboardType="phone-pad"
          placeholder="2 345 678"
          leftIcon={
            <View className="flex-row items-center gap-2">
              <Phone size={18} color={colors.textMuted} />
              <Text className="font-sans-bold text-base text-text-primary">
                +381 6
              </Text>
            </View>
          }
        />
      )}
    />
  );
}
