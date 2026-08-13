import { ReportPeriod } from './report.entity';

/**
 * Computes the [from, to) boundaries for a named period, anchored to "now".
 * Week starts on Monday (common for retail reporting; adjust here if the
 * store wants Sunday-start weeks later — single place to change).
 */
export function periodRange(period: ReportPeriod, now: Date = new Date()): { from: Date; to: Date } {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return { from: startOfToday, to: now };

    case 'week': {
      const day = startOfToday.getDay(); // 0 = Sunday
      const diffToMonday = day === 0 ? 6 : day - 1;
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - diffToMonday);
      return { from: startOfWeek, to: now };
    }

    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: startOfMonth, to: now };
    }
  }
}
