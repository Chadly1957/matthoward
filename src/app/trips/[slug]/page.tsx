import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import BookingClient from "./BookingClient";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      departures: {
        where: { cancelled: false, date: { gte: new Date(new Date().toDateString()) } },
        orderBy: { date: "asc" },
        include: { bookings: { where: { status: { not: "CANCELLED" } } } },
      },
      addOns: { include: { addOn: true } },
    },
  });

  if (!trip || !trip.active) notFound();

  const departures = trip.departures.map((d) => ({
    id: d.id,
    date: d.date.toISOString(),
    startTime: d.startTime,
    capacity: d.capacity,
    booked: d.bookings.reduce((sum, b) => sum + b.adults + b.children, 0),
  }));

  const addOns = trip.addOns
    .filter((ta) => ta.addOn.active)
    .map((ta) => ({
      id: ta.addOn.id,
      name: ta.addOn.name,
      description: ta.addOn.description,
      price: ta.addOn.price,
      priceType: ta.addOn.priceType,
    }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-forest py-12 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-sand">
              {trip.durationLabel}
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{trip.name}</h1>
            <p className="mt-3 max-w-2xl text-white/80">{trip.description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <BookingClient tripBasePrice={trip.basePrice} departures={departures} addOns={addOns} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
