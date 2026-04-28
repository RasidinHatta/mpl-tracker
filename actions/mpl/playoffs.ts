"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { MatchGroup, MatchFormat } from "@/lib/generated/prisma/enums";

export type PlayoffMatchWithTeams = {
  id: number;
  matchId: string;
  teamA: { id: number; name: string; logo: string | null } | null;
  teamB: { id: number; name: string; logo: string | null } | null;
  teamAResult: number | null;
  teamBResult: number | null;
  teamAPrediction: number | null;
  teamBPrediction: number | null;
  format: MatchFormat;
  date: Date | null;
  group: MatchGroup;
};

export async function getPlayoffMatches(group?: MatchGroup): Promise<PlayoffMatchWithTeams[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;

  const matches = await prisma.playoffMatch.findMany({
    where: group ? { group } : undefined,
    include: {
      teamA: true,
      teamB: true,
      ...(userId ? {
        predictions: {
          where: { userId }
        }
      } : { predictions: false })
    },
  });

  return matches.map((match) => {
    let preA = null;
    let preB = null;
    if (match.predictions && match.predictions.length > 0) {
      preA = match.predictions[0].teamAPrediction;
      preB = match.predictions[0].teamBPrediction;
    }

    return {
      id: match.id,
      matchId: match.matchId,
      teamA: match.teamA ? { id: match.teamA.id, name: match.teamA.name, logo: match.teamA.logo } : null,
      teamB: match.teamB ? { id: match.teamB.id, name: match.teamB.name, logo: match.teamB.logo } : null,
      teamAResult: match.teamAResult,
      teamBResult: match.teamBResult,
      teamAPrediction: preA,
      teamBPrediction: preB,
      format: match.format,
      date: match.date,
      group: match.group,
    };
  });
}

export async function initializePlayoffBracket(
  group: MatchGroup,
  seeds: { seed1: number; seed2: number; seed3: number; seed4: number; seed5: number; seed6: number }
) {
  const { revalidatePath } = await import("next/cache");
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const matchIds = ["UBQ1", "UBQ2", "UBS1", "UBS2", "LBSF", "UBF", "LBF", "GF"];
  
  // Ensure all 8 matches exist
  for (const matchId of matchIds) {
    let format: MatchFormat = MatchFormat.BO5;
    if (matchId === "LBF" || matchId === "GF") format = MatchFormat.BO7;

    await prisma.playoffMatch.upsert({
      where: {
        group_matchId: { group, matchId }
      },
      update: {},
      create: {
        group,
        matchId,
        format,
      }
    });
  }

  // Set initial seeds
  await prisma.playoffMatch.update({
    where: { group_matchId: { group, matchId: "UBQ1" } },
    data: { teamAId: seeds.seed3, teamBId: seeds.seed6, teamAResult: null, teamBResult: null }
  });
  await prisma.playoffMatch.update({
    where: { group_matchId: { group, matchId: "UBQ2" } },
    data: { teamAId: seeds.seed4, teamBId: seeds.seed5, teamAResult: null, teamBResult: null }
  });
  await prisma.playoffMatch.update({
    where: { group_matchId: { group, matchId: "UBS1" } },
    data: { teamAId: seeds.seed1, teamBId: null, teamAResult: null, teamBResult: null }
  });
  await prisma.playoffMatch.update({
    where: { group_matchId: { group, matchId: "UBS2" } },
    data: { teamAId: seeds.seed2, teamBId: null, teamAResult: null, teamBResult: null }
  });
  
  // Reset others
  for (const matchId of ["LBSF", "UBF", "LBF", "GF"]) {
    await prisma.playoffMatch.update({
      where: { group_matchId: { group, matchId } },
      data: { teamAId: null, teamBId: null, teamAResult: null, teamBResult: null }
    });
  }

  revalidatePath('/playoff');
}

export async function updatePlayoffMatch(
  id: number,
  data: { teamAResult?: number | null; teamBResult?: number | null; teamAPrediction?: number | null; teamBPrediction?: number | null }
) {
  const { revalidatePath } = await import("next/cache");
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  if (userRole === "ADMIN" && (data.teamAResult !== undefined || data.teamBResult !== undefined)) {
    const updated = await prisma.playoffMatch.update({
      where: { id },
      data: {
        ...(data.teamAResult !== undefined && { teamAResult: data.teamAResult ?? null }),
        ...(data.teamBResult !== undefined && { teamBResult: data.teamBResult ?? null }),
      },
    });

    // Trigger auto propagation
    await propagatePlayoffResults(updated.group);
  }
  
  if (userId && (data.teamAPrediction !== undefined || data.teamBPrediction !== undefined)) {
    await prisma.userPlayoffPrediction.upsert({
      where: {
        userId_playoffMatchId: {
          userId,
          playoffMatchId: id
        }
      },
      update: {
        ...(data.teamAPrediction !== undefined && { teamAPrediction: data.teamAPrediction ?? null }),
        ...(data.teamBPrediction !== undefined && { teamBPrediction: data.teamBPrediction ?? null }),
      },
      create: {
        userId,
        playoffMatchId: id,
        teamAPrediction: data.teamAPrediction ?? null,
        teamBPrediction: data.teamBPrediction ?? null,
      }
    });
  }

  revalidatePath('/playoff');
}

// Logic to auto-advance winners/losers
async function propagatePlayoffResults(group: MatchGroup) {
  const matches = await prisma.playoffMatch.findMany({ where: { group } });
  const getMatch = (id: string) => matches.find(m => m.matchId === id);

  const getWinner = (m: { teamAId: number | null; teamBId: number | null; teamAResult: number | null; teamBResult: number | null } | undefined) => {
    if (m?.teamAResult === null || m?.teamBResult === null || m?.teamAResult === undefined || m?.teamBResult === undefined) return null;
    if (!m?.teamAId || !m?.teamBId) return null;
    return m.teamAResult > m.teamBResult ? m.teamAId : m.teamBId;
  };

  const getLoser = (m: { teamAId: number | null; teamBId: number | null; teamAResult: number | null; teamBResult: number | null } | undefined) => {
    if (m?.teamAResult === null || m?.teamBResult === null) return null;
    if (!m?.teamAId || !m?.teamBId) return null;
    return m.teamAResult! < m.teamBResult! ? m.teamAId : m.teamBId;
  };

  const ubq1 = getMatch("UBQ1");
  const ubq2 = getMatch("UBQ2");
  const ubs1 = getMatch("UBS1");
  const ubs2 = getMatch("UBS2");
  const ubf = getMatch("UBF");
  const lbsf = getMatch("LBSF");
  const lbf = getMatch("LBF");

  // Propagate to UBS1
  if (ubs1) {
    await prisma.playoffMatch.update({
      where: { id: ubs1.id },
      data: { teamBId: getWinner(ubq1) }
    });
  }
  // Propagate to UBS2
  if (ubs2) {
    await prisma.playoffMatch.update({
      where: { id: ubs2.id },
      data: { teamBId: getWinner(ubq2) }
    });
  }
  // Propagate to UBF
  if (ubf) {
    await prisma.playoffMatch.update({
      where: { id: ubf.id },
      data: { teamAId: getWinner(ubs1), teamBId: getWinner(ubs2) }
    });
  }
  // Propagate to LBSF
  if (lbsf) {
    await prisma.playoffMatch.update({
      where: { id: lbsf.id },
      data: { teamAId: getLoser(ubs1), teamBId: getLoser(ubs2) }
    });
  }
  // Propagate to LBF
  if (lbf) {
    // Wait, the loser of UBF might not be determined yet, but we update LBF.teamBId
    await prisma.playoffMatch.update({
      where: { id: lbf.id },
      data: { teamAId: getWinner(lbsf), teamBId: getLoser(ubf) }
    });
  }
  // Propagate to GF
  const gf = getMatch("GF");
  if (gf) {
    await prisma.playoffMatch.update({
      where: { id: gf.id },
      data: { teamAId: getWinner(ubf), teamBId: getWinner(lbf) }
    });
  }
}
