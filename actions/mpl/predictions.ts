"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { MatchGroup } from "@/lib/generated/prisma/enums";

export type PredictionStats = {
  totalMatches: number;
  correctWinners: number;
  exactScores: number;
  accuracy: number;
  exactScoreAccuracy: number;
};

export async function getPredictionStats(group?: MatchGroup): Promise<PredictionStats> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id;

  if (!userId) {
    return {
      totalMatches: 0,
      correctWinners: 0,
      exactScores: 0,
      accuracy: 0,
      exactScoreAccuracy: 0,
    };
  }

  const matches = await prisma.match.findMany({
    where: {
      teamAResult: { not: null },
      teamBResult: { not: null },
      group: group ? group : undefined,
      predictions: {
        some: {
          userId,
          teamAPrediction: { not: null },
          teamBPrediction: { not: null },
        }
      }
    },
    include: {
      predictions: {
        where: { userId }
      }
    }
  });

  const totalMatches = matches.length;
  let correctWinners = 0;
  let exactScores = 0;

  for (const match of matches) {
    const actA = match.teamAResult!;
    const actB = match.teamBResult!;
    const preA = match.predictions[0].teamAPrediction!;
    const preB = match.predictions[0].teamBPrediction!;

    const actualWinnerA = actA > actB;
    const predictedWinnerA = preA > preB;

    if (actualWinnerA === predictedWinnerA) {
      correctWinners++;
    }

    if (actA === preA && actB === preB) {
      exactScores++;
    }
  }

  const accuracy = totalMatches > 0 ? (correctWinners / totalMatches) * 100 : 0;
  const exactScoreAccuracy = totalMatches > 0 ? (exactScores / totalMatches) * 100 : 0;

  return {
    totalMatches,
    correctWinners,
    exactScores,
    accuracy,
    exactScoreAccuracy,
  };
}

export type GlobalLeaderboardUser = {
  userId: string;
  userName: string;
  userImage: string | null;
  stats: PredictionStats;
};

export async function getGlobalLeaderboard(group?: MatchGroup): Promise<GlobalLeaderboardUser[]> {
  const users = await prisma.user.findMany({
    include: {
      predictions: {
        where: {
          teamAPrediction: { not: null },
          teamBPrediction: { not: null },
          match: {
            teamAResult: { not: null },
            teamBResult: { not: null },
            group: group ? group : undefined,
          }
        },
        include: {
          match: true
        }
      }
    }
  });

  const leaderboard: GlobalLeaderboardUser[] = [];

  for (const user of users) {
    const totalMatches = user.predictions.length;
    if (totalMatches === 0) continue;

    let correctWinners = 0;
    let exactScores = 0;

    for (const pred of user.predictions) {
      const actA = pred.match.teamAResult!;
      const actB = pred.match.teamBResult!;
      const preA = pred.teamAPrediction!;
      const preB = pred.teamBPrediction!;

      const actualWinnerA = actA > actB;
      const predictedWinnerA = preA > preB;

      if (actualWinnerA === predictedWinnerA) {
        correctWinners++;
      }

      if (actA === preA && actB === preB) {
        exactScores++;
      }
    }

    const accuracy = totalMatches > 0 ? (correctWinners / totalMatches) * 100 : 0;
    const exactScoreAccuracy = totalMatches > 0 ? (exactScores / totalMatches) * 100 : 0;

    leaderboard.push({
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      stats: {
        totalMatches,
        correctWinners,
        exactScores,
        accuracy,
        exactScoreAccuracy,
      }
    });
  }

  // Sort primarily by accuracy, then exact scores, then total matches
  leaderboard.sort((a, b) => {
    if (Math.abs(b.stats.accuracy - a.stats.accuracy) > 0.01) {
      return b.stats.accuracy - a.stats.accuracy;
    }
    if (b.stats.exactScores !== a.stats.exactScores) {
      return b.stats.exactScores - a.stats.exactScores;
    }
    return b.stats.totalMatches - a.stats.totalMatches;
  });

  return leaderboard.slice(0, 5); // Return top 5
}

