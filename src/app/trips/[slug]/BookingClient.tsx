"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/lib/actions/booking";
import { formatCurrency, calculateBookingTotal } from "@/lib/pricing";

type Departure = {
  id: string;
  date: string;
  startTime: string;
  capacity: number;
  booked: number;
};

type AddOn = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceType: "PER_PERSON" | "PER_BOOKING";
};

export default function BookingClient({
  tripBasePrice,
  departures,
  addOns,
}: {
  tripBasePrice: number;
  departures: Departure[];
  addOns: AddOn[];
}) {
  const router = useRouter();
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(
    departures[0]?.id ?? null
  );
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [addOnQty, setAddOnQty] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const departure = departures.find((d) => d.id === selectedDeparture) ?? null;
  const remaining = departure ? departure.capacity - departure.booked : 0;

  const selectedAddOns = useMemo(
    () =>
      addOns
        .filter((a) => (addOnQty[a.id] ?? 0) > 0)
        .map((a) => ({
          addOnId: a.id,
          quantity: addOnQty[a.id] ?? 0,
          unitPrice: a.price,
          priceType: a.priceType,
        })),
    [addOnQty, addOns]
  );

  const totals = calculateBookingTotal(tripBasePrice, adults, children, selectedAddOns);

  function updateAddOnQty(id: string, qty: number) {
    setAddOnQty((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!departure) {
      setError("Please select a departure date.");
      return;
    }
    if (totals.partySize > remaining) {
      setError(`Only ${remaining} spot(s) remaining on this date.`);
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        departureId: departure.id,
        customerName,
        customerEmail,
        customerPhone,
        adults,
        children,
        notes,
        addOns: Object.entries(addOnQty)
          .filter(([, qty]) => qty > 0)
          .map(([addOnId, quantity]) => ({ addOnId, quantity })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/book/confirmation/${result.confirmationCode}`);
    });
  }

  if (departures.length === 0) {
    return (
      <div className="rounded-2xl border border-sand-dark/40 bg-white p-6 text-sm text-foreground/70">
        No upcoming dates are currently scheduled for this trip. Please check back soon or
        contact us to request a custom date.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        {/* Step 1: date */}
        <div>
          <h2 className="text-lg font-semibold text-forest-dark">1. Choose a date</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {departures.map((d) => {
              const left = d.capacity - d.booked;
              const full = left <= 0;
              const active = d.id === selectedDeparture;
              return (
                <button
                  type="button"
                  key={d.id}
                  disabled={full}
                  onClick={() => setSelectedDeparture(d.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-river bg-river/10 ring-1 ring-river"
                      : "border-sand-dark/40 bg-white hover:border-river/50"
                  } ${full ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="font-semibold text-forest-dark">
                    {new Date(d.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-foreground/60">{d.startTime}</div>
                  <div className={`mt-1 text-xs ${full ? "text-clay" : "text-forest"}`}>
                    {full ? "Fully booked" : `${left} spot${left === 1 ? "" : "s"} left`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: party size */}
        <div>
          <h2 className="text-lg font-semibold text-forest-dark">2. Party size</h2>
          <div className="mt-3 flex flex-wrap gap-6">
            <label className="flex flex-col text-sm font-medium text-forest-dark">
              Adults
              <input
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-24 rounded-lg border border-sand-dark/50 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-forest-dark">
              Children
              <input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-24 rounded-lg border border-sand-dark/50 px-3 py-2"
              />
            </label>
          </div>
        </div>

        {/* Step 3: add-ons */}
        {addOns.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-forest-dark">3. Add-ons</h2>
            <div className="mt-3 space-y-3">
              {addOns.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-sand-dark/40 bg-white px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-forest-dark">{a.name}</div>
                    {a.description && (
                      <div className="text-xs text-foreground/60">{a.description}</div>
                    )}
                    <div className="text-xs text-foreground/50">
                      {formatCurrency(a.price)}{" "}
                      {a.priceType === "PER_PERSON" ? "/ person" : "/ booking"}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={addOnQty[a.id] ?? 0}
                    onChange={(e) => updateAddOnQty(a.id, Number(e.target.value))}
                    className="w-20 rounded-lg border border-sand-dark/50 px-3 py-2 text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: contact info */}
        <div>
          <h2 className="text-lg font-semibold text-forest-dark">4. Your information</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-forest-dark sm:col-span-2">
              Full name
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-forest-dark">
              Email
              <input
                required
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-forest-dark">
              Phone
              <input
                required
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-forest-dark sm:col-span-2">
              Notes (optional)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="h-fit rounded-2xl border border-sand-dark/40 bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-forest-dark">Order Summary</h2>
        {departure && (
          <p className="mt-2 text-sm text-foreground/70">
            {new Date(departure.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            &middot; {departure.startTime}
          </p>
        )}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>
              {adults} adult{adults === 1 ? "" : "s"}
              {children > 0 ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}
            </span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {selectedAddOns.length > 0 && (
            <div className="flex justify-between text-foreground/70">
              <span>Add-ons</span>
              <span>{formatCurrency(totals.addOnTotal)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between border-t border-sand-dark/40 pt-4 text-base font-semibold text-forest-dark">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-river px-4 py-3 font-semibold text-white transition hover:bg-river-dark disabled:opacity-60"
        >
          {isPending ? "Booking..." : "Reserve Now"}
        </button>
        <p className="mt-3 text-center text-xs text-foreground/50">
          No payment required online. We&apos;ll confirm your reservation by email.
        </p>
      </div>
    </form>
  );
}
