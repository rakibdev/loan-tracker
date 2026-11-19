import "@/global.css"
import "@/lib/interop"
import { Stack, ThemeProvider } from "expo-router"
import { SQLiteProvider } from "expo-sqlite"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { PaperProvider } from "react-native-paper"
import { migrate } from "@/lib/db"
import { ready } from "@/lib/i18n"
import { setupReminders } from "@/lib/remind"
import { useThemes } from "@/lib/theme"

export default function Layout() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    ready.then(() => setLoaded(true))
  }, [])
  return loaded && <Root />
}

const Root = () => {
  const { t } = useTranslation()
  const { isDark, paper, navigation } = useThemes()
  useEffect(setupReminders, [])
  return (
    <SQLiteProvider databaseName="loans.db" onInit={migrate}>
      <PaperProvider theme={paper}>
        <ThemeProvider value={navigation}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: t("settings") }} />
            <Stack.Screen name="loan/new" options={{ title: t("newLoan") }} />
            <Stack.Screen name="loan/[id]/index" options={{ title: "" }} />
            <Stack.Screen name="loan/[id]/edit" options={{ title: t("editLoan") }} />
            <Stack.Screen name="loan/[id]/schedule" options={{ title: t("schedule") }} />
            <Stack.Screen name="loan/[id]/payment" options={{ title: t("addPayment") }} />
            <Stack.Screen name="payment/[id]" options={{ title: t("editPayment") }} />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </SQLiteProvider>
  )
}
