"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTrip, updateTrip, deleteTrip, TripFormInput } from "@/lib/actions/admin-trips";
import { TripCategory } from "@prisma/client";

export default function TripForm({
  tripId,
  initial,
}: {
  tripId?: string;
  initial?: Partial<TripFormInput>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<TripFormInput>({
    name: initial?.name ?? "",
    category: initial?.category ?? "FLOAT",
    description: initial?.description ?? "",
    basePrice: initial?.basePrice ?? 35,
    durationLabel: initial?.durationLabel ?? "4-5 hours",
    maxPerBooking: initial?.maxPerBooking ?? 20,
    imageUrl: initial?.imageUrl ?? "",
    active: initial?.active ?? true,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (tripId) {
          await updateTrip(tripId, form);
          router.refresh();
        } else {
          const trip = await createTrip(form);
          router.push(`/admin/trips/${trip.id}`);
        }
      } catch {
        setError("Failed to save trip.");
      }
    });
  }

  function handleDelete() {
    if (!tripId) return;
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteTrip(tripId);
      router.push("/admin/trips");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-sand-dark/40 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col text-sm font-medium text-forest-dark sm:col-span-2">
          Trip name
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-forest-dark">
          Category
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TripCategory }))}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          >
            <option value="FLOAT">Float Trip</option>
            <option value="CAMPING">Camping</option>
            <option value="COMBO">Float + Camp</option>
          </select>
        </label>
        <label className="flex flex-col text-sm font-medium text-forest-dark">
          Duration label
          <input
            required
            value={form.durationLabel}
            onChange={(e) => setForm((f) => ({ ...f, durationLabel: e.target.value }))}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
            placeholder="e.g. 4-5 hours"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-forest-dark">
          Base price (per person, USD)
          <input
            required
            type="number"
            step="0.01"
            min={0}
            value={form.basePrice}
            onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-forest-dark">
          Max party size per booking
          <input
            required
            type="number"
            min={1}
            value={form.maxPerBooking}
            onChange={(e) => setForm((f) => ({ ...f, maxPerBooking: Number(e.target.value) }))}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-forest-dark sm:col-span-2">
          Description
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-forest-dark sm:col-span-2">
          Image URL (optional)
          <input
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-forest-dark">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          Active (visible on site)
        </label>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-river px-5 py-2 text-sm font-semibold text-white hover:bg-river-dark disabled:opacity-60"
        >
          {isPending ? "Saving..." : tripId ? "Save Changes" : "Create Trip"}
        </button>
        {tripId && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm font-medium text-clay hover:underline"
          >
            Delete trip
          </button>
        )}
      </div>
    </form>
  );
}
