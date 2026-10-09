import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastHost } from "@/components/chrome";
import { Gallery } from "@/dev/Gallery";
import { color } from "@/theme";
import { useAppFonts } from "@/theme/fonts";

// Phase 1: the app opens straight into the dev Gallery. Phase 2 replaces this with the navigation shell.
export default function App() {
  const [loaded] = useAppFonts();
  if (!loaded) return <View style={{ flex: 1, backgroundColor: color.bg.app }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg.app }}>
      <SafeAreaProvider>
        <ToastHost>
          <StatusBar style="light" />
          <Gallery />
        </ToastHost>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
