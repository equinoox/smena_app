// Toast + ToastProvider + useToast — transient messages. Also bridges React Query errors to toasts.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@shared/lib/cn";
import { extractErrorMessage } from "@shared/lib/errors";
import { motion } from "@shared/lib/motion";
import { setQueryErrorHandler } from "@shared/lib/queryClient";
import { useTranslation } from "@shared/i18n/I18nProvider";

type ToastType = "success" | "error" | "info";
type ToastState = { message: string; type: ToastType } | null;

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const styleByType: Record<ToastType, string> = {
  success: "bg-success-bg border-success",
  error: "bg-warning-bg border-warning",
  info: "bg-bg-surface-alt border-brand",
};

const textByType: Record<ToastType, string> = {
  success: "text-success",
  error: "text-warning",
  info: "text-text-primary",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastState>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = "info") => {
    if (timeout.current) clearTimeout(timeout.current);
    setToast({ message, type });
    timeout.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
  };

  // Route React Query failures through the toast layer.
  useEffect(() => {
    setQueryErrorHandler((err) => {
      show(extractErrorMessage(err) ?? t("errors.generic"), "error");
    });
  }, [show, t]);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* The wrapper stays mounted so the toast itself can play an exit animation. */}
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 px-4"
        style={{ bottom: insets.bottom + 100 }}
      >
        {toast ? (
          <Animated.View
            entering={FadeInDown.duration(motion.duration.slow)}
            exiting={FadeOutDown.duration(motion.duration.base)}
          >
            <Pressable
              onPress={() => setToast(null)}
              className={cn(
                "w-full max-w-md self-center rounded-card border-2 px-4 py-3",
                styleByType[toast.type],
              )}
            >
              <Text className={cn("font-sans-medium text-sm", textByType[toast.type])}>
                {toast.message}
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
