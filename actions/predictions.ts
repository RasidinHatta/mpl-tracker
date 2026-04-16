"use server";

import prisma from "@/lib/prisma";

export type PredictionStats = {
  totalMatches: number;
  correctWinners: number;
  exactScores: number;
  accuracy: number;
  exactScoreAccuracy: number;
};

export async function getPredictionStats(): Promise<PredictionStats> {
  const matches = await prisma.match.findMany({
    where: {
      teamAResult: { not: null },
      teamBResult: { not: null },
      teamAPrediction: { not: null },
      teamBPrediction: { not: null },
    },
  });

  const totalMatches = matches.length;
  let correctWinners = 0;
  let exactScores = 0;

  for (const match of matches) {
    const actA = match.teamAResult!;
    const actB = match.teamBResult!;
    const preA = match.teamAPrediction!;
    const preB = match.teamBPrediction!;

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
