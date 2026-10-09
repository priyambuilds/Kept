// The parametric Keeper (design/reference/Keeper.dc.html) in react-native-svg. The still parts are drawn
// once; the moving parts (bob, blink, head tilt, glints, hands, sleeves, the flipped coin) are animated
// props fed by one UI-thread frame (rig.ts › keeperFrame) from Reanimated's frame callback. Reduce
// Motion, `animate={false}` or an unfocused screen hold the still pose (t = 0).
import { memo, useContext, useEffect, useId, useMemo } from "react";
import type { ComponentClass } from "react";
import { NavigationContext } from "@react-navigation/native";
import Animated, { useAnimatedProps, useDerivedValue, useFrameCallback, useReducedMotion, useSharedValue } from "react-native-reanimated";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect, Text as SvgText } from "react-native-svg";
import type { GProps } from "react-native-svg";
import type { KeeperMood } from "@/copy";
import { keeperRig as K } from "@/theme";
import { keeperFace, keeperFrame, rotAbout } from "./rig";
import type { HandPose, KeeperAnimName, KeeperPropName } from "./rig";

// `matrix` is G's native transform prop (react-native-svg fabric/GroupNativeComponent); animating it skips
// the JS transform parser. The public GProps type doesn't list it.
const AG = Animated.createAnimatedComponent(G as unknown as ComponentClass<GProps & { matrix?: number[] }>);
const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AEllipse = Animated.createAnimatedComponent(Ellipse);

export interface KeeperSvgProps {
  mood: KeeperMood;
  prop?: KeeperPropName;
  anim?: KeeperAnimName;
  hand?: HandPose;
  /** Width in dp; full body is size × 180/160 high, the bust is square. */
  size: number;
  bust?: boolean;
  animate?: boolean;
}

/** A stable pseudo-random phase in [0, 3) s per Keeper instance. */
function phaseOf(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return (h % 3000) / 1000;
}

export const KeeperSvg = memo(function KeeperSvg({ mood, prop = "none", anim = "idle", hand, size, bust = false, animate = true }: KeeperSvgProps) {
  const reduce = useReducedMotion();
  const nav = useContext(NavigationContext);
  const rid = useId();
  const id = useMemo(() => `k${rid.replace(/[^a-zA-Z0-9]/g, "")}`, [rid]);
  const face = useMemo(() => keeperFace(mood, prop, bust), [mood, prop, bust]);
  const live = animate && !reduce && anim !== "none";
  // The prototype starts idles at a random phase so two Keepers never blink together; peek/popin start at 0.
  const offset = useMemo(() => (anim === "peek" || anim === "popin" ? 0 : phaseOf(rid)), [anim, rid]);
  const t = useSharedValue(0);
  const cb = useFrameCallback((f) => { t.value = Math.max(0.001, f.timeSinceFirstFrame / 1000 + offset); }, false);
  useEffect(() => {
    if (!live) { cb.setActive(false); t.set(0); return; }
    // Pause while the screen is covered (no off-screen frame work).
    cb.setActive(nav ? nav.isFocused() : true);
    if (!nav) return;
    const a = nav.addListener("focus", () => cb.setActive(true));
    const b = nav.addListener("blur", () => cb.setActive(false));
    return () => { a(); b(); cb.setActive(false); };
  }, [live, nav, cb, t]);

  const tilt = face.tilt, gx0 = face.gx, gy0 = face.gyBase;
  const fr = useDerivedValue(() => keeperFrame(mood, prop, anim, hand ?? null, tilt, gx0, gy0, t.value));
  const rootP = useAnimatedProps(() => ({ matrix: fr.value.root }));
  const tiltP = useAnimatedProps(() => ({ matrix: fr.value.tilt }));
  const blinkP = useAnimatedProps(() => ({ matrix: fr.value.blink }));
  const glL = useAnimatedProps(() => ({ cx: 69 + fr.value.gx, cy: fr.value.gy }));
  const glR = useAnimatedProps(() => ({ cx: 97 + fr.value.gx, cy: fr.value.gy }));
  const gl2L = useAnimatedProps(() => ({ cx: 63 + fr.value.gx, cy: fr.value.gy + 4 }));
  const gl2R = useAnimatedProps(() => ({ cx: 91 + fr.value.gx, cy: fr.value.gy + 4 }));
  const slP = useAnimatedProps(() => ({ d: fr.value.sl }));
  const srP = useAnimatedProps(() => ({ d: fr.value.sr }));
  const coinG = useAnimatedProps(() => ({ matrix: [1, 0, 0, 1, 0, fr.value.coin.y] }));
  const coinBack = useAnimatedProps(() => ({ ry: fr.value.coin.ry }));
  const coinTop = useAnimatedProps(() => ({ ry: fr.value.coin.ry, fill: fr.value.coin.fill }));
  const coinFace = useAnimatedProps(() => ({ ry: fr.value.coin.ry2, opacity: fr.value.coin.face ? 1 : 0 }));
  const coinFaceHi = useAnimatedProps(() => ({ opacity: fr.value.coin.face ? 1 : 0 }));
  const coinTrail = useAnimatedProps(() => ({ d: `M140 110 Q144 ${fr.value.coin.ty} 136 ${fr.value.coin.ty2}`, opacity: fr.value.coin.trail ? 0.55 : 0 }));

  const coinOn = !bust && (anim === "flip" || prop === "flip");
  const w = size, h = bust ? size : Math.round((size * 180) / 160);
  const sw = size >= 60 ? 1 : 1.2; // hairline strokes stay visible on tiny busts
  return (
    <Svg width={w} height={h} viewBox={bust ? "28 4 104 104" : "0 0 160 180"} style={{ overflow: bust ? "hidden" : "visible" }}>
      <Defs>
        <ClipPath id={`${id}M`}><Path d={face.mouth ?? "M0 0"} /></ClipPath>
      </Defs>
      <AG animatedProps={rootP}>
        {bust ? null : <Ellipse cx={80} cy={176} rx={54} ry={4} fill={K.floor} />}
        {face.props.scythe ? <Scythe /> : null}
        {bust ? null : <Body />}
        {bust ? null : (
          <>
            <APath animatedProps={slP} stroke={K.sleeve} strokeWidth={16} strokeLinecap="round" fill="none" />
            <APath animatedProps={srP} stroke={K.sleeve} strokeWidth={16} strokeLinecap="round" fill="none" />
            <APath animatedProps={srP} stroke={K.sleeveHi} strokeWidth={1.2} fill="none" transform="translate(5 -2)" />
          </>
        )}
        <AG animatedProps={tiltP}>
          <Head />
          <AG animatedProps={blinkP}>
            {face.bean ? <Path d={face.eL} fill={K.ink} /> : null}
            {face.beanR ? <Path d={face.eR} fill={K.ink} /> : null}
            {face.glL ? <ACircle animatedProps={glL} r={face.gr} fill={K.white} /> : null}
            {face.glR ? <ACircle animatedProps={glR} r={face.gr} fill={K.white} /> : null}
            {face.glL ? <ACircle animatedProps={gl2L} r={1.2} fill={K.white} /> : null}
            {face.glR ? <ACircle animatedProps={gl2R} r={1.2} fill={K.white} /> : null}
            {face.arcL ? <Path d="M56 66 Q66 50 76 66" stroke={K.ink} strokeWidth={6.5} fill="none" strokeLinecap="round" /> : null}
            {face.arcR ? <Path d="M84 66 Q94 50 104 66" stroke={K.ink} strokeWidth={6.5} fill="none" strokeLinecap="round" /> : null}
          </AG>
          <Path d="M80 77.5 C78.4 75.6 75.8 76.6 76.4 79 C77 80.8 78.6 82 80 83 C81.4 82 83 80.8 83.6 79 C84.2 76.6 81.6 75.6 80 77.5 Z" fill={K.ink} />
          {face.stitch ? <Path d={face.stitch} stroke={K.ink} strokeWidth={3.2} fill="none" strokeLinecap="round" /> : null}
          {face.ticks ? <Path d={face.ticks} stroke={K.ink} strokeWidth={2.4} fill="none" strokeLinecap="round" /> : null}
          {face.mouth ? <Path d={face.mouth} fill={K.ink} /> : null}
          {face.teeth ? <G clipPath={`url(#${id}M)`}><Path d={face.teeth} fill={K.face} /></G> : null}
          <G transform={face.shadesSmall ? "translate(80 12) scale(0.62 0.46) translate(-80 -60)" : undefined}><Shades /></G>
          {face.vein ? <Path d="M104 62 Q108 64 106 68 M112 62 Q108 64 110 68 M103 67 Q107 64 111 67" stroke={K.face} strokeWidth={1.8} fill="none" strokeLinecap="round" /> : null}
        </AG>
        {face.spark ? <Path d="M128 30 L130.5 37.5 L138 40 L130.5 42.5 L128 50 L125.5 42.5 L118 40 L125.5 37.5 Z" fill={K.lime} /> : null}
        {face.lines ? <Path d="M62 2 L66 10 M80 -2 L80 7 M98 2 L94 10" stroke={K.face} strokeWidth={2.4} strokeLinecap="round" /> : null}
        {coinOn ? (
          <G>
            <APath animatedProps={coinTrail} stroke={K.lime} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeDasharray="2 5" />
            <AG animatedProps={coinG}>
              <AEllipse animatedProps={coinBack} cx={133} cy={106} rx={10} fill={K.limeDeep} />
              <AEllipse animatedProps={coinTop} cx={133} cy={105} rx={10} stroke={K.ink} strokeWidth={1} />
              <AEllipse animatedProps={coinFace} cx={133} cy={105} rx={5.5} fill="none" stroke={K.limeDark} strokeWidth={1.6} />
              <APath animatedProps={coinFaceHi} d="M127 101 Q130 99 134 99" stroke={K.coinLight} strokeWidth={1.8} fill="none" strokeLinecap="round" />
            </AG>
          </G>
        ) : null}
        {face.props.seal ? <Seal /> : null}
        {face.props.ledger ? <Ledger /> : null}
        {face.props.lens ? <Lens /> : null}
        {face.props.coin ? <Coin /> : null}
        {face.props.sack ? <Sack /> : null}
        {face.props.cup ? <Cup /> : null}
        {bust ? null : <Hands fr={fr} sw={sw} />}
      </AG>
    </Svg>
  );
});

type FrameValue = ReturnType<typeof useDerivedValue<ReturnType<typeof keeperFrame>>>;

function Hands({ fr, sw }: { fr: FrameValue; sw: number }) {
  return (
    <>
      <Hand fr={fr} side="left" sw={sw} />
      <Hand fr={fr} side="right" sw={sw} />
    </>
  );
}

function Hand({ fr, side, sw }: { fr: FrameValue; side: "left" | "right"; sw: number }) {
  const g = useAnimatedProps(() => ({ matrix: fr.value[side].m }));
  const open = useAnimatedProps(() => ({ opacity: fr.value[side].pose === "open" ? 1 : 0 }));
  const fist = useAnimatedProps(() => ({ opacity: fr.value[side].pose === "fist" ? 1 : 0 }));
  const point = useAnimatedProps(() => ({ opacity: fr.value[side].pose === "point" ? 1 : 0 }));
  const thumb = useAnimatedProps(() => ({ opacity: fr.value[side].pose === "thumb" ? 1 : 0 }));
  // rotate(wig 0 -5)
  const wig = useAnimatedProps(() => ({ matrix: rotAbout(fr.value[side].wig, 0, -5) }));
  const st = { stroke: K.ink, strokeWidth: 0.8 * sw };
  const thin = { strokeWidth: 0.75 * sw, fill: "none" };
  return (
    <AG animatedProps={g}>
      <Ellipse cx={0} cy={7.6} rx={6.4} ry={3.4} fill={K.fistShade} />
      <AG animatedProps={open} {...st}>
        <Rect x={-11.4} y={-3.5} width={3.5} height={9} rx={1.75} transform="rotate(-50 -8 1)" fill={K.face} />
        <AG animatedProps={wig}>
          <Rect x={-6.3} y={-15} width={3.2} height={11} rx={1.6} transform="rotate(-11 -4.6 -4)" fill={K.face} />
          <Rect x={-2.6} y={-17} width={3.2} height={13} rx={1.6} transform="rotate(-3 -1 -4)" fill={K.face} />
          <Rect x={1} y={-16.5} width={3.2} height={12.5} rx={1.6} transform="rotate(5 2.6 -4)" fill={K.face} />
          <Rect x={4.5} y={-13.5} width={3} height={10} rx={1.5} transform="rotate(14 6 -4)" fill={K.faceShade} />
          <Path d="M-6.2 -9.6 l2.4 -.5 M-2.4 -11 l2.6 0 M1.5 -10.6 l2.6 .3 M5.2 -8.6 l2.2 .6" {...thin} />
        </AG>
        <Palm />
      </AG>
      <AG animatedProps={fist} {...st}>
        <Knuckles four />
        <Palm />
        <Path d="M-2.9 -4.6 v3 M0.2 -4.9 v3.2 M3.2 -4.5 v3" strokeWidth={0.75 * sw} />
        <Rect x={-8.6} y={-0.4} width={9.6} height={3.7} rx={1.85} fill={K.face} />
        <Hi />
      </AG>
      <AG animatedProps={point} {...st}>
        <Rect x={-6.2} y={-19} width={3.4} height={14} rx={1.7} fill={K.face} />
        <Path d="M-6 -12.5 l3 0" strokeWidth={0.75 * sw} />
        <Knuckles />
        <Palm />
        <Path d="M0.2 -4.9 v3.2 M3.2 -4.5 v3" strokeWidth={0.75 * sw} />
        <Rect x={-8.6} y={-0.4} width={9.6} height={3.7} rx={1.85} fill={K.face} />
        <Hi />
      </AG>
      <AG animatedProps={thumb} {...st}>
        <Rect x={-9.8} y={-17} width={3.8} height={13} rx={1.9} transform="rotate(-6 -8 -4)" fill={K.face} />
        <Knuckles four />
        <Palm />
        <Path d="M-2.9 -4.6 v3 M0.2 -4.9 v3.2 M3.2 -4.5 v3" strokeWidth={0.75 * sw} />
        <Hi />
      </AG>
    </AG>
  );
}

const Knuckles = ({ four }: { four?: boolean }) => (
  <>
    {four ? <Circle cx={-4.4} cy={-5.6} r={2.1} fill={K.face} /> : null}
    <Circle cx={-1.4} cy={-6.3} r={2.1} fill={K.face} />
    <Circle cx={1.7} cy={-6.2} r={2.1} fill={K.face} />
    <Circle cx={4.6} cy={-5.4} r={2} fill={K.faceShade} />
  </>
);
const Palm = () => (
  <>
    <Rect x={-6.8} y={-6.5} width={13.6} height={13} rx={5.2} fill={K.face} />
    <Path d="M3.4 -3.5 Q6 -1 5.2 4" stroke={K.bone2} strokeWidth={2.4} fill="none" strokeLinecap="round" />
  </>
);
const Hi = () => <Path d="M-5 -2.5 Q-4 -4.6 -1.8 -5" stroke={K.white} strokeWidth={1.2} fill="none" strokeLinecap="round" />;

const Scythe = memo(function Scythe() { return (
  <G>
    <Path d="M126 34 L112 176" stroke={K.steel} strokeWidth={5} strokeLinecap="round" />
    <Path d="M126 34 L112 176" stroke={K.shaftHi} strokeWidth={1.2} transform="translate(1.6 0)" />
    <Path d="M128 38 C104 12 70 10 40 26 C68 22 98 28 120 50 Z" fill={K.blade} />
    <Path d="M40 26 C68 22 98 28 120 50" stroke={K.lime} strokeWidth={2} fill="none" />
    <Path d="M58 22 C80 16 100 20 116 34" stroke={K.white} strokeWidth={1.4} fill="none" opacity={0.6} />
  </G>
); });

const Body = memo(function Body() { return (
  <G>
    <Path d="M36 104 C27 128 21 150 15 172 L30 165 L40 176 L54 167 L67 177 L80 168 L93 177 L106 167 L120 176 L130 165 L145 172 C139 150 133 128 124 104 Z" fill={K.cloak} />
    <Path d="M36 104 C28 128 22 150 16 171 L30 165 L36 171 C38 148 40 126 46 108 Z" fill={K.cloakHi} />
    <Path d="M62 116 C60 134 58 152 55 166 M98 116 C100 134 102 152 105 166 M80 122 L80 166" stroke={K.ink2} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <Path d="M124 104 C133 128 139 150 145 172" stroke={K.lime} strokeWidth={2} fill="none" opacity={0.6} />
    <Path d="M68 112 L80 122 L92 112" stroke={K.seam} strokeWidth={1.6} fill="none" />
    <Circle cx={80} cy={127} r={7.5} fill={K.lime} />
    <Circle cx={80} cy={127} r={4.4} fill="none" stroke={K.limeDeep} strokeWidth={1.5} />
    <Path d="M76 123 Q78 121 81 121" stroke={K.hilite} strokeWidth={1.3} fill="none" strokeLinecap="round" />
  </G>
); });

const Head = memo(function Head() { return (
  <G>
    <G transform="rotate(-26 30 40)">
      <Rect x={17} y={20} width={24} height={33} rx={3.5} fill={K.ink} />
      <Rect x={16} y={19} width={24} height={33} rx={3.5} fill={K.paper} />
      <Rect x={18.5} y={21.5} width={19} height={28} rx={2} fill="none" stroke={K.lime} strokeWidth={1.2} />
      <SvgText x={20.5} y={30} fontFamily="Geist_800ExtraBold" fontSize={8} fill={K.ink}>{"A"}</SvgText>
      <Path d="M28 34 C24 38 23 41 26 42 C27 42.5 28 41.6 28 41 L27 45 L29 45 L28 41 C28 41.6 29 42.5 30 42 C33 41 32 38 28 34 Z" fill={K.ink} />
      <Path d="M18 21 L36 21" stroke={K.white} strokeWidth={1} opacity={0.9} />
    </G>
    <Path d="M80 8 C108 8 126 30 130 62 C132 84 128 104 122 118 C108 126 52 126 38 118 C32 104 28 84 30 62 C34 30 52 8 80 8 Z" fill={K.hood} />
    <Path d="M90 10 C106 4 120 6 131 18 C118 13 106 15 98 19 Z" fill={K.hood} />
    <Path d="M38 40 C33 56 32 74 35 92 C37 104 41 112 46 117 C40 100 38 80 40 62 C41 52 44 44 49 34 Z" fill={K.hoodHi} />
    <Path d="M122 30 C130 44 133 64 131 86 C130 98 127 108 123 116" stroke={K.lime} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.75} />
    <Path d="M54 18 C64 11 84 9 100 13" stroke={K.white} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.3} />
    <Path d="M80 22 C100 22 114 38 116 62 C118 86 110 104 100 111 L60 111 C50 104 42 86 44 62 C46 38 60 22 80 22 Z" fill={K.void} stroke={K.rim} strokeWidth={1.5} />
    <Path d="M80 23 C103 23 115 40 115 60 C115 79 104 93 92 99 C86 102 74 102 68 99 C56 93 45 79 45 60 C45 40 57 23 80 23 Z" fill={K.face} />
    <Path d="M100 31 C110 40 115 50 115 60 C115 79 104 93 92 99 C88 101 84 101.5 81 101.5 C92 96 104 84 106 66 C107 52 105 40 100 31 Z" fill={K.faceShade} />
    <Path d="M58 33 C64 27 72 25 80 25" stroke={K.white} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
    <Path d="M51 76 Q53 86 60 92" stroke={K.white} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.55} />
    <Path d="M46 50 Q80 31 114 50 Q80 42 46 54 Z" fill={K.brimShade} />
    <Path d="M33 39 Q80 15 127 39" stroke={K.brimInk} strokeWidth={7} fill="none" strokeLinecap="round" />
    <Path d="M33 39 Q80 15 127 39" stroke={K.limeDark} strokeWidth={4} fill="none" strokeLinecap="round" />
    <Path d="M30 43 Q80 19 130 43 Q132 49 125 50 Q80 30 35 50 Q28 49 30 43 Z" fill={K.brim} stroke={K.lime} strokeWidth={1.4} />
    <Path d="M38 43 Q80 24 122 43" stroke={K.white} strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.75} />
    <Path d="M36 48 Q80 28 124 48" stroke={K.limeMoss} strokeWidth={1.4} fill="none" opacity={0.7} />
  </G>
); });

const Shades = memo(function Shades() { return (
  <G>
    <Path d="M44 57 Q80 51 116 57 Q117 75 101 75 Q88 75 86 64 Q80 61 74 64 Q72 75 59 75 Q43 75 44 57 Z" fill={K.shades} stroke={K.shadesRim} strokeWidth={1.2} />
    <Path d="M53 62 Q58 59 64 60 M89 62 Q94 59 100 60" stroke={K.lime} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    <Path d="M106 60 L110 66 M68 60 L71 64" stroke={K.white} strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
  </G>
); });

const Seal = () => (
  <G>
    <Rect x={122} y={80} width={12} height={22} rx={5} fill={K.steel} stroke={K.steelHi} />
    <Rect x={116} y={100} width={24} height={9} rx={2.5} fill={K.lime} />
    <Rect x={116} y={106} width={24} height={3} fill={K.seal} />
  </G>
);
const Ledger = () => (
  <G transform="rotate(-12 120 134)">
    <Rect x={100} y={120} width={40} height={30} rx={3} fill={K.steel} />
    <Rect x={102} y={118} width={36} height={28} rx={2} fill={K.face} />
    <Path d="M120 119 L120 145" stroke={K.ledgerLine} strokeWidth={1.5} />
    <Path d="M106 126 L116 126 M106 131 L116 131 M106 136 L114 136 M124 126 L134 126 M124 131 L132 131" stroke={K.ledgerInk} strokeWidth={1.5} />
    <Rect x={128} y={114} width={5} height={12} fill={K.lime} />
  </G>
);
const Lens = () => (
  <G>
    <Path d="M131 104 L127 116" stroke={K.steelHi} strokeWidth={5} strokeLinecap="round" />
    <Circle cx={137} cy={90} r={13} fill={K.lensGlass} stroke={K.lens} strokeWidth={4} />
    <Path d="M130 84 Q133 80 138 80" stroke={K.white} strokeWidth={2} fill="none" strokeLinecap="round" />
  </G>
);
const Coin = () => (
  <G>
    <Circle cx={136} cy={98} r={12} fill={K.seal} />
    <Circle cx={135} cy={96} r={12} fill={K.lime} />
    <Circle cx={135} cy={96} r={7.5} fill="none" stroke={K.limeDeep} strokeWidth={1.8} />
    <Path d="M129 90 Q132 87 136 87" stroke={K.hilite} strokeWidth={1.6} fill="none" strokeLinecap="round" />
  </G>
);
const Sack = () => (
  <G>
    <Path d="M129 98 Q126 92 133 91 L145 91 Q151 92 147 98 Q160 108 156 124 Q153 132 138 132 Q123 132 120 124 Q116 108 129 98 Z" fill={K.lime} />
    <Path d="M142 100 Q154 110 151 124 Q149 130 140 131 Q150 122 146 104 Z" fill={K.sackShade} />
    <Path d="M129 98 L147 98" stroke={K.sackDeep} strokeWidth={2.4} />
    <Path d="M133 116 L143 116 M138 110 L138 122" stroke={K.limeDark} strokeWidth={2.2} strokeLinecap="round" />
  </G>
);
const Cup = () => (
  <G>
    <Rect x={112} y={110} width={20} height={24} rx={4} fill={K.face} />
    <Rect x={126} y={110} width={6} height={24} rx={3} fill={K.cupShade} />
    <Path d="M132 115 Q140 117 132 126" stroke={K.face} strokeWidth={3} fill="none" />
    <Path d="M117 104 Q114 99 118 95 Q121 91 118 86 M124 104 Q121 99 125 95" stroke={K.steam} strokeWidth={1.8} fill="none" strokeLinecap="round" />
  </G>
);
