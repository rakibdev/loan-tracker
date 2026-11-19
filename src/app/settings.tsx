import { useSQLiteContext } from "expo-sqlite"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"
import { List, SegmentedButtons, Snackbar } from "react-native-paper"
import { Confirm } from "@/components/Confirm"
import { Select } from "@/components/Select"
import { loadLoans } from "@/lib/db"
import { backup, exportPdf, pickBackup, restore } from "@/lib/files"
import i18n from "@/lib/i18n"
import { remindAll } from "@/lib/remind"
import { type Language, setSetting, type Theme, useSettings } from "@/lib/settings"

export default function Settings() {
  const { t } = useTranslation()
  const db = useSQLiteContext()
  const { language, theme } = useSettings()
  const [pending, setPending] = useState<Uint8Array>()
  const [message, setMessage] = useState("")

  const changeLanguage = (value: Language) => {
    setSetting("language", value)
    i18n.changeLanguage(value)
  }

  const pick = async () => setPending(await pickBackup())

  const apply = async () => {
    const bytes = pending!
    setPending(undefined)
    try {
      await restore(db, bytes)
      await remindAll(await loadLoans(db))
      setMessage(t("restored"))
    } catch {
      setMessage(t("restoreFailed"))
    }
  }

  return (
    <View className="flex-1">
    <ScrollView contentContainerClassName="pb-10">
      <List.Section>
        <Select
          className="mx-4"
          label={t("language")}
          value={language}
          onChange={changeLanguage}
          options={[
            { value: "bn" as const, label: "বাংলা" },
            { value: "en" as const, label: "English" },
          ]}
        />
      </List.Section>
      <List.Section>
        <List.Subheader>{t("theme")}</List.Subheader>
        <SegmentedButtons
          style={{ marginHorizontal: 16 }}
          value={theme}
          onValueChange={value => setSetting("theme", value as Theme)}
          buttons={(["system", "light", "dark"] as const).map(value => ({ value, label: t(value) }))}
        />
      </List.Section>
      <List.Section>
        <List.Subheader>{t("data")}</List.Subheader>
        <List.Item title={t("exportPdf")} left={props => <List.Icon {...props} icon="file-pdf-box" />} onPress={async () => exportPdf(await loadLoans(db))} />
        <List.Item title={t("backup")} left={props => <List.Icon {...props} icon="database-export-outline" />} onPress={() => backup(db)} />
        <List.Item title={t("restore")} left={props => <List.Icon {...props} icon="database-import-outline" />} onPress={pick} />
      </List.Section>
    </ScrollView>
      <Confirm visible={!!pending} message={t("restoreConfirm")} action={t("restore")} onDismiss={() => setPending(undefined)} onConfirm={apply} />
      <Snackbar visible={!!message} onDismiss={() => setMessage("")} duration={3000}>
        {message}
      </Snackbar>
    </View>
  )
}
