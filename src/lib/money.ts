/** Formats whole Naira: 1234567 -> "\u20A61,234,567". Pass symbol "N" for fonts without the Naira sign. */
export function naira(amount: number, symbol = "₦"): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${symbol}${digits}`;
}

/** Short form for stat tiles: 12,400,000 -> "12.4M". */
export function nairaShort(amount: number, symbol = "₦"): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) return `${symbol}${trim(amount / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${symbol}${trim(amount / 1_000_000)}M`;
  if (abs >= 1_000) return `${symbol}${trim(amount / 1_000)}k`;
  return naira(amount, symbol);
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

export function formatQty(q: number): string {
  if (Number.isInteger(q)) return q.toLocaleString("en-NG");
  return q.toLocaleString("en-NG", { maximumFractionDigits: 1 });
}
