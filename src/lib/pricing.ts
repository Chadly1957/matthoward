import { PriceType } from "@prisma/client";

export type SelectedAddOn = {
  addOnId: string;
  quantity: number;
  unitPrice: number;
  priceType: PriceType;
};

export function calculateAddOnTotal(addOn: SelectedAddOn, partySize: number) {
  if (addOn.priceType === "PER_PERSON") {
    return addOn.unitPrice * addOn.quantity * partySize;
  }
  return addOn.unitPrice * addOn.quantity;
}

export function calculateBookingTotal(
  basePrice: number,
  adults: number,
  children: number,
  addOns: SelectedAddOn[]
) {
  const partySize = adults + children;
  const subtotal = basePrice * partySize;
  const addOnTotal = addOns.reduce((sum, a) => sum + calculateAddOnTotal(a, partySize), 0);
  return {
    subtotal,
    addOnTotal,
    total: subtotal + addOnTotal,
    partySize,
  };
}

export function generateConfirmationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MRO-${code}`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

/**
 * Departure start times are stored as 24-hour "HH:MM" strings (from an
 * <input type="time">). Older/free-form values that don't match that shape
 * (e.g. "Check-in 2:00 PM") are returned unchanged.
 */
export function formatTimeLabel(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelveHour}:${minutes} ${period}`;
}
