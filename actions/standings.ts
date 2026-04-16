"use server";

import prisma from "@/lib/prisma";

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

export async function getStandings(): Promise<TeamStanding[]> {
  const teams = await prisma.team.findMany({
    include: {
      matchesAsA: true,
      matchesAsB: true,
    },
  });

  const standings: TeamStanding[] = teams.map((team) => {
    let matchWins = 0;
    let matchLosses = 0;
    let gameWins = 0;
    let gameLosses = 0;

    // Process matches where team is Team A
    for (const match of team.matchesAsA) {
      if (match.teamAResult !== null && match.teamBResult !== null) {
        gameWins += match.teamAResult;
        gameLosses += match.teamBResult;
        if (match.teamAResult > match.teamBResult) matchWins += 1;
        else matchLosses += 1;
      }
    }

    // Process matches where team is Team B
    for (const match of team.matchesAsB) {
      if (match.teamAResult !== null && match.teamBResult !== null) {
        gameWins += match.teamBResult;
        gameLosses += match.teamAResult;
        if (match.teamBResult > match.teamAResult) matchWins += 1;
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
