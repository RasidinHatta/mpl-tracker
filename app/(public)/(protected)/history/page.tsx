import prisma from "@/lib/prisma";
import { History } from "lucide-react";
import { HistoryTabs } from "@/components/mpl/history-tabs";
import { MatchGroup } from "@/lib/generated/prisma/enums";

export const metadata = {
  title: "MPL Tracker — Match History",
  description: "Cross-table matrix of all team head-to-head match history.",
};

export default async function HistoryPage(props: {
  searchParams?: Promise<{ group?: string }>;
}) {
  const searchParams = await props.searchParams;
  const group = searchParams?.group as MatchGroup | undefined;

  const teams = await prisma.team.findMany({
    where: group ? { group } : undefined,
    orderBy: { name: "asc" },
  });

  // Fetch ALL matches (completed + upcoming) with team relations for the team-view tab
  const allMatches = await prisma.match.findMany({
    where: group ? { group } : undefined,
    include: {
      teamA: { select: { id: true, name: true, logo: true } },
      teamB: { select: { id: true, name: true, logo: true } },
    },
    orderBy: [{ week: "asc" }, { date: "asc" }],
  });

  // Slim version for the matrix (only completed, no relations needed)
  const completedMatches = allMatches
    .filter((m) => m.teamAResult !== null && m.teamBResult !== null)
    .map((m) => ({
      teamAId: m.teamAId,
      teamBId: m.teamBId,
      teamAResult: m.teamAResult,
      teamBResult: m.teamBResult,
    }));

  // Serialize dates for client component
  const serializedMatches = allMatches.map((m) => ({
    ...m,
    date: m.date.toISOString(),
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <History size={16} /> Head-to-Head
          </h2>
          <h1 className="text-4xl font-bold tracking-tight">Match History</h1>
        </div>
      </div>

      <HistoryTabs
        teams={teams}
        completedMatches={completedMatches}
        allMatches={serializedMatches}
      />
    </div>
  );
}
