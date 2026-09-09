"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addDeparture, deleteDeparture, toggleDepartureCancelled } from "@/lib/actions/admin-trips";

type Departure = {
  id: string;
  date: string;
  startTime: string;
  capacity: number;
  cancelled: boolean;
  booked: number;
};

export default function DepartureManager({
  tripId,
  departures,
}: {
  tripId: string;
  departures: Departure[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [capacity, setCapacity] = useState(12);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    startTransition(async () => {
      await addDeparture(tripId, { date, startTime, capacity });
      setDate("");
      router.refresh();
    });
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-xl border border-sand-dark/40 bg-white p-4">
        <label className="flex flex-col text-sm font-medium text-forest-dark">
          Date
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-forest-dark">
          Start time
          <input
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-32 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-forest-dark">
          Capacity
          <input
            required
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-1 w-24 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-river px-4 py-2 text-sm font-semibold text-white hover:bg-river-dark disabled:opacity-60"
        >
          Add Date
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-sand-dark/40 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-sand/40 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Booked</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {departures.map((d) => (
              <tr key={d.id} className="border-t border-sand-dark/30">
                <td className="px-4 py-2">
                  {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-2">{d.startTime}</td>
                <td className="px-4 py-2">
                  {d.booked} / {d.capacity}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.cancelled ? "bg-clay/10 text-clay" : "bg-forest/10 text-forest"
                    }`}
                  >
                    {d.cancelled ? "Cancelled" : "Open"}
                  </span>
                </td>
                <td className="space-x-3 px-4 py-2 text-right text-xs">
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await toggleDepartureCancelled(tripId, d.id, !d.cancelled);
                        router.refresh();
                      })
                    }
                    className="font-medium text-river hover:underline"
                  >
                    {d.cancelled ? "Reopen" : "Cancel"}
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm("Delete this date?")) return;
                      startTransition(async () => {
                        await deleteDeparture(tripId, d.id);
                        router.refresh();
                      });
                    }}
                    className="font-medium text-clay hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {departures.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-foreground/50">
                  No dates scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
