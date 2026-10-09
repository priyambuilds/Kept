import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastHost } from "@/components/chrome";
import { DevMenu } from "@/dev/DevMenu";
import { FxHost, OfflineHost } from "@/app/hosts";
import { RootNavigator } from "@/app/RootNavigator";
import { queryClient } from "@/api/queries";
import { color } from "@/theme";
import { useAppFonts } from "@/theme/fonts";

export default function App() {
  const [loaded] = useAppFonts();
  if (!loaded) return <View style={{ flex: 1, backgroundColor: color.bg.app }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg.app }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastHost>
            <StatusBar style="light" />
            <RootNavigator />
            <FxHost />
            <OfflineHost />
            {__DEV__ ? <DevMenu /> : null}
          </ToastHost>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
