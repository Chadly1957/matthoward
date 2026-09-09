"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setTripAddOns } from "@/lib/actions/admin-trips";

export default function AddOnAssign({
  tripId,
  allAddOns,
  selectedIds,
}: {
  tripId: string;
  allAddOns: { id: string; name: string; price: number }[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    startTransition(async () => {
      await setTripAddOns(tripId, selected);
      router.refresh();
    });
  }

  if (allAddOns.length === 0) {
    return <p className="mt-3 text-sm text-foreground/60">No add-ons created yet.</p>;
  }

  return (
    <div className="mt-3 rounded-xl border border-sand-dark/40 bg-white p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {allAddOns.map((a) => (
          <label key={a.id} className="flex items-center gap-2 text-sm text-forest-dark">
            <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} />
            {a.name} &mdash; ${a.price.toFixed(2)}
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={isPending}
        className="mt-4 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save Add-ons"}
      </button>
    </div>
  );
}
