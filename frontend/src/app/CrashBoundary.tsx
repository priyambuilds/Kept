// The root error boundary (D-87). A render error anywhere below it, or a fatal error from outside render
// (lib/crash), shows the recover screen instead of closing the app. "Try again" remounts the app, which
// starts again from home (Today, or onboarding when signed out); saved data is untouched. An unhandled
// promise rejection shows one toast (at most every few seconds) so a tap that did nothing is explained.
import { Component, Fragment, useEffect, useRef } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@/copy";
import { Button, PinnedActions } from "@/components/actions";
import { useToast } from "@/components/chrome";
import { Ambient } from "@/components/chrome/Ambient";
import { Title } from "@/components/content/Basics";
import { Keeper } from "@/components/keeper/Keeper";
import { onFatal, onRejection, toError } from "@/lib/crash";
import { color, metrics, space } from "@/theme";

const REJECTION_TOAST_GAP_MS = 8000;

export function Recover({ onRetry }: { onRetry: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.bg.app, paddingTop: insets.top, paddingBottom: insets.bottom }} testID="recover">
      <Ambient tone="red" ambient="red" />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: metrics.screen.padX, gap: space[14], paddingBottom: metrics.button.height + metrics.pinned.bottom }}>
        <Keeper mood="shocked" size={metrics.keeperPlacement.defaultSize} />
        <Title heading={t("additions.recover.title")} sub={t("additions.recover.sub")} align="center" />
      </View>
      <PinnedActions bottomInset={insets.bottom}>
        <Button kind="p" icon="refresh" label={t("additions.recover.retry")} onPress={onRetry} testID="recover-retry" />
      </PinnedActions>
    </View>
  );
}

interface State { error: Error | null; generation: number }

export class CrashBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null, generation: 0 };
  private unsubscribe?: () => void;

  static getDerivedStateFromError(e: unknown): Partial<State> { return { error: toError(e) }; }

  override componentDidMount() { this.unsubscribe = onFatal((error) => this.setState({ error })); }
  override componentWillUnmount() { this.unsubscribe?.(); }
  override componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) console.error("CrashBoundary caught:", error, info.componentStack);
  }

  private retry = () => this.setState((s) => ({ error: null, generation: s.generation + 1 }));

  override render() {
    if (this.state.error) return <Recover onRetry={this.retry} />;
    return (
      <>
        <RejectionToast />
        {/* A new key remounts everything below: navigation starts again from home. */}
        <Fragment key={this.state.generation}>{this.props.children}</Fragment>
      </>
    );
  }
}

function RejectionToast() {
  const toast = useToast();
  const last = useRef(0);
  useEffect(() => onRejection(() => {
    const now = Date.now();
    if (now - last.current < REJECTION_TOAST_GAP_MS) return;
    last.current = now;
    toast(t("additions.recover.rejected"));
  }), [toast]);
  return null;
}
