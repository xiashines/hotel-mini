import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const HOTEL_TZ = 'Asia/Tehran';

/**
 * Returns the exact UTC Instant that corresponds to 00:00:00 today in Tehran.
 */
export function getHotelTodayStart(): Date {
  const now = new Date();
  const dateString = formatInTimeZone(now, HOTEL_TZ, 'yyyy-MM-dd');
  return fromZonedTime(`${dateString}T00:00:00.000`, HOTEL_TZ);
}

/**
 * Returns the exact UTC Instant that corresponds to 23:59:59.999 today in Tehran.
 */
export function getHotelTodayEnd(): Date {
  const now = new Date();
  const dateString = formatInTimeZone(now, HOTEL_TZ, 'yyyy-MM-dd');
  return fromZonedTime(`${dateString}T23:59:59.999`, HOTEL_TZ);
}

/**
 * Returns the exact UTC Instant that corresponds to 23:59:59.999 on a specific date in Tehran.
 */
export function getEndOfDay(date: Date): Date {
  const dateString = formatInTimeZone(date, HOTEL_TZ, 'yyyy-MM-dd');
  return fromZonedTime(`${dateString}T23:59:59.999`, HOTEL_TZ);
}

/**
 * Parses a YYYY-MM-DD string into a UTC Instant representing 14:00:00 in Tehran.
 */
export function createHotelCheckIn(dateString: string): Date {
  // Extract just the YYYY-MM-DD part in case it's a full ISO string
  const cleanDate = dateString.split('T')[0];
  return fromZonedTime(`${cleanDate}T14:00:00.000`, HOTEL_TZ);
}

/**
 * Parses a YYYY-MM-DD string into a UTC Instant representing 12:00:00 in Tehran.
 */
export function createHotelCheckOut(dateString: string): Date {
  const cleanDate = dateString.split('T')[0];
  return fromZonedTime(`${cleanDate}T12:00:00.000`, HOTEL_TZ);
}

/**
 * Formats a UTC Instant to a Persian date string locked to Tehran timezone.
 */
export function formatHotelDate(date: Date, includeYear = false): string {
  return new Intl.DateTimeFormat('fa-IR', {
    timeZone: HOTEL_TZ,
    month: 'long',
    day: 'numeric',
    ...(includeYear && { year: 'numeric' })
  }).format(date);
}

/**
 * Formats a UTC Instant to a full date-time string locked to Tehran timezone.
 */
export function formatHotelDateTime(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR', {
    timeZone: HOTEL_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Calculates days remaining from today's midnight in Tehran to the checkout midnight.
 */
export function getDaysRemaining(checkOutDate: Date): number {
  const todayStart = getHotelTodayStart();
  const checkOutDateString = formatInTimeZone(checkOutDate, HOTEL_TZ, 'yyyy-MM-dd');
  const checkOutStart = fromZonedTime(`${checkOutDateString}T00:00:00.000`, HOTEL_TZ);
  
  const diffTime = checkOutStart.getTime() - todayStart.getTime();
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
}
