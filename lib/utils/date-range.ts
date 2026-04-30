const pad = (n: number) => String(n).padStart(2, '0')
const toDateStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

export function buildMonthDateRange(now: Date) {
  const curYear = now.getFullYear()
  const curMonth = now.getMonth()
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1
  const prevYear = curMonth === 0 ? curYear - 1 : curYear

  const curMonthLastDay = new Date(curYear, curMonth + 1, 0).getDate()
  const prevMonthLastDt = new Date(curYear, curMonth, 0)

  return {
    // ISO timestamps for timestamp/timestamptz columns (e.g. orders.created_at)
    curMonthStart: new Date(curYear, curMonth, 1).toISOString(),
    curMonthEnd: new Date(curYear, curMonth + 1, 0, 23, 59, 59).toISOString(),
    prevMonthStart: new Date(prevYear, prevMonth, 1).toISOString(),
    prevMonthEnd: new Date(curYear, curMonth, 0, 23, 59, 59).toISOString(),
    todayStart: new Date(curYear, curMonth, now.getDate()).toISOString(),
    todayEnd: new Date(curYear, curMonth, now.getDate() + 1).toISOString(),
    // YYYY-MM-DD strings for date columns (revenue_entries.date, expense_entries.date)
    curMonthStartDate: toDateStr(curYear, curMonth, 1),
    curMonthEndDate: toDateStr(curYear, curMonth, curMonthLastDay),
    prevMonthStartDate: toDateStr(prevYear, prevMonth, 1),
    prevMonthEndDate: toDateStr(
      prevMonthLastDt.getFullYear(),
      prevMonthLastDt.getMonth(),
      prevMonthLastDt.getDate(),
    ),
    todayDate: toDateStr(curYear, curMonth, now.getDate()),
  }
}
