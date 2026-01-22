import BottomAppBar from "@/components/Basic/AppBar/AppBar";
import { AuthProvider } from "@/context/AuthContext";
import { MessageProvider } from "@/context/MessageContext";
import { useTheme } from "@/hooks/System/useThemedBackground";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
  const { colors } = useTheme()
  return (
    <AuthProvider>
      <MessageProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <Stack screenOptions={{ headerShown: false }}/>
          <BottomAppBar/>
        </SafeAreaView>
      </MessageProvider>
    </AuthProvider>
  )
}
