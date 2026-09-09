import { prisma } from "@/lib/prisma";
import AddOnManager from "./AddOnManager";

export const dynamic = "force-dynamic";

export default async function AdminAddOnsPage() {
  const addOns = await prisma.addOn.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-forest-dark">Add-ons</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Create add-ons like shuttle upgrades, tube rentals, or firewood bundles, then attach them
        to specific trips from the trip editor.
      </p>
      <div className="mt-6">
        <AddOnManager addOns={addOns} />
      </div>
    </div>
  );
}
