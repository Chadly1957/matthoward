import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/pricing";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const booking = await prisma.booking.findUnique({
    where: { confirmationCode: code },
    include: {
      departure: { include: { trip: true } },
      addOns: { include: { addOn: true } },
    },
  });

  if (!booking) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-sand-dark/40 bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">✅</div>
            <h1 className="mt-4 text-2xl font-bold text-forest-dark">
              Reservation {booking.status === "PENDING" ? "Received" : "Confirmed"}!
            </h1>
            <p className="mt-2 text-foreground/70">
              A confirmation email will be sent to {booking.customerEmail}. Save your
              confirmation code below.
            </p>
            <div className="mt-6 rounded-xl bg-sand/40 px-4 py-3 font-mono text-lg font-semibold tracking-widest text-forest-dark">
              {booking.confirmationCode}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-sand-dark/40 bg-white p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold text-forest-dark">Trip Details</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground/60">Trip</dt>
                <dd className="font-medium text-forest-dark">{booking.departure.trip.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/60">Date</dt>
                <dd className="font-medium text-forest-dark">
                  {booking.departure.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  &middot; {booking.departure.startTime}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/60">Party size</dt>
                <dd className="font-medium text-forest-dark">
                  {booking.adults} adult{booking.adults === 1 ? "" : "s"}
                  {booking.children > 0 ? `, ${booking.children} child(ren)` : ""}
                </dd>
              </div>
              {booking.addOns.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-foreground/60">Add-ons</dt>
                  <dd className="text-right font-medium text-forest-dark">
                    {booking.addOns.map((a) => (
                      <div key={a.id}>
                        {a.quantity}&times; {a.addOn.name}
                      </div>
                    ))}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-sand-dark/40 pt-2 text-base font-semibold text-forest-dark">
                <dt>Total</dt>
                <dd>{formatCurrency(booking.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 text-center">
            <Link href="/trips" className="text-sm font-semibold text-river hover:underline">
              &larr; Book another trip
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
