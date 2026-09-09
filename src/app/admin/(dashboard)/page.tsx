import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [tripCount, upcomingDepartures, pendingBookings, recentBookings] = await Promise.all([
    prisma.trip.count({ where: { active: true } }),
    prisma.departure.findMany({
      where: { cancelled: false, date: { gte: new Date(new Date().toDateString()) } },
      orderBy: { date: "asc" },
      take: 5,
      include: { trip: true, bookings: { where: { status: { not: "CANCELLED" } } } },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { departure: { include: { trip: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-sand-dark/40 bg-white p-6">
          <div className="text-sm text-foreground/60">Active Trips</div>
          <div className="mt-1 text-3xl font-bold text-forest-dark">{tripCount}</div>
          <Link href="/admin/trips" className="mt-2 inline-block text-sm text-river hover:underline">
            Manage trips &rarr;
          </Link>
        </div>
        <div className="rounded-2xl border border-sand-dark/40 bg-white p-6">
          <div className="text-sm text-foreground/60">Pending Bookings</div>
          <div className="mt-1 text-3xl font-bold text-forest-dark">{pendingBookings}</div>
          <Link href="/admin/bookings" className="mt-2 inline-block text-sm text-river hover:underline">
            Review bookings &rarr;
          </Link>
        </div>
        <div className="rounded-2xl border border-sand-dark/40 bg-white p-6">
          <div className="text-sm text-foreground/60">Upcoming Departures</div>
          <div className="mt-1 text-3xl font-bold text-forest-dark">{upcomingDepartures.length}</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-forest-dark">Upcoming Departures</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-sand-dark/40 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-foreground/60">
              <tr>
                <th className="px-4 py-2">Trip</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Booked</th>
              </tr>
            </thead>
            <tbody>
              {upcomingDepartures.map((d) => {
                const booked = d.bookings.reduce((sum, b) => sum + b.adults + b.children, 0);
                return (
                  <tr key={d.id} className="border-t border-sand-dark/30">
                    <td className="px-4 py-2 font-medium text-forest-dark">{d.trip.name}</td>
                    <td className="px-4 py-2">
                      {d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-2">{d.startTime}</td>
                    <td className="px-4 py-2">
                      {booked} / {d.capacity}
                    </td>
                  </tr>
                );
              })}
              {upcomingDepartures.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-foreground/50">
                    No upcoming departures scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-forest-dark">Recent Bookings</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-sand-dark/40 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-foreground/60">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Trip</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-t border-sand-dark/30">
                  <td className="px-4 py-2 font-mono text-xs">{b.confirmationCode}</td>
                  <td className="px-4 py-2">{b.customerName}</td>
                  <td className="px-4 py-2">{b.departure.trip.name}</td>
                  <td className="px-4 py-2">{formatCurrency(b.total)}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-foreground/50">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
