import Image from "next/image";
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

export default async function Home() {
  const trips = await prisma.trip.findMany({
    where: { active: true },
    orderBy: { basePrice: "asc" },
    take: 3,
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-black text-white">
          <Image
            src="/hero_image_bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-black/60" />
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              Ozarks, Missouri
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
              Hassle-free floating &amp; camping on the Meramec River
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/90">
              Canoes, kayaks, rafts and tubes. Riverside campsites. Shuttle service included.
              We handle the logistics so you can just get on the water.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/book"
                className="rounded-full bg-pink px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-pink-dark"
              >
                Check Availability
              </Link>
              <Link
                href="/trips"
                className="rounded-full border-2 border-pink px-6 py-3 font-semibold text-white transition hover:bg-pink/15"
              >
                View Trips &amp; Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: "🚐",
                title: "Free Shuttle Service",
                desc: "We handle transportation to and from the river so you never worry about a second vehicle.",
              },
              {
                icon: "🏕️",
                title: "Riverside Campsites",
                desc: "Reserve a shaded, private campsite right on the gravel bar or in our campground.",
              },
              {
                icon: "🛶",
                title: "Canoes, Kayaks & Rafts",
                desc: "All the gear you need, sized for your group, delivered clean and ready to launch.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-tint-dark bg-white p-6">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-black">{item.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured trips */}
        <section className="bg-tint py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-black sm:text-3xl">
                Popular Trips &amp; Packages
              </h2>
              <Link href="/trips" className="hidden text-sm font-semibold text-pink hover:underline sm:block">
                View all &rarr;
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {trips.length === 0 && (
                <p className="text-sm text-foreground/60">
                  Trips will appear here once the admin adds them.
                </p>
              )}
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex flex-col rounded-2xl border border-tint-dark bg-white p-6 shadow-sm"
                >
                  <span className="w-fit rounded-full bg-tint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black/70">
                    {CATEGORY_LABEL[trip.category]}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-black">{trip.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-foreground/70">{trip.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-foreground/60">{trip.durationLabel}</span>
                    <span className="font-semibold text-black">
                      {formatCurrency(trip.basePrice)}
                      <span className="text-xs font-normal text-foreground/50">/person</span>
                    </span>
                  </div>
                  <Link
                    href={`/trips/${trip.slug}`}
                    className="mt-4 rounded-full bg-pink px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-pink-dark"
                  >
                    View &amp; Book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-black sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-6">
            {[
              {
                q: "What should I bring?",
                a: "Sunscreen, a change of clothes, water shoes, and a cooler with drinks and snacks (no glass containers on the river).",
              },
              {
                q: "Is the shuttle really included?",
                a: "Yes — every float trip package includes round-trip shuttle service from our outpost to your launch point and back from your take-out.",
              },
              {
                q: "Can I book a campsite without floating?",
                a: "Absolutely. Choose a camping-only package at checkout, or add float add-ons to any camping reservation.",
              },
              {
                q: "What is your cancellation policy?",
                a: "Full refunds up to 48 hours before your trip. Weather cancellations initiated by us are always fully refunded or rescheduled.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-tint-dark bg-white p-5">
                <h3 className="font-semibold text-black">{item.q}</h3>
                <p className="mt-1 text-sm text-foreground/70">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
