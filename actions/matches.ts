"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type MatchWithTeams = {
  id: number;
  week: number;
  day: number;
  date: Date;
  matchNo: number;
  teamA: { id: number; name: string; logo: string | null };
  teamB: { id: number; name: string; logo: string | null };
  format: string;
  teamAResult: number | null;
  teamBResult: number | null;
  teamAPrediction: number | null;
  teamBPrediction: number | null;
};

export type WeekSchedule = {
  week: number;
  matches: MatchWithTeams[];
};

export async function getMatchSchedule(): Promise<WeekSchedule[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;

  const matches = await prisma.match.findMany({
    include: {
      teamA: true,
      teamB: true,
      ...(userId ? {
        predictions: {
          where: { userId }
        }
      } : { predictions: false })
    },
    orderBy: [{ week: "asc" }, { date: "asc" }, { matchNo: "asc" }],
  });

  // Group matches by week
  const weekMap = new Map<number, MatchWithTeams[]>();

  for (const match of matches) {
    const week = match.week;
    if (!weekMap.has(week)) {
      weekMap.set(week, []);
    }
    
    // Check for user predictions
    let preA = null;
    let preB = null;
    if (match.predictions && match.predictions.length > 0) {
      preA = match.predictions[0].teamAPrediction;
      preB = match.predictions[0].teamBPrediction;
    }

    weekMap.get(week)!.push({
      id: match.id,
      week: match.week,
      day: match.day,
      date: match.date,
      matchNo: match.matchNo,
      teamA: { id: match.teamA.id, name: match.teamA.name, logo: match.teamA.logo },
      teamB: { id: match.teamB.id, name: match.teamB.name, logo: match.teamB.logo },
      format: match.format,
      teamAResult: match.teamAResult,
      teamBResult: match.teamBResult,
      teamAPrediction: preA,
      teamBPrediction: preB,
    });
  }

  return Array.from(weekMap.entries()).map(([week, matches]) => ({
    week,
    matches,
  }));
}

export async function updateMatch(id: number, data: { teamAResult?: number | null; teamBResult?: number | null; teamAPrediction?: number | null; teamBPrediction?: number | null }) {
  const { revalidatePath } = await import("next/cache");
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;

  if (data.teamAResult !== undefined || data.teamBResult !== undefined) {
    // Ideally check admin permissions here
    await prisma.match.update({
      where: { id },
      data: {
        ...(data.teamAResult !== undefined && { teamAResult: data.teamAResult ?? null }),
        ...(data.teamBResult !== undefined && { teamBResult: data.teamBResult ?? null }),
      },
    });
  }
  
  if (userId && (data.teamAPrediction !== undefined || data.teamBPrediction !== undefined)) {
    await prisma.userPrediction.upsert({
      where: {
        userId_matchId: {
          userId,
          matchId: id
        }
      },
      update: {
        ...(data.teamAPrediction !== undefined && { teamAPrediction: data.teamAPrediction ?? null }),
        ...(data.teamBPrediction !== undefined && { teamBPrediction: data.teamBPrediction ?? null }),
      },
      create: {
        userId,
        matchId: id,
        teamAPrediction: data.teamAPrediction ?? null,
        teamBPrediction: data.teamBPrediction ?? null,
      }
    });
  }

  revalidatePath('/schedule');
  revalidatePath('/standing');
  revalidatePath('/prediction');
}
