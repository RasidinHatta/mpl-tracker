"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { MatchGroup } from "@/lib/generated/prisma/enums";

export type TeamStanding = {
  rank: number;
  teamId: number;
  teamName: string;
  logo: string | null;
  color: string | null;
  matchWins: number;
  matchLosses: number;
  matchPoints: number;
  netGameWin: number;
  gameWins: number;
  gameLosses: number;
  totalMatches: number; // total scheduled matches (played + remaining)
};

export async function getStandings(usePredictions: boolean = false, forecastWeek: number | null = null, group?: MatchGroup): Promise<TeamStanding[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;

  const teams = await prisma.team.findMany({
    where: group ? { group } : undefined,
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
      color: team.color,
      matchWins,
      matchLosses,
      matchPoints,
      netGameWin,
      gameWins,
      gameLosses,
      totalMatches: team.matchesAsA.length + team.matchesAsB.length,
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

export type StandingsHistory = {
  week: number;
  standings: TeamStanding[];
};

export type StandingsHistoryResult = {
  history: StandingsHistory[];
  currentWeek: number;
  totalWeeks: number;
};

export async function getStandingsHistory(group?: MatchGroup): Promise<StandingsHistoryResult> {
  const teams = await prisma.team.findMany({
    where: group ? { group } : undefined,
    include: {
      matchesAsA: {
        where: { teamAResult: { not: null }, teamBResult: { not: null } }
      },
      matchesAsB: {
        where: { teamAResult: { not: null }, teamBResult: { not: null } }
      },
    },
  });

  let maxWeek = 0;
  for (const t of teams) {
    for (const m of t.matchesAsA) if (m.week > maxWeek) maxWeek = m.week;
    for (const m of t.matchesAsB) if (m.week > maxWeek) maxWeek = m.week;
  }

  // Get total scheduled weeks to extend the grid
  const allMatches = await prisma.match.findMany({
    where: group ? { group } : undefined,
    select: { week: true }
  });
  const totalWeeks = allMatches.reduce((max, m) => Math.max(max, m.week), maxWeek);

  const history: StandingsHistory[] = [];

  for (let w = 1; w <= maxWeek; w++) {
    const wStandings: TeamStanding[] = teams.map((team) => {
      let matchWins = 0, matchLosses = 0, gameWins = 0, gameLosses = 0;

      for (const match of team.matchesAsA) {
        if (match.week > w) continue;
        if (match.teamAResult !== null && match.teamBResult !== null) {
          gameWins += match.teamAResult;
          gameLosses += match.teamBResult;
          if (match.teamAResult > match.teamBResult) matchWins += 1;
          else matchLosses += 1;
        }
      }

      for (const match of team.matchesAsB) {
        if (match.week > w) continue;
        if (match.teamAResult !== null && match.teamBResult !== null) {
          gameWins += match.teamBResult;
          gameLosses += match.teamAResult;
          if (match.teamBResult > match.teamAResult) matchWins += 1;
          else matchLosses += 1;
        }
      }

      return {
        rank: 0,
        teamId: team.id,
        teamName: team.name,
        logo: team.logo,
        color: team.color,
        matchWins, matchLosses, matchPoints: matchWins,
        netGameWin: gameWins - gameLosses,
        gameWins, gameLosses,
        totalMatches: matchWins + matchLosses,
      };
    });

    wStandings.sort((a, b) => {
      if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
      return b.netGameWin - a.netGameWin;
    });

    wStandings.forEach((s, idx) => s.rank = idx + 1);
    history.push({ week: w, standings: wStandings });
  }

  return {
    history,
    currentWeek: maxWeek,
    totalWeeks
  };
}

// ─── Remaining matches (for Monte Carlo) ──────────────────────────────────────
//
// Each entry represents one unplayed match.
// `winProbA` is the probability that Team A wins this match.
// Default: 0.5 (equal). Future: replace with Elo-derived probability.

export type RemainingMatchSlim = {
  teamAId: number;
  teamBId: number;
  /** P(Team A wins). Default 0.5 — hook for Elo in the future. */
  winProbA: number;
};

export async function getRemainingMatches(
  group?: MatchGroup
): Promise<RemainingMatchSlim[]> {
  const matches = await prisma.match.findMany({
    where: {
      ...(group ? { group } : {}),
      teamAResult: null,
      teamBResult: null,
    },
    select: { teamAId: true, teamBId: true },
  });

  return matches.map((m) => ({
    teamAId: m.teamAId,
    teamBId: m.teamBId,
    winProbA: 0.5, // equal probability — replace with Elo when available
  }));
}
