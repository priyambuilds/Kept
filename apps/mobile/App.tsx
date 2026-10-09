import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { color } from "@/theme";
import { useAppFonts } from "@/theme/fonts";

export default function App() {
  const [loaded] = useAppFonts();
  if (!loaded) return null;
  return (
    <View style={{ flex: 1, backgroundColor: color.bg.app }}>
      <StatusBar style="light" />
    </View>
  );
}
