import { Trophy } from "lucide-react";
import { getStandings } from "@/actions/mpl/standings";
import { MatchGroup } from "@/lib/generated/prisma/enums";
import { AddTeamDialog } from "@/components/mpl/add-team-dialog";
import { StandingTabs } from "@/components/mpl/standing-tabs";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "MPL Tracker — Standings",
  description: "View current MPL team standings and rankings.",
};

export default async function StandingPage(props: {
  searchParams?: Promise<{ group?: string }>;
}) {
  const searchParams = await props.searchParams;
  const groupParam = searchParams?.group as MatchGroup | undefined;
  const group = groupParam || MatchGroup.MPLID;
  const standings = await getStandings(false, null, groupParam);

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <Trophy size={16} /> Season Rankings
          </h2>
          <h1 className="text-4xl font-bold tracking-tight">Standings</h1>
        </div>

        {isAdmin && (
          <div className="pt-2 shrink-0 self-start md:self-auto">
            <AddTeamDialog group={group} />
          </div>
        )}
      </div>

      <StandingTabs standings={standings} />
    </div>
  );
}