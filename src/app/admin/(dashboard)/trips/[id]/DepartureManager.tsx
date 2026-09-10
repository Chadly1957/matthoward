"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addDeparture,
  deleteDeparture,
  toggleDepartureCancelled,
  updateDeparture,
} from "@/lib/actions/admin-trips";
import { formatTimeLabel } from "@/lib/pricing";

type Departure = {
  id: string;
  date: string;
  startTime: string;
  capacity: number;
  cancelled: boolean;
  booked: number;
};

const DEFAULT_START_TIME = "09:00";
const DEFAULT_CAPACITY = 12;

export default function DepartureManager({
  tripId,
  departures,
}: {
  tripId: string;
  departures: Departure[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY);
  const [formKey, setFormKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState(DEFAULT_START_TIME);
  const [editCapacity, setEditCapacity] = useState(DEFAULT_CAPACITY);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    startTransition(async () => {
      await addDeparture(tripId, { date, startTime, capacity });
      // Remount the form (fresh native input state) in addition to resetting
      // controlled state, so the date field can never retain the last value.
      setDate("");
      setFormKey((k) => k + 1);
      router.refresh();
    });
  }

  function startEdit(d: Departure) {
    setEditingId(d.id);
    setEditDate(d.date.slice(0, 10));
    setEditStartTime(d.startTime);
    setEditCapacity(d.capacity);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(departureId: string) {
    startTransition(async () => {
      await updateDeparture(tripId, departureId, {
        date: editDate,
        startTime: editStartTime,
        capacity: editCapacity,
      });
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <div className="mt-4">
      <form
        key={formKey}
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-tint-dark bg-white p-4"
      >
        <label className="flex flex-col text-sm font-medium text-black">
          Date
          <input
            required
            type="date"
            defaultValue={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-lg border border-tint-dark px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-black">
          Start time
          <input
            required
            type="time"
            defaultValue={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-32 rounded-lg border border-tint-dark px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-black">
          Capacity
          <input
            required
            type="number"
            min={1}
            defaultValue={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-1 w-24 rounded-lg border border-tint-dark px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-pink px-4 py-2 text-sm font-semibold text-white hover:bg-pink-dark disabled:opacity-60"
        >
          Add Date
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-tint-dark bg-white">
        <table className="w-full text-sm">
          <thead className="bg-tint text-left text-foreground/60">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Capacity</th>
              <th className="px-4 py-2">Booked</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {departures.map((d) => {
              const isEditing = editingId === d.id;
              return (
                <tr key={d.id} className="border-t border-tint-dark">
                  {isEditing ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="rounded-lg border border-tint-dark px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                          className="w-28 rounded-lg border border-tint-dark px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={1}
                          value={editCapacity}
                          onChange={(e) => setEditCapacity(Number(e.target.value))}
                          className="w-20 rounded-lg border border-tint-dark px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {d.booked} / {d.capacity}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            d.cancelled ? "bg-danger/10 text-danger" : "bg-tint text-black/70"
                          }`}
                        >
                          {d.cancelled ? "Cancelled" : "Open"}
                        </span>
                      </td>
                      <td className="space-x-3 px-4 py-2 text-right text-xs">
                        <button
                          onClick={() => saveEdit(d.id)}
                          disabled={isPending}
                          className="font-medium text-pink hover:underline disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button onClick={cancelEdit} className="font-medium text-foreground/60 hover:underline">
                          Discard
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">
                        {new Date(d.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-2">{formatTimeLabel(d.startTime)}</td>
                      <td className="px-4 py-2">{d.capacity}</td>
                      <td className="px-4 py-2">
                        {d.booked} / {d.capacity}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            d.cancelled ? "bg-danger/10 text-danger" : "bg-tint text-black/70"
                          }`}
                        >
                          {d.cancelled ? "Cancelled" : "Open"}
                        </span>
                      </td>
                      <td className="space-x-3 px-4 py-2 text-right text-xs">
                        <button onClick={() => startEdit(d)} className="font-medium text-pink hover:underline">
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            startTransition(async () => {
                              await toggleDepartureCancelled(tripId, d.id, !d.cancelled);
                              router.refresh();
                            })
                          }
                          className="font-medium text-pink hover:underline"
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
                          className="font-medium text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {departures.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
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
