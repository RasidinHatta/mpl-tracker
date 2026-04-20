"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type PredictionStats = {
  totalMatches: number;
  correctWinners: number;
  exactScores: number;
  accuracy: number;
  exactScoreAccuracy: number;
};

export async function getPredictionStats(): Promise<PredictionStats> {
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
