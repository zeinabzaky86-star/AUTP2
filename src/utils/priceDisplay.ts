// Price display logic as specified in PRD
export interface PriceHint {
  mode: 'exact' | 'from' | 'quote';
  amount?: number;
  unit?: string;
  currency?: string;
}

export function renderPrice(price_hint?: PriceHint): string | null {
  if (!price_hint) return null;
  
  const { mode, amount, unit, currency = 'EGP' } = price_hint;
  
  if (mode === 'exact' && amount && unit) {
    return `${currency} ${amount} ${unit}`;
  }
  
  if (mode === 'from' && amount && unit) {
    return `From ${currency} ${amount} ${unit}`;
  }
  
  return 'Request a quote';
}