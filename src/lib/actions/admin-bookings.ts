"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { BookingStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await requireAdmin();
  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}
