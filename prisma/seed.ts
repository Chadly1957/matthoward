import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function nextDates(count: number, startInDays: number, stepDays: number) {
  const dates: Date[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + startInDays + i * stepDays);
    dates.push(d);
  }
  return dates;
}

async function main() {
  const shuttle = await prisma.addOn.upsert({
    where: { id: "seed-addon-shuttle-upgrade" },
    update: {},
    create: {
      id: "seed-addon-shuttle-upgrade",
      name: "Extra Shuttle Run (personal vehicle)",
      description: "Shuttle your own vehicle to the take-out point",
      price: 15,
      priceType: "PER_BOOKING",
    },
  });

  const tube = await prisma.addOn.upsert({
    where: { id: "seed-addon-tube" },
    update: {},
    create: {
      id: "seed-addon-tube",
      name: "Extra Tube Rental",
      description: "Add an inflatable tube for gear or an extra rider",
      price: 12,
      priceType: "PER_PERSON",
    },
  });

  const firewood = await prisma.addOn.upsert({
    where: { id: "seed-addon-firewood" },
    update: {},
    create: {
      id: "seed-addon-firewood",
      name: "Firewood Bundle",
      description: "Bundle of seasoned firewood delivered to your campsite",
      price: 10,
      priceType: "PER_BOOKING",
    },
  });

  const campChairs = await prisma.addOn.upsert({
    where: { id: "seed-addon-chairs" },
    update: {},
    create: {
      id: "seed-addon-chairs",
      name: "Camp Chair Rental",
      description: "Rent a folding camp chair for your stay",
      price: 8,
      priceType: "PER_PERSON",
    },
  });

  const halfDay = await prisma.trip.upsert({
    where: { slug: "half-day-canoe-float" },
    update: {},
    create: {
      name: "Half-Day Canoe Float",
      slug: "half-day-canoe-float",
      category: "FLOAT",
      description:
        "A relaxed 6-mile float perfect for families and first-timers. Includes canoe, paddles, life jackets, and round-trip shuttle.",
      basePrice: 38,
      durationLabel: "4-5 hours",
      maxPerBooking: 24,
      addOns: { create: [{ addOnId: shuttle.id }, { addOnId: tube.id }] },
    },
  });

  const fullDay = await prisma.trip.upsert({
    where: { slug: "full-day-kayak-float" },
    update: {},
    create: {
      name: "Full-Day Kayak Float",
      slug: "full-day-kayak-float",
      category: "FLOAT",
      description:
        "12 miles of scenic river through Ozark bluffs. Great for experienced paddlers looking for a full day on the water.",
      basePrice: 52,
      durationLabel: "6-7 hours",
      maxPerBooking: 24,
      addOns: { create: [{ addOnId: shuttle.id }, { addOnId: tube.id }] },
    },
  });

  const tubeFloat = await prisma.trip.upsert({
    where: { slug: "lazy-river-tube-float" },
    update: {},
    create: {
      name: "Lazy River Tube Float",
      slug: "lazy-river-tube-float",
      category: "FLOAT",
      description:
        "Kick back and drift down a gentle 4-mile stretch of the Meramec on an inflatable tube. Cooler tube included.",
      basePrice: 28,
      durationLabel: "2-3 hours",
      maxPerBooking: 30,
      addOns: { create: [{ addOnId: shuttle.id }] },
    },
  });

  const overnightCamp = await prisma.trip.upsert({
    where: { slug: "riverside-campsite" },
    update: {},
    create: {
      name: "Riverside Campsite (per night)",
      slug: "riverside-campsite",
      category: "CAMPING",
      description:
        "Reserve a shaded campsite right on the river. Fire ring and picnic table included. Add a float trip to your stay.",
      basePrice: 20,
      durationLabel: "Per night",
      maxPerBooking: 12,
      addOns: { create: [{ addOnId: firewood.id }, { addOnId: campChairs.id }] },
    },
  });

  const comboTrip = await prisma.trip.upsert({
    where: { slug: "float-and-camp-weekend" },
    update: {},
    create: {
      name: "Float & Camp Weekend",
      slug: "float-and-camp-weekend",
      category: "COMBO",
      description:
        "Two days, one night: a full-day float plus an overnight riverside campsite. The complete Meramec experience.",
      basePrice: 79,
      durationLabel: "2 days / 1 night",
      maxPerBooking: 16,
      addOns: {
        create: [{ addOnId: shuttle.id }, { addOnId: firewood.id }, { addOnId: campChairs.id }],
      },
    },
  });

  const tripDepartureConfig: { trip: typeof halfDay; capacity: number; times: string[] }[] = [
    { trip: halfDay, capacity: 24, times: ["9:00 AM", "12:00 PM"] },
    { trip: fullDay, capacity: 24, times: ["8:00 AM"] },
    { trip: tubeFloat, capacity: 30, times: ["10:00 AM", "1:00 PM"] },
    { trip: overnightCamp, capacity: 12, times: ["Check-in 2:00 PM"] },
    { trip: comboTrip, capacity: 16, times: ["8:00 AM"] },
  ];

  for (const { trip, capacity, times } of tripDepartureConfig) {
    const dates = nextDates(6, 3, 4);
    for (const date of dates) {
      for (const startTime of times) {
        const exists = await prisma.departure.findFirst({
          where: { tripId: trip.id, date, startTime },
        });
        if (!exists) {
          await prisma.departure.create({
            data: { tripId: trip.id, date, startTime, capacity },
          });
        }
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
