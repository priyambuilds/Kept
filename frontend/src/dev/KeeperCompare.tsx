// Dev-only: the previous react-native-svg Keeper (left of each pair) next to the Skia one (right), for the
// motion rework's comparison (docs/notes/MOTION_REWORK.md). Open with kept://dev/keeper/<page>:
//   moods · props · hands · busts (still poses), or anim/<name> (both renderers animating, for video).
// Developer-facing, so its labels are literals (lint-exempt like the Gallery).
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { KeeperMood } from "@/copy";
import { useParams } from "@/app/nav";
import { KeeperSkia } from "@/components/keeper/KeeperSkia";
import { KeeperSvg } from "@/components/keeper/KeeperSvg";
import type { HandPose, KeeperAnimName, KeeperPropName } from "@/components/keeper/rig";
import { Text } from "@/components/primitives";
import { color } from "@/theme";

const MOODS: KeeperMood[] = ["neutral", "smug", "happy", "wink", "stern", "soft", "bored", "side", "shocked", "shades"];
const PROPS: KeeperPropName[] = ["none", "seal", "ledger", "lens", "coin", "sack", "cup", "whisper", "scythe", "flip"];
const HANDS: HandPose[] = ["open", "fist", "point", "thumb"];

interface Cell { label: string; mood: KeeperMood; prop?: KeeperPropName; hand?: HandPose; bust?: boolean; anim?: KeeperAnimName }

function Pair({ c, size, live }: { c: Cell; size: number; live: boolean }) {
  const p = { mood: c.mood, prop: c.prop ?? "none", anim: c.anim ?? "idle", size, bust: !!c.bust, animate: live, ...(c.hand ? { hand: c.hand } : {}) } as const;
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text variant="monoMicro" color={color.text.secondary}>{c.label}</Text>
      <View style={{ flexDirection: "row", gap: 6 }}>
        <View style={{ borderWidth: 1, borderColor: color.line.strong }}><KeeperSvg {...p} /></View>
        <View style={{ borderWidth: 1, borderColor: color.lime.base }}><KeeperSkia {...p} /></View>
      </View>
    </View>
  );
}

export function KeeperCompare() {
  const insets = useSafeAreaInsets();
  const { page = "moods", anim } = useParams<{ page: string; anim: string }>();
  const cells: Cell[] =
    page === "props" ? PROPS.map((prop) => ({ label: prop, mood: "neutral", prop }))
    : page === "hands" ? [...HANDS.map((hand) => ({ label: `hand ${hand}`, mood: "neutral" as KeeperMood, hand })), { label: "shades (L open)", mood: "shades" }, { label: "shocked (L open)", mood: "shocked" }]
    : page === "busts" ? MOODS.map((mood) => ({ label: mood, mood, bust: true }))
    : page === "anim" ? [{ label: anim ?? "idle", mood: "neutral", anim: (anim ?? "idle") as KeeperAnimName, ...(anim === "flip" ? { prop: "flip" as KeeperPropName } : {}) }]
    : MOODS.map((mood) => ({ label: mood, mood }));
  const live = page === "anim";
  const size = live ? 170 : page === "busts" ? 64 : 84;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.bg.app }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40, paddingHorizontal: 8, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", rowGap: 10 }}>
      <View style={{ width: "100%", alignItems: "center" }}><Text variant="monoLabel" color={color.lime.base}>{`KEEPER · ${page}${anim ? ` ${anim}` : ""} · SVG | SKIA`}</Text></View>
      {cells.map((c) => <Pair key={c.label} c={c} size={size} live={live} />)}
    </ScrollView>
  );
}
