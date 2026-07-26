// Sign-in screen — email/password via RHF + Zod. Session change triggers the root
// redirect. "Forgot password" is visual-only for now (not wired); Apple/Google are
// placeholders that show a "coming soon" toast until real OAuth is wired up.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  AppleLogo,
  ArrowRight,
  Coffee,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  GoogleLogo,
  Lock,
} from "phosphor-react-native";
import { useState } from "react";
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
import { extractErrorMessage } from "@shared/lib/errors";
import {
  signInSchema,
  type SignInValues,
} from "@features/auth/validation/authSchemas";
import { useSignIn } from "@features/auth/hooks/useAuthMutations";

export function SignInScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { complete } = useOnboardingStatus();
  const signIn = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const errorMessage = signIn.isError
    ? (extractErrorMessage(signIn.error) ?? t("errors.auth"))
    : null;

  const onSubmit = handleSubmit((values) =>
    signIn.mutate(values, {
      // A successful sign-in (e.g. a returning user, or any account not created
      // through this device's own sign-up flow) also means onboarding never needs
      // to show again here — otherwise logging out would re-expose it (`completed`
      // would still be false since only the sign-up screens used to set it).
      onSuccess: () => void complete(),
    }),
  );

  const comingSoon = () => toast.info(t("common.comingSoon"));

  return (
    <Screen scroll className="justify-center py-10">
      <View className="h-16 w-16 items-center justify-center rounded-input bg-brand">
        <Coffee size={32} weight="fill" color={colors.onBrand} />
      </View>

      <View className="mt-6">
        <Text className="font-sans-extrabold text-3xl text-text-primary">
          {t("auth.welcomeBack")}
        </Text>
        <Text className="mt-2 font-sans text-base text-text-secondary">
          {t("auth.signInSubtitle")}
        </Text>
      </View>

      <View className="mt-6 gap-4">
        <ControlledInput
          control={control}
          name="email"
          label={t("auth.email")}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          leftIcon={<EnvelopeSimple size={18} color={colors.textMuted} />}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Input
              label={t("auth.password")}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              secureTextEntry={!showPassword}
              autoComplete="password"
              leftIcon={<Lock size={18} color={colors.textMuted} />}
              rightIcon={
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  {showPassword ? (
                    <EyeSlash size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </Pressable>
              }
            />
          )}
        />
      </View>

      <View className="mt-3 items-end">
        <Text className="font-sans-bold text-sm text-brand">
          {t("auth.forgotPassword")}
        </Text>
      </View>

      {errorMessage ? (
        <View className="mt-4 rounded-card border border-warning bg-warning-bg px-4 py-3">
          <Text className="font-sans-medium text-sm text-warning">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <View className="mt-6 gap-4">
        <Button
          label={t("auth.signIn")}
          onPress={onSubmit}
          loading={signIn.isPending}
          size="lg"
          rightIcon={<ArrowRight size={18} color={colors.onBrand} weight="bold" />}
        />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border-default" />
          <Text className="font-sans text-xs text-text-muted">{t("auth.or")}</Text>
          <View className="h-px flex-1 bg-border-default" />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label={t("auth.continueWithApple")}
              variant="secondary"
              onPress={comingSoon}
              leftIcon={
                <AppleLogo size={18} weight="fill" color={colors.textPrimary} />
              }
            />
          </View>
          <View className="flex-1">
            <Button
              label={t("auth.continueWithGoogle")}
              variant="secondary"
              onPress={comingSoon}
              leftIcon={<GoogleLogo size={18} color={colors.textPrimary} />}
            />
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-1">
          <Text className="font-sans text-sm text-text-tertiary">
            {t("auth.noAccount")}
          </Text>
          <Pressable onPress={() => router.push("/register")} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-brand">
              {t("auth.registerNow")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
