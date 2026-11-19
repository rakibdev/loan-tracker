import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { Card, Text } from "react-native-paper"
import { duration } from "@/lib/duration"
import type { Entry } from "@/lib/loan"
import { money } from "@/lib/money"
import { useAppTheme } from "@/lib/theme"
import { Bar } from "./Bar"
import { Status } from "./Status"

export const LoanRow = ({ loan }: { loan: Entry }) => {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  const progress = loan.total ? loan.paid / loan.total : 1
  return (
    <Card mode="contained" style={{ backgroundColor: colors.elevation.level1 }} onPress={() => router.push(`/loan/${loan.id}`)}>
      <Card.Content className="gap-2">
        <View className="flex-row items-center gap-2">
          <Text variant="titleMedium" className="flex-1" numberOfLines={1}>
            {loan.name}
          </Text>
          <Status loan={loan} />
        </View>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {t(loan.kind)} {money(loan.amount, loan.currency)} · {duration(t, loan)}
        </Text>
        <View className="flex-row items-center gap-3">
          <Bar progress={progress} done={loan.settled} />
          <Text variant="labelLarge">{Math.floor(Math.min(progress, 1) * 100)}%</Text>
        </View>
      </Card.Content>
    </Card>
  )
}
