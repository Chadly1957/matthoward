import { prisma } from "@/lib/prisma";
import BookingRow from "./BookingRow";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { departure: { include: { trip: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-forest-dark">Bookings</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-sand-dark/40 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-sand/40 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Trip / Date</th>
              <th className="px-4 py-2">Party</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <BookingRow
                key={b.id}
                booking={{
                  id: b.id,
                  confirmationCode: b.confirmationCode,
                  customerName: b.customerName,
                  customerEmail: b.customerEmail,
                  customerPhone: b.customerPhone,
                  adults: b.adults,
                  children: b.children,
                  total: b.total,
                  status: b.status,
                  tripName: b.departure.trip.name,
                  date: b.departure.date.toISOString(),
                  startTime: b.departure.startTime,
                }}
              />
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
