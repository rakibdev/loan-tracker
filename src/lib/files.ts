import * as DocumentPicker from "expo-document-picker"
import { File, Paths } from "expo-file-system"
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import { backupDatabaseAsync, deserializeDatabaseAsync, type SQLiteDatabase } from "expo-sqlite"
import { Platform } from "react-native"
import { fileDate, formatDate, today } from "./date"
import i18n from "./i18n"
import { byCurrency, type Entry } from "./loan"
import { money } from "./money"

const web = Platform.OS == "web"

const download = (data: Blob, name: string) => {
  const link = document.createElement("a")
  link.href = URL.createObjectURL(data)
  link.download = name
  link.click()
  URL.revokeObjectURL(link.href)
}

const print = (page: string) => {
  const frame = document.createElement("iframe")
  frame.style.display = "none"
  frame.srcdoc = page
  frame.onload = () => {
    frame.contentWindow!.onafterprint = () => frame.remove()
    frame.contentWindow!.print()
  }
  document.body.append(frame)
}

const cacheFile = (name: string) => {
  const file = new File(Paths.cache, name)
  if (file.exists) file.delete()
  return file
}

const escape = (text: string) => text.replace(/[&<>"]/g, char => `&#${char.charCodeAt(0)};`)

const totals = (loans: Entry[]) =>
  byCurrency(loans)
    .map(([currency, group]) => {
      const sum = (kind: string) => group.filter(loan => loan.kind == kind).reduce((total, loan) => total + loan.left, 0)
      return `<p><b>${i18n.t("toCollect")}:</b> ${money(sum("given"), currency)} &nbsp; <b>${i18n.t("toPay")}:</b> ${money(sum("taken"), currency)}</p>`
    })
    .join("")

const html = (loans: Entry[]) => {
  const { t } = i18n
  const headers = ["name", "type", "date", "amount", "interest", "paid", "remaining", "due", "status"].map(key => `<th>${t(key)}</th>`).join("")
  const rows = loans
    .map(loan => {
      const cells = [
        `${escape(loan.name)}${loan.phone ? `<br><small>${escape(loan.phone)}</small>` : ""}`,
        t(loan.kind),
        formatDate(loan.date),
        money(loan.amount, loan.currency),
        loan.rate ? `${loan.rate}% ${t(`${loan.interest}Type`)}<br><small>${money(loan.accrued, loan.currency)}</small>` : t("noInterest"),
        money(loan.paid, loan.currency),
        money(loan.left, loan.currency),
        loan.next ? formatDate(loan.next) : "",
        t(loan.settled ? "paid" : loan.overdue ? "overdue" : "active"),
      ]
      return `<tr class="${loan.overdue ? "overdue" : ""}">${cells.map(cell => `<td>${cell}</td>`).join("")}</tr>`
    })
    .join("")
  return `<!doctype html><html><head><meta charset="utf-8"><title>loans-${fileDate()}</title><style>
    @page { margin: 0; }
    body { font-family: sans-serif; font-size: 11px; margin: 0; padding: 24px; }
    h1 { font-size: 20px; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; vertical-align: top; }
    th { background: #f2f2f2; }
    small { color: #666; }
    .overdue td { color: #b3261e; }
  </style></head><body>
    <h1>${t("loans")}</h1>
    <small>${t("generated", { date: formatDate(today()) })}</small>
    ${totals(loans)}
    <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
  </body></html>`
}

export const exportPdf = async (loans: Entry[]) => {
  if (web) return print(html(loans))
  const { uri } = await Print.printToFileAsync({ html: html(loans) })
  const file = cacheFile(`loans-${fileDate()}.pdf`)
  new File(uri).moveSync(file)
  await Sharing.shareAsync(file.uri, { mimeType: "application/pdf" })
}

export const backup = async (db: SQLiteDatabase) => {
  const bytes = await db.serializeAsync()
  const name = `loans-${fileDate()}.db`
  if (web) return download(new Blob([bytes as Uint8Array<ArrayBuffer>]), name)
  const file = cacheFile(name)
  await file.write(bytes)
  await Sharing.shareAsync(file.uri, { mimeType: "application/x-sqlite3" })
}

export const pickBackup = async () => {
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true })
  if (result.canceled) return
  const [asset] = result.assets
  return web ? new Uint8Array(await asset.file!.arrayBuffer()) : new File(asset.uri).bytes()
}

export const restore = async (db: SQLiteDatabase, bytes: Uint8Array) => {
  const source = await deserializeDatabaseAsync(bytes)
  try {
    await source.getFirstAsync("SELECT 1 FROM loans, payments LIMIT 1")
    await backupDatabaseAsync({ sourceDatabase: source, destDatabase: db })
  } finally {
    await source.closeAsync()
  }
}
