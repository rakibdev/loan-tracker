import { router } from "expo-router"
import { Tabs } from "expo-router/js-tabs"
import { useTranslation } from "react-i18next"
import { IconButton } from "react-native-paper"

const settings = () => <IconButton icon="cog-outline" onPress={() => router.push("/settings")} />

export default function TabsLayout() {
  const { t } = useTranslation()
  return (
    <Tabs
      screenOptions={{
        headerRight: settings,
        headerShadowVisible: false,
        tabBarIcon: () => null,
        tabBarIconStyle: { display: "none" },
        tabBarLabelStyle: { fontSize: 15, fontWeight: "600" },
        tabBarLabelPosition: "beside-icon",
        tabBarStyle: { borderTopWidth: 0, elevation: 0 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), headerShown: false }} />
      <Tabs.Screen name="overview" options={{ title: t("overview") }} />
    </Tabs>
  )
}
