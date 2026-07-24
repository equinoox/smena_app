// ControlledInput — binds the shared Input to react-hook-form (value/onChange/error).
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input } from "@shared/components/Input";
import type { ComponentProps } from "react";

type InputProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChangeText" | "onBlur" | "error"
>;

type ControlledInputProps<T extends FieldValues> = InputProps & {
  control: Control<T>;
  name: Path<T>;
};

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          value={(field.value as string | undefined) ?? ""}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
