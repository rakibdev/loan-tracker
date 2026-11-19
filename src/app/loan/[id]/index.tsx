import { router, Stack, useLocalSearchParams } from "expo-router"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Linking, ScrollView, View } from "react-native"
import { Button, Divider, IconButton, Text, TouchableRipple } from "react-native-paper"
import { Bar } from "@/components/Bar"
import { Status } from "@/components/Status"
import { formatDate } from "@/lib/date"
import { loadLoan, useFocusLoad } from "@/lib/db"
import { duration } from "@/lib/duration"
import { money } from "@/lib/money"
import { useAppTheme } from "@/lib/theme"

const Line = ({ label, children }: { label: string; children: ReactNode }) => {
  const { colors } = useAppTheme()
  return (
    <View className="min-h-10 flex-row items-center gap-3">
      <Text variant="bodyMedium" className="w-28" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
      <View className="flex-1 flex-row items-center justify-between gap-2">{children}</View>
    </View>
  )
}

export default function LoanDetail() {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  const id = Number(useLocalSearchParams<{ id: string }>().id)
  const loan = useFocusLoad(db => loadLoan(db, id))
  if (!loan) return
  const cash = (value: number) => money(value, loan.currency)

  return (
    <ScrollView contentContainerClassName="gap-5 p-4 pb-10">
      <Stack.Screen
        options={{
          title: loan.name,
          headerRight: () => (
            <Button mode="contained-tonal" icon="pencil-outline" style={{ marginRight: 12 }} onPress={() => router.push(`/loan/${id}/edit`)}>
              {t("edit")}
            </Button>
          ),
        }}
      />
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="titleLarge" className="flex-1 font-bold">
            {t("ofPaid", { paid: cash(loan.paid), total: cash(loan.total) })}
          </Text>
          <Status loan={loan} />
        </View>
        <View className="flex-row">
          <Bar progress={loan.total ? loan.paid / loan.total : 1} done={loan.settled} />
        </View>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {t("left", { amount: cash(loan.left) })}
        </Text>
      </View>

      <View>
        <Line label={t(loan.kind)}>
          <Text variant="bodyLarge">
            {cash(loan.amount)} · {formatDate(loan.date)} · {duration(t, loan)}
          </Text>
        </Line>
        <Line label={t("interest")}>
          <Text variant="bodyLarge">
            {loan.rate ? t("interestLine", { rate: loan.rate, type: t(`${loan.interest}Type`), amount: cash(loan.accrued) }) : t("noInterest")}
          </Text>
        </Line>
        {loan.installment ? (
          <Line label={t("installment")}>
            <Text variant="bodyLarge">{t("installmentLine", { amount: cash(loan.installment) })}</Text>
            <Button compact onPress={() => router.push(`/loan/${id}/schedule`)}>
              {t("schedule")}
            </Button>
          </Line>
        ) : (
          loan.due && (
            <Line label={t("due")}>
              <Text variant="bodyLarge" style={loan.overdue ? { color: colors.error } : undefined}>
                {formatDate(loan.due)}
              </Text>
            </Line>
          )
        )}
        {!!loan.phone && (
          <Line label={t("phone")}>
            <Text variant="bodyLarge">{loan.phone}</Text>
            <IconButton icon="phone" size={20} onPress={() => Linking.openURL(`tel:${loan.phone}`)} />
          </Line>
        )}
        {!!loan.note && (
          <Line label={t("note")}>
            <Text variant="bodyLarge" className="flex-1">
              {loan.note}
            </Text>
          </Line>
        )}
      </View>

      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text variant="titleMedium">{t("payments")}</Text>
          <Button mode="contained-tonal" icon="plus" onPress={() => router.push(`/loan/${id}/payment`)}>
            {t("addPayment")}
          </Button>
        </View>
        <Divider className="my-2" />
        {!loan.payments.length && (
          <Text variant="bodyMedium" className="py-4" style={{ color: colors.onSurfaceVariant }}>
            {t("noPayments")}
          </Text>
        )}
        {loan.payments.map(payment => (
          <TouchableRipple key={payment.id} className="rounded-lg px-2 py-3" onPress={() => router.push(`/payment/${payment.id}`)}>
            <View className="flex-row justify-between gap-3">
              <Text variant="bodyLarge">{formatDate(payment.date)}</Text>
              <View className="flex-1 items-end">
                <Text variant="bodyLarge">{cash(payment.amount)}</Text>
                {!!payment.note && (
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {payment.note}
                  </Text>
                )}
              </View>
            </View>
          </TouchableRipple>
        ))}
      </View>
    </ScrollView>
  )
}
