/** Mirror backend shippingCalc for cart/checkout (server recomputes on pay). */

export function computeBillableKg(cartItems) {
  let kg = 0;
  if (!Array.isArray(cartItems)) return 0;
  for (const item of cartItems) {
    const p = item.product;
    if (!p) continue;
    if (p.freeShipping === true) continue;
    const w = Number(p.weight);
    const qty = Number(item.quantity) || 0;
    if (Number.isFinite(w) && w > 0 && qty > 0) kg += w * qty;
  }
  return kg;
}

export function isKeralaState(state) {
  if (state == null || typeof state !== 'string') return false;
  return state.trim().toLowerCase() === 'kerala';
}

export function perKgRateForState(rates, state) {
  const k = Math.max(0, Number(rates.keralaPerKg) || 0);
  const r = Math.max(0, Number(rates.restOfIndiaPerKg) || 0);
  return isKeralaState(state) ? k : r;
}

export function computeWeightShippingFromKg(kg, enabled, perKgRate) {
  if (!enabled) return 0;
  const k = Math.max(0, Number(kg) || 0);
  if (k === 0) return 0;
  const rate = Math.max(0, Number(perKgRate) || 0);
  if (rate <= 0) return 0;
  const base = Math.round(k * rate * 100) / 100;
  return k < 1 ? base + 60 : base;
}

export function computeWeightShippingForZone(billableKg, enabled, rates, state) {
  if (!enabled) return 0;
  const rate = perKgRateForState(rates, state);
  return computeWeightShippingFromKg(billableKg, true, rate);
}

/** @deprecated use zone helpers; kept for older call sites */
export function computeWeightShippingRupees(cartItems, enabled, perKgRate) {
  return computeWeightShippingFromKg(computeBillableKg(cartItems), enabled, perKgRate);
}

export function computeWeightShippingRupeesForZone(cartItems, enabled, rates, state) {
  const kg = computeBillableKg(cartItems);
  return computeWeightShippingForZone(kg, enabled, rates, state);
}

export function shippingZoneLabel(state) {
  if (state != null && String(state).trim() !== '') {
    return isKeralaState(state) ? 'Kerala' : 'outside Kerala';
  }
  return 'outside Kerala (default)';
}
