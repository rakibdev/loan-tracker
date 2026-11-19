import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"
import { Card, Text } from "react-native-paper"
import { loadLoans, useFocusLoad } from "@/lib/db"
import type { Entry } from "@/lib/loan"
import { useAppTheme } from "@/lib/theme"

const counts = (loans: Entry[]) => ({
  given: loans.filter(loan => loan.kind == "given").length,
  taken: loans.filter(loan => loan.kind == "taken").length,
  active: loans.filter(loan => !loan.settled).length,
  paid: loans.filter(loan => loan.settled).length,
})

export default function Overview() {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  const loans = useFocusLoad(loadLoans)
  const tones = {
    given: [colors.successContainer, colors.success],
    taken: [colors.warningContainer, colors.warning],
    active: [colors.primaryContainer, colors.onPrimaryContainer],
    paid: [colors.successContainer, colors.success],
  }

  return (
    <ScrollView contentContainerClassName="gap-6 p-4">
      {loans && !loans.length && (
        <Text variant="titleMedium" className="pt-16 text-center">
          {t("empty")}
        </Text>
      )}
      {!!loans?.length && (
        <View className="flex-row flex-wrap gap-3">
          {Object.entries(counts(loans)).map(([key, value]) => {
            const [container, color] = tones[key as keyof typeof tones]
            return (
              <Card key={key} mode="contained" className="min-w-[45%] flex-1" style={{ backgroundColor: container }}>
                <Card.Content className="gap-1">
                  <Text variant="labelLarge" style={{ color }}>
                    {t(key)}
                  </Text>
                  <Text variant="headlineSmall" style={{ color }}>
                    {value}
                  </Text>
                </Card.Content>
              </Card>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}
