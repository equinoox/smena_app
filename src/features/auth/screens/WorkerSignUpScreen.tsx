// Worker sign-up — RHF + Zod. Creates the auth user (role=worker); trigger creates the base
// profile row, then we backfill city/position/experience once a session exists.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  CaretLeft,
  EnvelopeSimple,
  Lock,
  MapPin,
  Phone,
  User,
} from "phosphor-react-native";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { ControlledInput } from "@shared/components/ControlledInput";
import { Input } from "@shared/components/Input";
import { Screen } from "@shared/components/Screen";
import { useOnboardingStatus } from "@shared/hooks/useOnboardingStatus";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "@shared/i18n/I18nProvider";
import type { TranslationKey } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import { EXPERIENCE_LEVELS } from "@shared/lib/roleIcon";
import {
  workerSignUpSchema,
  type WorkerSignUpValues,
} from "@features/auth/validation/authSchemas";
import { useSignUpWorker } from "@features/auth/hooks/useAuthMutations";

export function WorkerSignUpScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { complete } = useOnboardingStatus();
  const signUp = useSignUpWorker();

  const { control, handleSubmit } = useForm<WorkerSignUpValues>({
    resolver: zodResolver(workerSignUpSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      city: "",
      experienceLevel: undefined,
    },
  });

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(
      {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: `+3816${values.phone.replace(/\D/g, "")}`,
        city: values.city,
        experienceLevel: values.experienceLevel,
      },
      {
        onSuccess: (data) => {
          // signUp succeeded => a profile now exists; onboarding never needs to show again.
          void complete();
          // No session => email confirmation is on; send them to sign in.
          if (!data.session) {
            toast.info(t("auth.confirmEmail"));
            router.replace("/sign-in");
          }
        },
      },
    ),
  );

  return (
    <Screen scroll>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
        {t("auth.workerSignUpTitle")}
      </Text>
      <Text className="mt-1 font-sans-medium text-sm text-text-tertiary">
        {t("auth.workerSignUpSubtitle")}
      </Text>

      <View className="mt-6 gap-4">
        <ControlledInput
          control={control}
          name="fullName"
          label={t("auth.fullName")}
          autoCapitalize="words"
          leftIcon={<User size={18} color={colors.textMuted} />}
        />

        <ControlledInput
          control={control}
          name="email"
          label={t("auth.email")}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<EnvelopeSimple size={18} color={colors.textMuted} />}
        />

        <ControlledInput
          control={control}
          name="city"
          label={t("auth.city")}
          autoCapitalize="words"
          leftIcon={<MapPin size={18} color={colors.textMuted} />}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Input
              label={t("auth.phone")}
              value={field.value}
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

        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-text-tertiary">
            {t("auth.experience")}
          </Text>
          <Controller
            control={control}
            name="experienceLevel"
            render={({ field, fieldState }) => (
              <>
                <View className="flex-row rounded-input border border-border-default bg-bg-surface p-1">
                  {EXPERIENCE_LEVELS.map((level) => {
                    const selected = field.value === level;
                    return (
                      <Pressable
                        key={level}
                        onPress={() => field.onChange(level)}
                        className={cn(
                          "flex-1 items-center justify-center rounded-chip py-2.5",
                          selected && "bg-bg-surface-alt",
                        )}
                      >
                        <Text
                          className={cn(
                            "font-sans-semibold text-sm",
                            selected ? "text-text-primary" : "text-text-muted",
                          )}
                        >
                          {t(`experience.${level}` as TranslationKey)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {fieldState.error ? (
                  <Text className="font-sans text-xs text-warning">
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </>
            )}
          />
        </View>

        <ControlledInput
          control={control}
          name="password"
          label={t("auth.password")}
          secureTextEntry
          leftIcon={<Lock size={18} color={colors.textMuted} />}
        />
        <ControlledInput
          control={control}
          name="confirmPassword"
          label={t("auth.confirmPassword")}
          secureTextEntry
          leftIcon={<Lock size={18} color={colors.textMuted} />}
        />
      </View>

      <View className="mt-8 gap-4">
        <Button
          label={t("common.continue")}
          onPress={onSubmit}
          loading={signUp.isPending}
          size="lg"
          rightIcon={<ArrowRight size={18} color={colors.onBrand} weight="bold" />}
        />
        <View className="flex-row items-center justify-center gap-1">
          <Text className="font-sans text-sm text-text-tertiary">
            {t("auth.alreadyHaveAccount")}
          </Text>
          <Pressable onPress={() => router.replace("/sign-in")} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-brand">
              {t("auth.signIn")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
