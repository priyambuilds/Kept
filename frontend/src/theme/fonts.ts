// One path per weight: the packages' index files require all 18 weights and italics, which would ship every .ttf.
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { Geist_800ExtraBold } from "@expo-google-fonts/geist/800ExtraBold";
import { Geist_900Black } from "@expo-google-fonts/geist/900Black";
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { GeistMono_600SemiBold } from "@expo-google-fonts/geist-mono/600SemiBold";
import { useFonts } from "expo-font";

/** Every weight the type scale uses (tokens.json › font). Names match fontFamily() in theme/index.ts. */
const FONT_MAP = {
  Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_800ExtraBold, Geist_900Black,
  GeistMono_500Medium, GeistMono_600SemiBold,
};

export const useAppFonts = () => useFonts(FONT_MAP);
