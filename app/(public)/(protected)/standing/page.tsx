import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStandings } from "@/actions/standings";
import { TeamAvatar } from "@/components/match-schedule";
import { MatchGroup } from "@/lib/generated/prisma/enums";
import { AddTeamDialog } from "@/components/add-team-dialog";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "MPL Tracker — Standings",
  description: "View current MPL team standings and rankings.",
};

export default async function StandingPage(props: { searchParams?: Promise<{ group?: string }> }) {
  const searchParams = await props.searchParams;
  const groupParam = searchParams?.group as MatchGroup | undefined;
  const group = groupParam || MatchGroup.MPLID;
  const standings = await getStandings(false, null, groupParam);

  const session = await auth.api.getSession({
    headers: await headers()
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

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Regular Season</CardTitle>
          <CardDescription>Current team rankings based on match points and net game wins.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted border-none">
                  <TableHead className="text-foreground font-bold h-10 px-4 uppercase tracking-tight w-[300px] text-xs">Team</TableHead>
                  <TableHead className="text-center text-red-600 dark:text-red-500 font-bold uppercase tracking-tight h-10 text-xs">Match Point</TableHead>
                  <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">Match W-L</TableHead>
                  <TableHead className="text-center text-red-600 dark:text-red-500 font-bold uppercase tracking-tight h-10 text-xs">Net Game Win</TableHead>
                  <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">Game W-L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((team) => (
                  <TableRow key={team.teamId} className="hover:bg-muted/50 border-border transition-colors">
                    <TableCell className="p-0 align-middle">
                      <div className="flex items-center">
                        <div className="flex h-12 w-6 shrink-0 items-center justify-center bg-muted-foreground/20 text-foreground font-black text-lg mr-4">
                          {team.rank}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <TeamAvatar name={team.teamName} logo={team.logo} color="left" size="small" />
                          </div>
                          <span className="font-bold text-sm text-foreground uppercase tracking-tight">{team.teamName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black text-red-600 dark:text-red-500 text-sm">{team.matchPoints}</TableCell>
                    <TableCell className="text-center font-bold text-foreground text-sm tracking-tight">{team.matchWins} - {team.matchLosses}</TableCell>
                    <TableCell className="text-center font-black text-red-600 dark:text-red-500 text-sm">{team.netGameWin}</TableCell>
                    <TableCell className="text-center font-bold text-foreground text-sm tracking-tight">{team.gameWins} - {team.gameLosses}</TableCell>
                  </TableRow>
                ))}
                {standings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-semibold">
                      No team standings available yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}