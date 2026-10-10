// How much shorter this phone is than the design's 844 dp frame (1 on that frame or taller). Tall heroes
// (the big Keepers, the proof camera) shrink by it so titles and amounts stay above the pinned buttons.
import { useWindowDimensions } from "react-native";
import { metrics } from "@/theme";

export function useHeightScale(): number {
  const { height } = useWindowDimensions();
  return Math.min(1, height / metrics.frameHeight);
}
