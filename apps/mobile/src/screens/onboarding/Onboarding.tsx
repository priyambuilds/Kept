// A · Onboarding (screens.md A0–A4). Sign-in is real: MWA + /api/auth/* + /api/me, unless the Dev
// menu picks the mock wallet / mock auth.
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { keeperLines, t } from "@/copy";
import type { CopyKey } from "@/copy";
import { Button } from "@/components/actions";
import { BrandSplash } from "@/components/brand/Brand";
import { NavBar, useToast } from "@/components/chrome";
import { Breakdown, Chip, ChipRow, Note, Title } from "@/components/content/Basics";
import { RowList } from "@/components/content/Rows";
import { AvatarBuilder } from "@/components/content/Social";
import { SignStatus } from "@/components/content/Status";
import { randomAvatar } from "@/components/avatar/palette";
import { KeeperPlacement } from "@/components/keeper/KeeperUI";
import { Screen } from "@/components/layout/Screen";
import { Enter } from "@/components/primitives";
import { color, duration, metrics } from "@/theme";
import { getApi, isApiError } from "@/api";
import { getWallet, isTxFailure } from "@/chain";
import { restoreSession, signIn } from "@/features/auth";
import type { SignInResult } from "@/features/auth";
import { useContinue, useGo } from "@/app/nav";
import { keeperAt } from "@/app/layout";
import { useSigningFlow } from "@/app/useSigningFlow";
import type { SignOutcome } from "@/app/useSigningFlow";
import { useSession } from "@/state/session";
import { useDevHold } from "@/state/dev";

/** Splash shows at least this long so the brand sequence can play (motion.md › splash). */
const SPLASH_MIN_MS = 1200;

// ── A0 Splash ── waits for the stored session, re-checks it, then routes.
export function A0() {
  const { reset } = useGo();
  useEffect(() => {
    let cancelled = false;
    const hydrated = new Promise<void>((resolve) => {
      if (useSession.persist.hasHydrated()) resolve();
      else useSession.persist.onFinishHydration(() => resolve());
    });
    void Promise.all([hydrated, new Promise((r) => setTimeout(r, SPLASH_MIN_MS))]).then(async () => {
      const { token, onboarded } = useSession.getState();
      const signedIn = token ? await restoreSession(getApi()) : false;
      if (cancelled || useDevHold.getState().hold) return; // the dev deep link can hold the splash
      if (signedIn && onboarded) reset("B1");
      else if (signedIn) reset("A4");
      else reset("A1");
    });
    return () => { cancelled = true; };
  }, [reset]);
  return (
    <Screen bare>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><BrandSplash /></View>
    </Screen>
  );
}

// ── A1 Welcome ──
export function A1() {
  const { go } = useGo();
  const setInvite = useSession((s) => s.setInvite);
  const k = keeperLines("A1")[0]!;
  return (
    <Screen
      bottomInset={metrics.button.height * 2 + metrics.pinned.gap + metrics.pinned.bottom}
      pinned={<>
        <Button kind="p" label={t("screens.A1.pin.0")} onPress={() => go("A2")} />
        <Button kind="t" label={t("screens.A1.pin.1")} onPress={() => { setInvite(useSession.getState().invite ?? ""); go("A2"); }} />
      </>}
    >
      <KeeperPlacement mood={k.mood} line={k.line} {...keeperAt("A1")} chips={[
        { text: t("screens.A1.b1.chip.0"), icon: "sack", x: 200, y: 150, tilt: 4, tone: "lime" },
        { text: t("screens.A1.b1.chip.1"), icon: "cards-playing-outline", x: 190, y: 200, tilt: -3, tone: "white" },
      ]} />
      <Enter index={1}><Title heading={t("screens.A1.b2.title")} sub={t("screens.A1.b2.sub")} fs={40} /></Enter>
    </Screen>
  );
}

// ── A2 Connect wallet ── every row opens the same MWA authorize; Android picks the wallet (D-25).
const WALLETS = [0, 1, 2] as const;
export function A2() {
  const { go, back } = useGo();
  return (
    <Screen bar={<NavBar onBack={back} steps={[1, 3]} />}>
      <Title heading={t("screens.A2.b0.title")} sub={t("screens.A2.b0.sub")} />
      <RowList rows={WALLETS.map((i) => ({
        title: t(`screens.A2.b1.r${i}.t`), sub: t(`screens.A2.b1.r${i}.s`), chevron: true,
        leading: { kind: "icon" as const, icon: i === 0 ? "cellphone-key" : "wallet-outline", ...(i === 0 ? { bg: color.lime.base, fg: color.text.onLime } : {}) },
        ...(i === 0 ? { value: t("screens.A2.b1.r0.r"), valueColor: color.lime.base } : {}),
        onPress: () => go("A2·s", { wallet: i }),
      }))} />
      <Breakdown label={t("screens.A2.b2.label")} rows={[0, 1, 2].map((i) => ({ label: t(`screens.A2.b2.row${i}.l` as CopyKey), value: t(`screens.A2.b2.row${i}.v` as CopyKey) }))} />
      <Note text={t("screens.A2.b3.text")} icon="shield-check-outline" />
    </Screen>
  );
}

// ── A2·s Signing in ── transient: replaced by A3, A3·no, A2·e (declined) or M2 (offline).
export function A2s() {
  const route = useRoute<RouteProp<{ p: { wallet?: number } }, "p">>();
  const { back } = useGo();
  const toast = useToast();
  const walletIndex = route.params?.wallet ?? 0;
  const task = useCallback(() => signIn(getApi(), getWallet()), []);
  const resolve = useCallback((r: { ok: true; value: SignInResult } | { ok: false; error: unknown }): SignOutcome => {
    if (r.ok) return { to: r.value.genesis ? "A3" : "A3·no", delayMs: duration.toggle };
    const e = r.error;
    if (isTxFailure(e) && e.kind === "rejected") return { to: "A2·e" };
    if ((isTxFailure(e) && e.kind === "offline") || (isApiError(e) && e.code === "OFFLINE")) return { to: "M2" };
    // Anything else (backend refused, wallet error): say what happened and let them try again.
    toast(e instanceof Error ? e.message : String(e));
    return { to: "A2" };
  }, [toast]);
  const state = useSigningFlow(task, resolve);
  return (
    <Screen bar={<NavBar onBack={back} close />}>
      <SignStatus state={state} chip={t(`screens.A2.b1.r${walletIndex as 0 | 1 | 2}.t`)} />
      <Title heading={t("screens.A2·s.b2.title")} sub={t("screens.A2·s.b2.sub")} align="center" />
      <Note text={t("screens.A2·s.b3.text")} icon="timer-sand" />
    </Screen>
  );
}

// ── A2·e Sign-in rejected ──
export function A2e() {
  const { go, back } = useGo();
  const k = keeperLines("A2·e")[0]!;
  return (
    <Screen
      bar={<NavBar onBack={back} steps={[1, 3]} />}
      bottomInset={metrics.button.height * 2 + metrics.pinned.gap + metrics.pinned.bottom}
      pinned={<>
        <Button kind="p" label={t("screens.A2·e.pin.0")} onPress={() => go("A2")} />
        {/* Forget the remembered authorization so the wallet chooser opens again. */}
        <Button kind="t" label={t("screens.A2·e.pin.1")} onPress={() => { void getWallet().forget().then(() => go("A2")); }} />
      </>}
    >
      <KeeperPlacement mood={k.mood} line={k.line} {...keeperAt("A2·e")} />
      <Title heading={t("screens.A2·e.b2.title")} sub={t("screens.A2·e.b2.sub")} align="center" />
    </Screen>
  );
}

// ── A3 / A3·no ── Genesis result. Non-Seekers get the full app with group features gated (D-18).
function Verified({ ok }: { ok: boolean }) {
  const { go, back } = useGo();
  const id = ok ? "A3" : "A3·no";
  return (
    <Screen
      bar={<NavBar onBack={back} steps={[2, 3]} />}
      bottomInset={metrics.button.height + metrics.pinned.bottom}
      pinned={<Button kind="p" label={t(`screens.${id}.pin.0`)} onPress={() => go("A4")} />}
    >
      <SignStatus state={ok ? "success" : "warn"} chip={t(`screens.${id}.b1.chip`)} />
      <Title heading={t(`screens.${id}.b2.title`)} sub={t(`screens.${id}.b2.sub`)} align="center" />
      <ChipRow justify="center">
        {[0, 1, 2].map((i) => {
          const open = ok || i === 0;
          return <Chip key={i} text={t(`screens.${id}.b3.chip.${i}` as CopyKey)} icon={open ? "check-bold" : "lock-outline"} tone={open ? "g" : "grey"} />;
        })}
      </ChipRow>
    </Screen>
  );
}
export const A3 = () => <Verified ok />;
export const A3no = () => <Verified ok={false} />;

// ── A4 Pick a look ── "Looks like me" saves the avatar and follows the cont: rule (B3, or E1 with an invite).
export function A4() {
  const { go, back } = useGo();
  const cont = useContinue();
  const stored = useSession((s) => s.avatar);
  const finish = useSession((s) => s.finishOnboarding);
  const [avatar, setAvatar] = useState(() => stored ?? randomAvatar());
  const k = keeperLines("A4")[0]!;
  const done = () => {
    finish(avatar);
    // Profiles have no backend yet (BACKEND_GAPS P1-9): the mock keeps it; the device keeps it too.
    void getApi().profile.save({ avatar }).catch(() => undefined);
    cont("B1");
  };
  return (
    <Screen
      bar={<NavBar onBack={back} steps={[3, 3]} />}
      bottomInset={metrics.button.height * 2 + metrics.pinned.gap + metrics.pinned.bottom}
      pinned={<>
        <Button kind="p" label={t("screens.A4.pin.0")} onPress={done} />
        <Button kind="t" label={t("screens.A4.pin.1")} onPress={() => go("I9")} />
      </>}
    >
      <Title heading={t("screens.A4.b0.title")} sub={t("screens.A4.b0.sub")} />
      <AvatarBuilder variant="preview" config={avatar} onChange={setAvatar} onShuffle={() => setAvatar(randomAvatar())} />
      <KeeperPlacement mood={k.mood} line={k.line} {...keeperAt("A4")} />
      <Note text={t("screens.A4.b3.text")} />
    </Screen>
  );
}
