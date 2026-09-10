import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminTripsPage() {
  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { departures: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">Trips &amp; Packages</h1>
        <Link
          href="/admin/trips/new"
          className="rounded-full bg-pink px-4 py-2 text-sm font-semibold text-white hover:bg-pink-dark"
        >
          + New Trip
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-tint-dark bg-white">
        <table className="w-full text-sm">
          <thead className="bg-tint text-left text-foreground/60">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Departures</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="border-t border-tint-dark">
                <td className="px-4 py-2 font-medium text-black">{trip.name}</td>
                <td className="px-4 py-2">{trip.category}</td>
                <td className="px-4 py-2">{formatCurrency(trip.basePrice)}</td>
                <td className="px-4 py-2">{trip._count.departures}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      trip.active ? "bg-tint text-black/70" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {trip.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/trips/${trip.id}`} className="text-pink hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
                  No trips yet. Create your first trip to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
