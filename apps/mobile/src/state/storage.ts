import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

/** AsyncStorage for zustand `persist`. Values are JSON; bigint is never stored. */
export const persistStorage = createJSONStorage(() => AsyncStorage);
