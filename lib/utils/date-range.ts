export function buildMonthDateRange(now: Date) {
  const curYear = now.getFullYear()
  const curMonth = now.getMonth()
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1
  const prevYear = curMonth === 0 ? curYear - 1 : curYear

  return {
    curMonthStart: new Date(curYear, curMonth, 1).toISOString(),
    curMonthEnd: new Date(curYear, curMonth + 1, 0, 23, 59, 59).toISOString(),
    prevMonthStart: new Date(prevYear, prevMonth, 1).toISOString(),
    prevMonthEnd: new Date(curYear, curMonth, 0, 23, 59, 59).toISOString(),
    todayStart: new Date(curYear, curMonth, now.getDate()).toISOString(),
    todayEnd: new Date(curYear, curMonth, now.getDate() + 1).toISOString(),
  }
}
