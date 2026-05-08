"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTeam(teamId: number, data: { name?: string; logo?: string | null; color?: string | null }) {
  try {
    await prisma.team.update({
      where: { id: teamId },
      data,
    });
    
    // Revalidate paths where standings are displayed
    revalidatePath("/standing");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating team:", error);
    return { success: false, error: "Failed to update team" };
  }
}

