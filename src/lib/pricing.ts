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
