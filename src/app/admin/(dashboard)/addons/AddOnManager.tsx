"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAddOn, updateAddOn, deleteAddOn, AddOnFormInput } from "@/lib/actions/admin-addons";
import { PriceType } from "@prisma/client";

type AddOn = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceType: PriceType;
  active: boolean;
};

const emptyForm: AddOnFormInput = {
  name: "",
  description: "",
  price: 10,
  priceType: "PER_PERSON",
  active: true,
};

export default function AddOnManager({ addOns }: { addOns: AddOn[] }) {
  const router = useRouter();
  const [form, setForm] = useState<AddOnFormInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEdit(addOn: AddOn) {
    setEditingId(addOn.id);
    setForm({
      name: addOn.name,
      description: addOn.description ?? "",
      price: addOn.price,
      priceType: addOn.priceType,
      active: addOn.active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (editingId) {
        await updateAddOn(editingId, form);
      } else {
        await createAddOn(form);
      }
      cancelEdit();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this add-on?")) return;
    startTransition(async () => {
      await deleteAddOn(id);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={handleSubmit} className="h-fit space-y-4 rounded-xl border border-tint-dark bg-white p-6">
        <h2 className="font-semibold text-black">{editingId ? "Edit Add-on" : "New Add-on"}</h2>
        <label className="flex flex-col text-sm font-medium text-black">
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 rounded-lg border border-tint-dark px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-black">
          Description
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="mt-1 rounded-lg border border-tint-dark px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col text-sm font-medium text-black">
            Price (USD)
            <input
              required
              type="number"
              step="0.01"
              min={0}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              className="mt-1 rounded-lg border border-tint-dark px-3 py-2"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-black">
            Price type
            <select
              value={form.priceType}
              onChange={(e) => setForm((f) => ({ ...f, priceType: e.target.value as PriceType }))}
              className="mt-1 rounded-lg border border-tint-dark px-3 py-2"
            >
              <option value="PER_PERSON">Per person</option>
              <option value="PER_BOOKING">Per booking</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-black">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          Active
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-pink px-5 py-2 text-sm font-semibold text-white hover:bg-pink-dark disabled:opacity-60"
          >
            {editingId ? "Save Changes" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-sm text-foreground/60 hover:underline">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-tint-dark bg-white">
        <table className="w-full text-sm">
          <thead className="bg-tint text-left text-foreground/60">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {addOns.map((a) => (
              <tr key={a.id} className="border-t border-tint-dark">
                <td className="px-4 py-2 font-medium text-black">{a.name}</td>
                <td className="px-4 py-2">
                  ${a.price.toFixed(2)} {a.priceType === "PER_PERSON" ? "/person" : "/booking"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.active ? "bg-tint text-black/70" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {a.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="space-x-3 px-4 py-2 text-right text-xs">
                  <button onClick={() => startEdit(a)} className="font-medium text-pink hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="font-medium text-danger hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {addOns.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-foreground/50">
                  No add-ons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
