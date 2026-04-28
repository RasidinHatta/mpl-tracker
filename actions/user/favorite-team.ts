"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getFavoriteTeam() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favoriteTeam: true
    }
  });

  return user?.favoriteTeam || null;
}

export async function setFavoriteTeam(teamId: number | null) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      favoriteTeamId: teamId
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}
