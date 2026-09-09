"use server";

import { prisma } from "@/lib/prisma";
import { calculateBookingTotal, generateConfirmationCode } from "@/lib/pricing";
import { PriceType } from "@prisma/client";

export type CreateBookingInput = {
  departureId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  adults: number;
  children: number;
  notes?: string;
  addOns: { addOnId: string; quantity: number }[];
};

export type CreateBookingResult =
  | { ok: true; confirmationCode: string }
  | { ok: false; error: string };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const partySize = input.adults + input.children;
  if (partySize < 1) {
    return { ok: false, error: "At least one guest is required." };
  }
  if (!input.customerName.trim() || !input.customerEmail.trim() || !input.customerPhone.trim()) {
    return { ok: false, error: "Name, email, and phone are required." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const departure = await tx.departure.findUnique({
        where: { id: input.departureId },
        include: {
          trip: true,
          bookings: {
            where: { status: { not: "CANCELLED" } },
          },
        },
      });

      if (!departure || departure.cancelled) {
        throw new Error("This departure is no longer available.");
      }

      const alreadyBooked = departure.bookings.reduce((sum, b) => sum + b.adults + b.children, 0);
      if (alreadyBooked + partySize > departure.capacity) {
        const remaining = departure.capacity - alreadyBooked;
        throw new Error(
          remaining > 0
            ? `Only ${remaining} spot(s) remaining on this departure.`
            : "This departure is fully booked."
        );
      }

      const addOnRecords = input.addOns.length
        ? await tx.addOn.findMany({ where: { id: { in: input.addOns.map((a) => a.addOnId) } } })
        : [];

      const selected = input.addOns
        .map((sel) => {
          const record = addOnRecords.find((a) => a.id === sel.addOnId);
          if (!record) return null;
          return {
            addOnId: record.id,
            quantity: sel.quantity,
            unitPrice: record.price,
            priceType: record.priceType as PriceType,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null && x.quantity > 0);

      const totals = calculateBookingTotal(departure.trip.basePrice, input.adults, input.children, selected);

      const confirmationCode = generateConfirmationCode();

      const booking = await tx.booking.create({
        data: {
          confirmationCode,
          departureId: departure.id,
          customerName: input.customerName.trim(),
          customerEmail: input.customerEmail.trim(),
          customerPhone: input.customerPhone.trim(),
          adults: input.adults,
          children: input.children,
          notes: input.notes?.trim() || null,
          subtotal: totals.subtotal,
          total: totals.total,
          addOns: {
            create: selected.map((s) => ({
              addOnId: s.addOnId,
              quantity: s.quantity,
              unitPrice: s.unitPrice,
            })),
          },
        },
      });

      return booking;
    });

    return { ok: true, confirmationCode: result.confirmationCode };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return { ok: false, error: message };
  }
}
