// What a screen shows while its content mounts (D-83): the bar and ambient light are already real (Screen
// draws them), the column gets a title and three cards in the app's own sizes, sweeping as one light.
// Heights follow the screen height like the heroes do, so a short phone shows the same shape.
import { View } from "react-native";
import { metrics, radius, space } from "@/theme";
import { useHeightScale } from "@/lib/screenScale";
import { ShimmerProvider } from "../primitives";
import { Skeleton } from "../content/Basics";

export function ScreenSkeleton() {
  const sy = useHeightScale();
  const s = metrics.skeleton;
  return (
    <ShimmerProvider>
      <View style={{ gap: space[8] }}>
        <Skeleton height={s.title} width="62%" radiusPx={s.lineRadius} />
        <Skeleton height={s.sub} width="42%" radiusPx={s.lineRadius} />
      </View>
      {s.cards.map((h, i) => <Skeleton key={i} height={Math.round(h * sy)} radiusPx={radius.card} />)}
    </ShimmerProvider>
  );
}
