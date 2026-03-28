/** Mirror backend shippingCalc for cart/checkout display (server recomputes on pay). */

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

export function computeWeightShippingFromKg(kg, enabled, perKgRate) {
  const rate = Math.max(0, Number(perKgRate) || 0);
  if (!enabled || rate <= 0) return 0;
  const k = Math.max(0, Number(kg) || 0);
  return Math.round(k * rate * 100) / 100;
}

export function computeWeightShippingRupees(cartItems, enabled, perKgRate) {
  return computeWeightShippingFromKg(computeBillableKg(cartItems), enabled, perKgRate);
}
