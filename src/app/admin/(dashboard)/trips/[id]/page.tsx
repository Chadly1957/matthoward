import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TripForm from "../TripForm";
import DepartureManager from "./DepartureManager";
import AddOnAssign from "./AddOnAssign";

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [trip, allAddOns] = await Promise.all([
    prisma.trip.findUnique({
      where: { id },
      include: {
        departures: {
          orderBy: { date: "asc" },
          include: { bookings: { where: { status: { not: "CANCELLED" } } } },
        },
        addOns: true,
      },
    }),
    prisma.addOn.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!trip) notFound();

  const departures = trip.departures.map((d) => ({
    id: d.id,
    date: d.date.toISOString(),
    startTime: d.startTime,
    capacity: d.capacity,
    cancelled: d.cancelled,
    booked: d.bookings.reduce((sum, b) => sum + b.adults + b.children, 0),
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-bold text-forest-dark">Edit Trip</h1>
        <div className="mt-6">
          <TripForm tripId={trip.id} initial={{ ...trip, imageUrl: trip.imageUrl ?? undefined }} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-forest-dark">Departure Dates</h2>
        <DepartureManager tripId={trip.id} departures={departures} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-forest-dark">Available Add-ons</h2>
        <AddOnAssign
          tripId={trip.id}
          allAddOns={allAddOns}
          selectedIds={trip.addOns.map((a) => a.addOnId)}
        />
      </div>
    </div>
  );
}
