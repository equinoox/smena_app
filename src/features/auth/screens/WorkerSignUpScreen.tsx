// Worker sign-up — RHF + Zod. Creates the auth user (role=worker); trigger creates the profile.
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { ControlledInput } from "@shared/components/ControlledInput";
import { Screen } from "@shared/components/Screen";
import { useOnboardingStatus } from "@shared/hooks/useOnboardingStatus";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "@shared/i18n/I18nProvider";
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
    },
  });

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(
      {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
        city: values.city,
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
    <Screen scroll className="pb-8 pt-2">
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        className="mb-6 mt-1 h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <Text className="mb-6 font-sans-extrabold text-2xl text-text-primary">
        {t("auth.workerSignUpTitle")}
      </Text>

      <View className="mt-2 gap-4">
        <ControlledInput
          control={control}
          name="fullName"
          label={t("auth.fullName")}
          autoCapitalize="words"
        />
        <ControlledInput
          control={control}
          name="email"
          label={t("auth.email")}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <ControlledInput
          control={control}
          name="phone"
          label={t("auth.phoneOptional")}
          placeholder="+381 6X XXX XXXX"
          keyboardType="phone-pad"
        />
        <ControlledInput
          control={control}
          name="city"
          label={t("auth.city")}
          autoCapitalize="words"
        />
        <ControlledInput
          control={control}
          name="password"
          label={t("auth.password")}
          secureTextEntry
        />
        <ControlledInput
          control={control}
          name="confirmPassword"
          label={t("auth.confirmPassword")}
          secureTextEntry
        />
      </View>

      <View className="mt-8 gap-4">
        <Button
          label={t("auth.createAccount")}
          onPress={onSubmit}
          loading={signUp.isPending}
          size="lg"
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
