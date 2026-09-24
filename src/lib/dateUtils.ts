export function getTodayEnd() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

export function getEndOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
