// The on-screen keyboard's height (0 when hidden). With edge-to-edge on Android the window doesn't
// resize for the keyboard, so screens lift their pinned actions by this much themselves.
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export function useKeyboardHeight(): number {
  const [h, setH] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => setH(e.endCoordinates.height));
    const hide = Keyboard.addListener("keyboardDidHide", () => setH(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return h;
}
