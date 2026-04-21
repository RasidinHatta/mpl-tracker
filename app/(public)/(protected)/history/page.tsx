import prisma from "@/lib/prisma";
import { History } from "lucide-react";
import { TeamAvatar } from "@/components/match-schedule";
import { HistoryMatrix } from "@/components/history-matrix";
import { MatchGroup } from "@/lib/generated/prisma/enums";

export const metadata = {
  title: "MPL Tracker — Match History",
  description: "Cross-table matrix of all team head-to-head match history.",
};

export default async function HistoryPage(props: { searchParams?: Promise<{ group?: string }> }) {
  const searchParams = await props.searchParams;
  const group = searchParams?.group as MatchGroup | undefined;

  const teams = await prisma.team.findMany({
    where: group ? { group } : undefined,
    orderBy: { name: "asc" },
  });

  const matches = await prisma.match.findMany({
    where: {
      teamAResult: { not: null },
      teamBResult: { not: null },
      group: group ? group : undefined,
    },
    orderBy: [{ week: "asc" }, { date: "asc" }],
  });

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

      <HistoryMatrix teams={teams} matches={matches} />
    </div>
  );
}
