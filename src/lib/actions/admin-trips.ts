"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { TripCategory } from "@prisma/client";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export type TripFormInput = {
  name: string;
  category: TripCategory;
  description: string;
  basePrice: number;
  durationLabel: string;
  maxPerBooking: number;
  imageUrl?: string;
  active: boolean;
};

export async function createTrip(input: TripFormInput) {
  await requireAdmin();
  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.trip.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++i}`;
  }

  const trip = await prisma.trip.create({
    data: {
      name: input.name,
      slug,
      category: input.category,
      description: input.description,
      basePrice: input.basePrice,
      durationLabel: input.durationLabel,
      maxPerBooking: input.maxPerBooking,
      imageUrl: input.imageUrl || null,
      active: input.active,
    },
  });

  revalidatePath("/admin/trips");
  revalidatePath("/trips");
  return trip;
}

export async function updateTrip(id: string, input: TripFormInput) {
  await requireAdmin();
  const trip = await prisma.trip.update({
    where: { id },
    data: {
      name: input.name,
      category: input.category,
      description: input.description,
      basePrice: input.basePrice,
      durationLabel: input.durationLabel,
      maxPerBooking: input.maxPerBooking,
      imageUrl: input.imageUrl || null,
      active: input.active,
    },
  });

  revalidatePath("/admin/trips");
  revalidatePath(`/admin/trips/${id}`);
  revalidatePath("/trips");
  revalidatePath(`/trips/${trip.slug}`);
  return trip;
}

export async function deleteTrip(id: string) {
  await requireAdmin();
  await prisma.trip.delete({ where: { id } });
  revalidatePath("/admin/trips");
  revalidatePath("/trips");
}

export async function addDeparture(tripId: string, data: { date: string; startTime: string; capacity: number; notes?: string }) {
  await requireAdmin();
  await prisma.departure.create({
    data: {
      tripId,
      date: new Date(data.date),
      startTime: data.startTime,
      capacity: data.capacity,
      notes: data.notes || null,
    },
  });
  revalidatePath(`/admin/trips/${tripId}`);
}

export async function deleteDeparture(tripId: string, departureId: string) {
  await requireAdmin();
  await prisma.departure.delete({ where: { id: departureId } });
  revalidatePath(`/admin/trips/${tripId}`);
}

export async function toggleDepartureCancelled(tripId: string, departureId: string, cancelled: boolean) {
  await requireAdmin();
  await prisma.departure.update({ where: { id: departureId }, data: { cancelled } });
  revalidatePath(`/admin/trips/${tripId}`);
}

export async function setTripAddOns(tripId: string, addOnIds: string[]) {
  await requireAdmin();
  await prisma.tripAddOn.deleteMany({ where: { tripId } });
  await prisma.tripAddOn.createMany({
    data: addOnIds.map((addOnId) => ({ tripId, addOnId })),
    skipDuplicates: true,
  });
  revalidatePath(`/admin/trips/${tripId}`);
}
