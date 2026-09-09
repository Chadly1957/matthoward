import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function CampingPage() {
  const trips = await prisma.trip.findMany({
    where: { active: true, category: { in: ["CAMPING", "COMBO"] } },
    orderBy: { basePrice: "asc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-forest py-14 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h1 className="text-3xl font-bold sm:text-4xl">Riverside Camping</h1>
            <p className="mt-3 max-w-2xl text-white/80">
              Reserve a campsite on the gravel bar or in our shaded campground, with the option to
              add a float trip to your stay.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {trips.length === 0 ? (
            <p className="text-foreground/60">No camping packages available yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex flex-col rounded-2xl border border-sand-dark/40 bg-white p-6 shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-forest-dark">{trip.name}</h2>
                  <p className="mt-2 flex-1 text-sm text-foreground/70">{trip.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-foreground/60">{trip.durationLabel}</span>
                    <span className="font-semibold text-forest-dark">
                      {formatCurrency(trip.basePrice)}
                      <span className="text-xs font-normal text-foreground/50">/person</span>
                    </span>
                  </div>
                  <Link
                    href={`/trips/${trip.slug}`}
                    className="mt-4 rounded-full bg-forest px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-forest-dark"
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
