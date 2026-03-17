import type { CalendarCell } from "./types";

export function padDate(value: number) {
  return value.toString().padStart(2, "0");
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;
}

export function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateLong(dateKey: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dateFromKey(dateKey));
}

export function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function buildCalendar(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    if (index < firstWeekDay) {
      const day = previousMonthDays - firstWeekDay + index + 1;
      const dayDate = new Date(year, month - 1, day);
      cells.push({ dateKey: toDateKey(dayDate), dayNumber: day, inCurrentMonth: false });
      continue;
    }

    if (index >= firstWeekDay + totalDays) {
      const day = index - firstWeekDay - totalDays + 1;
      const dayDate = new Date(year, month + 1, day);
      cells.push({ dateKey: toDateKey(dayDate), dayNumber: day, inCurrentMonth: false });
      continue;
    }

    const day = index - firstWeekDay + 1;
    const dayDate = new Date(year, month, day);
    cells.push({ dateKey: toDateKey(dayDate), dayNumber: day, inCurrentMonth: true });
  }

  return cells;
}
