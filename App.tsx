import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TournamentCalendarScreen from "./src/TournamentCalendarScreen";
import Toast from "react-native-toast-message";

export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <TournamentCalendarScreen />
      <Toast />
    </SafeAreaProvider>
  );
}
