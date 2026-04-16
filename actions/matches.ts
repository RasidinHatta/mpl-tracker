"use server";

import prisma from "@/lib/prisma";

export type MatchWithTeams = {
  id: number;
  week: number;
  day: string;
  date: Date;
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
  const matches = await prisma.match.findMany({
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: [{ week: "asc" }, { date: "asc" }],
  });

  // Group matches by week
  const weekMap = new Map<number, MatchWithTeams[]>();

  for (const match of matches) {
    const week = match.week;
    if (!weekMap.has(week)) {
      weekMap.set(week, []);
    }
    weekMap.get(week)!.push({
      id: match.id,
      week: match.week,
      day: match.day,
      date: match.date,
      teamA: { id: match.teamA.id, name: match.teamA.name, logo: match.teamA.logo },
      teamB: { id: match.teamB.id, name: match.teamB.name, logo: match.teamB.logo },
      format: match.format,
      teamAResult: match.teamAResult,
      teamBResult: match.teamBResult,
      teamAPrediction: match.teamAPrediction,
      teamBPrediction: match.teamBPrediction,
    });
  }

  return Array.from(weekMap.entries()).map(([week, matches]) => ({
    week,
    matches,
  }));
}

export async function updateMatch(id: number, data: { teamAResult?: number | null; teamBResult?: number | null; teamAPrediction?: number | null; teamBPrediction?: number | null }) {
  const { revalidatePath } = await import("next/cache");
  
  await prisma.match.update({
    where: { id },
    data: {
      teamAResult: data.teamAResult ?? null,
      teamBResult: data.teamBResult ?? null,
      teamAPrediction: data.teamAPrediction ?? null,
      teamBPrediction: data.teamBPrediction ?? null,
    },
  });

  revalidatePath('/schedule');
}
