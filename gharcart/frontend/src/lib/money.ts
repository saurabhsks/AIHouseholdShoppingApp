export function formatInr(paise: number): string {
  const sign = paise < 0 ? "-" : "";
  const absolute = Math.abs(paise);
  const rupees = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  return `${sign}₹${rupees}.${String(remainder).padStart(2, "0")}`;
}
