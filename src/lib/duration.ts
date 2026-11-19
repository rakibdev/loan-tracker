import type { TFunction } from "i18next"
import { daysBetween } from "./date"
import type { Entry } from "./loan"

export const duration = (t: TFunction, loan: Entry) => {
  const days = daysBetween(loan.date, loan.end)
  if (!days) return t("today")
  const text = loan.months ? t("months", { count: loan.months }) : t("days", { count: days })
  return loan.settled ? text : t("ago", { duration: text })
}
