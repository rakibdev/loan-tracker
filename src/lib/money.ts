export const currencies: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  SAR: "SAR ",
  AED: "AED ",
  MYR: "RM ",
}

export const money = (value: number, currency: string) =>
  `${currencies[currency] ?? `${currency} `}${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

export const grouped = (text: string) => {
  const [whole, ...decimals] = text.replace(/[^\d.]/g, "").split(".")
  const integer = whole ? Number(whole).toLocaleString("en-IN") : decimals.length ? "0" : ""
  return decimals.length ? `${integer}.${decimals.join("").slice(0, 2)}` : integer
}

export const parseMoney = (text: string) => Number(text.replaceAll(",", ""))

export const round = (value: number) => Math.round(value * 100) / 100
