import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_800ExtraBold, Geist_900Black } from "@expo-google-fonts/geist";
import { GeistMono_500Medium, GeistMono_600SemiBold } from "@expo-google-fonts/geist-mono";
import { useFonts } from "expo-font";

/** Every weight the type scale uses (tokens.json › font). Names match fontFamily() in theme/index.ts. */
const FONT_MAP = {
  Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_800ExtraBold, Geist_900Black,
  GeistMono_500Medium, GeistMono_600SemiBold,
};

export const useAppFonts = () => useFonts(FONT_MAP);
