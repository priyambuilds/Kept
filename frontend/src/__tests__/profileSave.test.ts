// Saving a look from the avatar builder (I9) keeps the look, and doesn't finish onboarding: A4 › Customize saves
// mid-onboarding, and only "Looks like me" ends it.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { profileActions } from "@/features/queries";
import { setAppMode, startDemo } from "@/features/mode";
import { useSession } from "@/state/session";

beforeEach(async () => { await setAppMode(null); await AsyncStorage.clear(); });

it("keeps the look without marking the user onboarded", async () => {
  await startDemo();
  useSession.setState({ onboarded: false, avatar: null });
  await profileActions.save({ avatar: "27313503" });
  expect(useSession.getState()).toMatchObject({ avatar: "27313503", onboarded: false });
});

it("a user who already finished onboarding stays onboarded", async () => {
  await startDemo();
  useSession.getState().finishOnboarding("13050010");
  await profileActions.save({ avatar: "27313503" });
  expect(useSession.getState()).toMatchObject({ avatar: "27313503", onboarded: true });
});
