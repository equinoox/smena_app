// ErrorBoundary — catches render errors app-wide and shows a recoverable fallback.
import { Component, type ReactNode } from "react";
import { Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { useTranslation } from "@shared/i18n/I18nProvider";

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Functional fallback so we can use the translation hook (class components can't).
function Fallback({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg-screen px-8">
      <Text className="text-center font-sans-bold text-xl text-text-primary">
        {t("common.somethingWrong")}
      </Text>
      <Text className="text-center font-sans text-sm text-text-tertiary">
        {t("common.tryAgain")}
      </Text>
      <Button label={t("common.retry")} onPress={onReset} fullWidth={false} />
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Keep a console trace for debugging; swap for a reporter (e.g. Sentry) later.
    console.error("ErrorBoundary caught:", error);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) return <Fallback onReset={this.reset} />;
    return this.props.children;
  }
}
