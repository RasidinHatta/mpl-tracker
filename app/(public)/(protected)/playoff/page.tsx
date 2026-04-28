import { getPlayoffMatches } from "@/actions/mpl/playoffs";
import { getTeams } from "@/actions/mpl/matches";
import { getStandings } from "@/actions/mpl/standings";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MatchGroup } from "@/lib/generated/prisma/enums";

import { Trophy } from "lucide-react";
import { SetupPlayoffDialog } from "@/components/mpl/setup-playoff-dialog";
import { PlayoffBracket } from "@/components/mpl/playoff-bracket";

export const metadata = {
  title: "MPL Tracker — Playoff Bracket",
  description: "View playoff brackets and make your predictions.",
};

export default async function PlayoffPage(props: { searchParams?: Promise<{ group?: string }> }) {
  const searchParams = await props.searchParams;
  const groupParam = searchParams?.group as MatchGroup | undefined;
  const group = groupParam || MatchGroup.MPLID;

  const matches = await getPlayoffMatches(group);
  const teams = await getTeams(group);
  const standings = await getStandings(false, null, group);

  const session = await auth.api.getSession({
    headers: await headers()
  });
  const isAdmin = session?.user?.role === "ADMIN";

  // Check if bracket is initialized (at least one match exists)
  const isInitialized = matches.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 pt-2 max-w-[1400px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-6 py-6 border-b border-border/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">Playoffs</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Playoff Bracket</h1>
            <p className="text-muted-foreground max-w-lg">
              Track the hybrid elimination playoff bracket, check scores, and make predictions.
            </p>
            {isAdmin && (
              <div className="pt-2">
                <SetupPlayoffDialog group={group} teams={teams} standings={standings} isInitialized={isInitialized} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bracket Content */}
      {isInitialized ? (
        <PlayoffBracket matches={matches} isAdmin={isAdmin} />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-muted/20 border-dashed">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">Bracket Not Started</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            The playoff bracket for this season has not been initialized yet.
          </p>
        </div>
      )}
    </div>
  );
}
