"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type TeamStanding = {
  rank: number;
  teamId: number;
  teamName: string;
  logo: string | null;
  matchWins: number;
  matchLosses: number;
  matchPoints: number;
  netGameWin: number;
  gameWins: number;
  gameLosses: number;
};

export async function getStandings(usePredictions: boolean = false, forecastWeek: number | null = null): Promise<TeamStanding[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;

  const teams = await prisma.team.findMany({
    include: {
      matchesAsA: {
        include: {
          ...(userId ? { predictions: { where: { userId } } } : {})
        }
      },
      matchesAsB: {
        include: {
          ...(userId ? { predictions: { where: { userId } } } : {})
        }
      },
    },
  });

  const standings: TeamStanding[] = teams.map((team) => {
    let matchWins = 0;
    let matchLosses = 0;
    let gameWins = 0;
    let gameLosses = 0;

    // Process matches where team is Team A
    for (const match of team.matchesAsA) {
      let scoreA = match.teamAResult;
      let scoreB = match.teamBResult;

      // If no definitive result yet, and we are evaluating predictions
      if (scoreA === null || scoreB === null) {
        if (usePredictions && match.predictions && match.predictions.length > 0) {
          const preA = match.predictions[0].teamAPrediction;
          const preB = match.predictions[0].teamBPrediction;
          if (preA !== null && preB !== null) {
            if (forecastWeek === null || match.week === forecastWeek) {
              scoreA = preA;
              scoreB = preB;
            }
          }
        }
      }

      if (scoreA !== null && scoreB !== null) {
        gameWins += scoreA;
        gameLosses += scoreB;
        if (scoreA > scoreB) matchWins += 1;
        else matchLosses += 1;
      }
    }

    // Process matches where team is Team B
    for (const match of team.matchesAsB) {
      let scoreA = match.teamAResult;
      let scoreB = match.teamBResult;

      // If no definitive result yet, and we are evaluating predictions
      if (scoreA === null || scoreB === null) {
        if (usePredictions && match.predictions && match.predictions.length > 0) {
          const preA = match.predictions[0].teamAPrediction;
          const preB = match.predictions[0].teamBPrediction;
          if (preA !== null && preB !== null) {
            if (forecastWeek === null || match.week === forecastWeek) {
              scoreA = preA;
              scoreB = preB;
            }
          }
        }
      }

      if (scoreA !== null && scoreB !== null) {
        gameWins += scoreB;
        gameLosses += scoreA;
        if (scoreB > scoreA) matchWins += 1;
        else matchLosses += 1;
      }
    }

    const matchPoints = matchWins;
    const netGameWin = gameWins - gameLosses;

    return {
      rank: 0, // Placeholder, updated below
      teamId: team.id,
      teamName: team.name,
      logo: team.logo,
      matchWins,
      matchLosses,
      matchPoints,
      netGameWin,
      gameWins,
      gameLosses,
    };
  });

  // Sort standings: Match Points > Net Game Win > H2H/Tiebreaker (simplified here)
  standings.sort((a, b) => {
    if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
    return b.netGameWin - a.netGameWin;
  });

  // Assign ranks
  standings.forEach((standing, idx) => {
    standing.rank = idx + 1;
  });

  return standings;
}
