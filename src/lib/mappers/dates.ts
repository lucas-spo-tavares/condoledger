export function toDateOnlyString(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function toTimestamp(value: string) {
  return new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
}

export function toMonthDate(value: string) {
  return new Date(`${value.slice(0, 7)}-01T00:00:00.000Z`);
}
