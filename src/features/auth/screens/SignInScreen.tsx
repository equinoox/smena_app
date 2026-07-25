// Sign-in screen — email/password via RHF + Zod. Session change triggers the root redirect.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { ControlledInput } from "@shared/components/ControlledInput";
import { Screen } from "@shared/components/Screen";
import { useOnboardingStatus } from "@shared/hooks/useOnboardingStatus";
import { useTranslation } from "@shared/i18n/I18nProvider";
import {
  signInSchema,
  type SignInValues,
} from "@features/auth/validation/authSchemas";
import { useSignIn } from "@features/auth/hooks/useAuthMutations";

export function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { complete } = useOnboardingStatus();
  const signIn = useSignIn();

  const { control, handleSubmit } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) =>
    signIn.mutate(values, {
      // A successful sign-in (e.g. a returning user, or any account not created
      // through this device's own sign-up flow) also means onboarding never needs
      // to show again here — otherwise logging out would re-expose it (`completed`
      // would still be false since only the sign-up screens used to set it).
      onSuccess: () => void complete(),
    }),
  );

  return (
    <Screen scroll className="justify-center py-10">
      <View className="mb-8">
        <Text className="font-sans-extrabold text-3xl text-text-primary">
          {t("auth.signIn")}
        </Text>
        <Text className="mt-2 font-sans text-base text-text-secondary">
          {t("auth.signInSubtitle")}
        </Text>
      </View>

      <View className="gap-4">
        <ControlledInput
          control={control}
          name="email"
          label={t("auth.email")}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <ControlledInput
          control={control}
          name="password"
          label={t("auth.password")}
          secureTextEntry
          autoComplete="password"
        />
      </View>

      <View className="mt-8 gap-4">
        <Button
          label={t("auth.signIn")}
          onPress={onSubmit}
          loading={signIn.isPending}
          size="lg"
        />
        <View className="flex-row items-center justify-center gap-1">
          <Text className="font-sans text-sm text-text-tertiary">
            {t("auth.noAccount")}
          </Text>
          <Pressable onPress={() => router.push("/onboarding")} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-brand">
              {t("auth.signUp")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
