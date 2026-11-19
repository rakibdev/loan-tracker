import { useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { FlatList } from "react-native"
import { DataTable } from "react-native-paper"
import { formatDate, today } from "@/lib/date"
import { loadLoan, useFocusLoad } from "@/lib/db"
import { money } from "@/lib/money"
import { useAppTheme } from "@/lib/theme"

export default function Schedule() {
  const { t } = useTranslation()
  const { colors } = useAppTheme()
  const id = Number(useLocalSearchParams<{ id: string }>().id)
  const loan = useFocusLoad(db => loadLoan(db, id))
  if (!loan) return
  const now = today()

  return (
    <FlatList
      data={loan.rows}
      keyExtractor={row => row.date}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <DataTable.Header style={{ backgroundColor: colors.background }}>
          <DataTable.Title>{t("date")}</DataTable.Title>
          <DataTable.Title numeric>{t("amount")}</DataTable.Title>
          <DataTable.Title numeric>{t("status")}</DataTable.Title>
        </DataTable.Header>
      }
      renderItem={({ item: row }) => {
        const rest = row.amount - row.paid
        const late = rest > 0 && row.date < now
        return (
          <DataTable.Row>
            <DataTable.Cell>{formatDate(row.date)}</DataTable.Cell>
            <DataTable.Cell numeric>{money(row.amount, loan.currency)}</DataTable.Cell>
            <DataTable.Cell numeric textStyle={{ color: late ? colors.error : rest ? colors.onSurface : colors.success }}>
              {!rest ? t("paid") : row.paid || late ? t("rowDue", { amount: money(rest, loan.currency) }) : ""}
            </DataTable.Cell>
          </DataTable.Row>
        )
      }}
      ListFooterComponent={
        <DataTable.Row>
          <DataTable.Cell textStyle={{ fontWeight: "bold" }}>{t("total")}</DataTable.Cell>
          <DataTable.Cell numeric textStyle={{ fontWeight: "bold" }}>
            {money(loan.total, loan.currency)}
          </DataTable.Cell>
          <DataTable.Cell numeric textStyle={{ fontWeight: "bold" }}>
            {t("totalPaid", { amount: money(loan.paid, loan.currency) })}
          </DataTable.Cell>
        </DataTable.Row>
      }
    />
  )
}
