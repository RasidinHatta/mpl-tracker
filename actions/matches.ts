"use server";

import prisma from "@/lib/prisma";

export type MatchWithTeams = {
  id: number;
  week: number;
  day: string;
  date: Date;
  teamA: { id: number; name: string; logo: string | null };
  teamB: { id: number; name: string; logo: string | null };
  result: string | null;
  prediction: string | null;
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
      result: match.result,
      prediction: match.prediction,
    });
  }

  return Array.from(weekMap.entries()).map(([week, matches]) => ({
    week,
    matches,
  }));
}
