import { View } from "react-native";
import { t } from "@/copy";
import { color, fontFamily, gradient, metrics, space } from "@/theme";
import { CheckK, Pop, Surface, Text } from "../primitives";

/** Splash: 112 lime tile + ink Check-K 90, "KEPT" wordmark, tagline (A0). Phase 5 adds the draw sequence. */
export function BrandSplash() {
  const b = metrics.brand;
  return (
    <View style={{ alignItems: "center", gap: space[18] }} accessibilityRole="header" accessibilityLabel={`${t("common.brand")}. ${t("common.tagline")}`}>
      <Pop ms={550}>
        <Surface radius={b.splashRadius} gradient={gradient("brandTile")} shadow={`inset 0 1.5px 0 rgba(255,255,255,0.6), inset 0 -6px 0 rgba(0,0,0,0.14), 0 24px 60px ${color.lime.glow22}`} style={{ width: b.splashTile, height: b.splashTile, alignItems: "center", justifyContent: "center" }}>
          <CheckK size={b.splashMark} variant="ink" />
        </Surface>
      </Pop>
      <Text variant="wordmark">{t("common.brand")}</Text>
      <Text variant="label" color={color.text.secondary} style={{ fontSize: 15 }}>{t("common.tagline")}</Text>
    </View>
  );
}

/** Word: Check-K 32 overlapping "EPT" (top of A1). */
export function BrandWord() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }} accessible accessibilityLabel={t("common.brand")}>
      <View style={{ marginLeft: -5, marginRight: -3 }}><CheckK size={metrics.brand.word} /></View>
      <Text variant="wordmarkSm">{t("common.brand").slice(1)}</Text>
    </View>
  );
}

/** Stamp: "KEPT · VERIFIED · DAY 3 · 9:41" pill at the bottom of F5, L1, L2, L6, H5, J1·ok. */
export function BrandStamp({ text }: { text: string }) {
  const b = metrics.brand;
  return (
    <View style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: space[8], paddingVertical: 7, paddingLeft: 7, paddingRight: 12, borderRadius: 15, backgroundColor: color.surface[1], boxShadow: `inset 0 0 0 1px ${color.line.hairline2}` }}>
      <View style={{ width: b.stampTile, height: b.stampTile, borderRadius: 7, backgroundColor: color.lime.base, alignItems: "center", justifyContent: "center" }}><CheckK size={b.stampMark} variant="ink" stroke={17} /></View>
      <Text variant="chipMd" style={{ fontFamily: fontFamily("sans", 900), letterSpacing: -0.3 }}>{t("common.brand")}</Text>
      <Text variant="monoMicro" color={color.text.secondary}>{text}</Text>
    </View>
  );
}

/** Lockup: footer of I4 (tile, name, tagline, version). */
export function BrandLockup() {
  const b = metrics.brand;
  return (
    <View style={{ alignItems: "center", gap: space[8], paddingTop: space[18], paddingBottom: space[4] }}>
      <View style={{ width: b.lockTile, height: b.lockTile, borderRadius: b.lockRadius, backgroundColor: color.lime.base, alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.14)" }}><CheckK size={b.lockMark} variant="ink" /></View>
      <Text variant="rowTitle" style={{ fontFamily: fontFamily("sans", 900), letterSpacing: -0.4 }}>{t("common.brand")}</Text>
      <Text variant="caption" color={color.text.tertiary}>{t("common.tagline")}</Text>
      <Text variant="monoMicro" color={color.text.quaternary}>{t("common.version")}</Text>
    </View>
  );
}
