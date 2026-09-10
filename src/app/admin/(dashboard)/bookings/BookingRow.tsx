"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus } from "@/lib/actions/admin-bookings";
import { formatCurrency, formatTimeLabel } from "@/lib/pricing";
import { BookingStatus } from "@prisma/client";

export default function BookingRow({
  booking,
}: {
  booking: {
    id: string;
    confirmationCode: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    adults: number;
    children: number;
    total: number;
    status: BookingStatus;
    tripName: string;
    date: string;
    startTime: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(status: BookingStatus) {
    startTransition(async () => {
      await updateBookingStatus(booking.id, status);
      router.refresh();
    });
  }

  return (
    <tr className="border-t border-sand-dark/30 align-top">
      <td className="px-4 py-3 font-mono text-xs">{booking.confirmationCode}</td>
      <td className="px-4 py-3">
        <div className="font-medium text-forest-dark">{booking.customerName}</div>
        <div className="text-xs text-foreground/60">{booking.customerEmail}</div>
        <div className="text-xs text-foreground/60">{booking.customerPhone}</div>
      </td>
      <td className="px-4 py-3">
        <div>{booking.tripName}</div>
        <div className="text-xs text-foreground/60">
          {new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
          &middot; {formatTimeLabel(booking.startTime)}
        </div>
      </td>
      <td className="px-4 py-3">
        {booking.adults}A{booking.children > 0 ? ` / ${booking.children}C` : ""}
      </td>
      <td className="px-4 py-3">{formatCurrency(booking.total)}</td>
      <td className="px-4 py-3">
        <select
          value={booking.status}
          disabled={isPending}
          onChange={(e) => setStatus(e.target.value as BookingStatus)}
          className="rounded-lg border border-sand-dark/50 px-2 py-1 text-xs"
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </td>
    </tr>
  );
}
