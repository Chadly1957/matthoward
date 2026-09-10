import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  FLOAT: "Float Trip",
  CAMPING: "Camping",
  COMBO: "Float + Camp",
};

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { basePrice: "asc" }],
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-black py-14 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h1 className="text-3xl font-bold sm:text-4xl">Float Trips &amp; Camping Packages</h1>
            <p className="mt-3 max-w-2xl text-white/80">
              Pick a trip below to see available dates, add-ons, and pricing. Every float includes
              shuttle service and gear delivery.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {trips.length === 0 ? (
            <p className="text-foreground/60">No trips available yet. Please check back soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex flex-col rounded-2xl border border-tint-dark bg-white p-6 shadow-sm"
                >
                  <span className="w-fit rounded-full bg-tint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black/70">
                    {CATEGORY_LABEL[trip.category]}
                  </span>
                  <h2 className="mt-3 text-lg font-semibold text-black">{trip.name}</h2>
                  <p className="mt-2 flex-1 text-sm text-foreground/70">{trip.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-foreground/60">{trip.durationLabel}</span>
                    <span className="font-semibold text-black">
                      {formatCurrency(trip.basePrice)}
                      <span className="text-xs font-normal text-foreground/50">/person</span>
                    </span>
                  </div>
                  <Link
                    href={`/trips/${trip.slug}`}
                    className="mt-4 rounded-full bg-pink px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-pink-dark"
                  >
                    View Dates &amp; Book
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
