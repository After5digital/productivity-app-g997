import { format, isToday, isBefore, startOfDay, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, differenceInDays } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatShortDate(date: string | Date): string {
  return format(new Date(date), 'MMM d');
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isBefore(startOfDay(parseISO(dueDate)), startOfDay(new Date()));
}

export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isToday(parseISO(dueDate));
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getLast90Days(): string[] {
  const days: string[] = [];
  for (let i = 89; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }
  return days;
}

export function getWeekDays(): Date[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort().reverse();
  const today = getToday();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInDays(parseISO(sorted[i - 1]), parseISO(sorted[i]));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getMonthDays(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = (firstDay.getDay() + 6) % 7;
  const days: (string | null)[] = [];

  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(format(new Date(year, month, d), 'yyyy-MM-dd'));
  }

  return days;
}
