// Haptics from design/motion.md (expo-haptics). One place so screens name the moment, not the API.
// Failures are ignored: haptics are decoration (emulators and some devices have none).
import * as Haptics from "expo-haptics";

const fire = (p: Promise<void>) => { p.catch(() => undefined); };
const later = (ms: number, f: () => void) => { setTimeout(f, ms); };

export const haptic = {
  light: () => fire(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => fire(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => fire(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  /** motion.md §6 broken: notificationError, then impactHeavy 150 ms later. */
  broken: () => { haptic.error(); later(150, haptic.heavy); },
  /** motion.md §8 comeback: notificationSuccess, then impactMedium 250 ms later ("double knock"). */
  comeback: () => { haptic.success(); later(250, haptic.medium); },
  /** One impactLight per value pill at its delay (motion.md §4/§7). */
  pills: (delays: number[]) => { for (const d of delays) later(d, haptic.light); },
};
