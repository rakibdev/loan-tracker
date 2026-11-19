import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { Text } from "react-native-paper"
import type { Entry } from "@/lib/loan"
import { useAppTheme } from "@/lib/theme"

export const Status = ({ loan }: { loan: Entry }) => {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  if (!loan.settled && !loan.overdue) return
  const [background, color] = loan.settled ? [colors.successContainer, colors.success] : [colors.errorContainer, colors.error]
  return (
    <View className="rounded-full px-3 py-1" style={{ backgroundColor: background }}>
      <Text variant="labelMedium" style={{ color }}>
        {t(loan.settled ? "paid" : "overdue")}
      </Text>
    </View>
  )
}
