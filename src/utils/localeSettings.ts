
import type { Day, FirstWeekContainsDate, Locale } from 'date-fns';

// Create a stub for the hebrew locale to avoid the type error
export const heLocale: Pick<Locale, "options" | "localize" | "formatLong"> = { 
  formatLong: {
    date: () => '',
    time: () => '',
    dateTime: () => '',
  },
  localize: {
    ordinalNumber: () => '',
    era: () => '',
    quarter: () => '',
    month: () => '',
    day: () => '',
    dayPeriod: () => ''
  },
  options: {
    weekStartsOn: 0 as Day,
    firstWeekContainsDate: 1 as FirstWeekContainsDate
  }
};
