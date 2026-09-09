"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { PriceType } from "@prisma/client";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
}

export type AddOnFormInput = {
  name: string;
  description?: string;
  price: number;
  priceType: PriceType;
  active: boolean;
};

export async function createAddOn(input: AddOnFormInput) {
  await requireAdmin();
  const addOn = await prisma.addOn.create({
    data: {
      name: input.name,
      description: input.description || null,
      price: input.price,
      priceType: input.priceType,
      active: input.active,
    },
  });
  revalidatePath("/admin/addons");
  return addOn;
}

export async function updateAddOn(id: string, input: AddOnFormInput) {
  await requireAdmin();
  await prisma.addOn.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description || null,
      price: input.price,
      priceType: input.priceType,
      active: input.active,
    },
  });
  revalidatePath("/admin/addons");
  revalidatePath("/trips");
}

export async function deleteAddOn(id: string) {
  await requireAdmin();
  await prisma.addOn.delete({ where: { id } });
  revalidatePath("/admin/addons");
}
