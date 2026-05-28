import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CalendarDays, ChevronLeft, ChevronRight, ShieldCheck, Swords, Trophy, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MatchGroup } from "@/lib/generated/prisma/enums";
import { getMatchSchedule, getTeams } from "@/actions/mpl/matches";
import { getPlayoffMatches } from "@/actions/mpl/playoffs";
import { getStandings } from "@/actions/mpl/standings";
import { AddMatchDialog } from "@/components/mpl/add-match-dialog";
import { AddTeamDialog } from "@/components/mpl/add-team-dialog";
import { SetupPlayoffDialog } from "@/components/mpl/setup-playoff-dialog";
import { TeamEditor } from "@/components/mpl/team-color-editor";
import { TeamAvatar } from "@/components/mpl/match-schedule";
import { UpdateMatchDialog } from "@/components/mpl/update-match-dialog";
import { UpdatePlayoffMatchDialog } from "@/components/mpl/update-playoff-match-dialog";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "MPL Tracker - Admin",
  description: "Manage MPL Tracker teams, matches, playoff bracket, and users.",
};

function formatDate(date: Date | string | null) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGroup(value?: string): MatchGroup {
  return Object.values(MatchGroup).includes(value as MatchGroup) ? value as MatchGroup : MatchGroup.MPLID;
}

function groupLinkClass(active: boolean) {
  return cn(
    "inline-flex h-7 items-center justify-center rounded-md border px-2.5 text-[0.8rem] font-medium transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-background hover:bg-muted"
  );
}

export default async function AdminPage(props: { searchParams?: Promise<{ group?: string; week?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const searchParams = await props.searchParams;
  const group = getGroup(searchParams?.group);

  const [teams, schedule, standings, playoffMatches, users] = await Promise.all([
    getTeams(group),
    getMatchSchedule(group),
    getStandings(false, null, group),
    getPlayoffMatches(group),
    prisma.user.findMany({
      orderBy: [{ role: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const allMatches = schedule.flatMap((week) => week.matches);
  const completedMatches = allMatches.filter((match) => match.teamAResult !== null && match.teamBResult !== null);
  const requestedWeek = Number(searchParams?.week);
  const currentWeekIndex = Math.max(0, schedule.findIndex((week) => week.week === requestedWeek));
  const selectedWeek = schedule[currentWeekIndex] ?? schedule[0];
  const previousWeek = currentWeekIndex > 0 ? schedule[currentWeekIndex - 1] : null;
  const nextWeek = currentWeekIndex < schedule.length - 1 ? schedule[currentWeekIndex + 1] : null;
  const selectedWeekCompletedMatches = selectedWeek?.matches.filter((match) => match.teamAResult !== null && match.teamBResult !== null).length ?? 0;
  const playoffInitialized = playoffMatches.length > 0;
  const datedPlayoffMatches = playoffMatches.filter((match) => match.date);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShieldCheck size={16} /> Admin
          </h2>
          <h1 className="text-4xl font-bold tracking-tight">Control Center</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(MatchGroup).map((item) => (
            <Link key={item} href={`/admin?group=${item}`} className={groupLinkClass(group === item)}>
              {item}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-primary" /> Teams
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-black">{teams.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-primary" /> Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-black">{completedMatches.length}/{allMatches.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Swords className="h-4 w-4 text-primary" /> Playoff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={playoffInitialized ? "default" : "secondary"}>
              {playoffInitialized ? `${datedPlayoffMatches.length} dated` : "Not initialized"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" /> Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-black">{users.length}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="playoff">Playoff</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Add teams and edit their name, logo, and accent color.</CardDescription>
              </div>
              <AddTeamDialog group={group} />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between rounded-lg border bg-card/50 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <TeamAvatar name={team.name} logo={team.logo} color="left" size="small" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">{team.name}</div>
                        <div className="text-xs text-muted-foreground">{team.group}</div>
                      </div>
                    </div>
                    <TeamEditor teamId={team.id} initialName={team.name} initialLogo={team.logo} initialColor={team.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Regular Season Matches</CardTitle>
                <CardDescription>Add matches and update results from one place.</CardDescription>
              </div>
              <AddMatchDialog teams={teams} group={group} />
            </CardHeader>
            <CardContent>
              {selectedWeek ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-bold">Week {selectedWeek.week}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedWeek.matches.length} matches - {selectedWeekCompletedMatches} completed
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={previousWeek ? `/admin?group=${group}&week=${previousWeek.week}` : "#"}
                        aria-disabled={!previousWeek}
                        className={cn(
                          groupLinkClass(false),
                          !previousWeek && "pointer-events-none opacity-50"
                        )}
                      >
                        <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                        Previous
                      </Link>
                      <div className="flex max-w-full gap-1 overflow-x-auto">
                        {schedule.map((week) => (
                          <Link
                            key={week.week}
                            href={`/admin?group=${group}&week=${week.week}`}
                            className={groupLinkClass(week.week === selectedWeek.week)}
                          >
                            Week {week.week}
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={nextWeek ? `/admin?group=${group}&week=${nextWeek.week}` : "#"}
                        aria-disabled={!nextWeek}
                        className={cn(
                          groupLinkClass(false),
                          !nextWeek && "pointer-events-none opacity-50"
                        )}
                      >
                        Next
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedWeek.matches.map((match) => (
                      <div key={match.id} className="flex flex-col gap-3 rounded-lg border bg-card/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={match.teamAResult !== null && match.teamBResult !== null ? "secondary" : "outline"}>
                            Week {match.week} Match {match.matchNo}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(match.date)}</span>
                        </div>
                        <div className="grid w-full items-center gap-2 sm:w-[460px] sm:grid-cols-[minmax(0,1fr)_32px_64px_32px_minmax(0,1fr)_auto]">
                          <div className="min-w-0 text-right">
                            <span className="block truncate text-sm font-semibold">{match.teamA.name}</span>
                          </div>
                          <div className="flex justify-center">
                            <TeamAvatar name={match.teamA.name} logo={match.teamA.logo} color="left" size="small" />
                          </div>
                          <div className="text-center text-sm font-black tabular-nums">
                            {match.teamAResult ?? "-"} : {match.teamBResult ?? "-"}
                          </div>
                          <div className="flex justify-center">
                            <TeamAvatar name={match.teamB.name} logo={match.teamB.logo} color="right" size="small" />
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="block truncate text-sm font-semibold">{match.teamB.name}</span>
                          </div>
                          <div className="flex justify-end">
                            <UpdateMatchDialog match={match} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No matches yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playoff" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Playoff Bracket</CardTitle>
                <CardDescription>Initialize the bracket, set match dates, and update playoff results.</CardDescription>
              </div>
              <SetupPlayoffDialog
                group={group}
                teams={teams.map((team) => ({ id: team.id, name: team.name, logo: team.logo }))}
                standings={standings}
                isInitialized={playoffInitialized}
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {playoffMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 p-3">
                    <div>
                      <div className="text-sm font-bold">{match.matchId}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(match.date)}</div>
                    </div>
                    <div className="grid w-full items-center gap-2 sm:w-[320px] sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)_24px]">
                      <div className="min-w-0 text-right">
                        <span className="block truncate text-sm font-semibold">{match.teamA?.name ?? "TBD"}</span>
                      </div>
                      <div className="text-center text-sm font-black tabular-nums">
                        {match.teamAResult ?? "-"} : {match.teamBResult ?? "-"}
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="block truncate text-sm font-semibold">{match.teamB?.name ?? "TBD"}</span>
                      </div>
                      <div className="flex justify-end">
                        <UpdatePlayoffMatchDialog match={match} isAdmin />
                      </div>
                    </div>
                  </div>
                ))}
                {playoffMatches.length === 0 && (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-2">
                    Initialize the playoff bracket to manage dates and results.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Review accounts and remove regular users when needed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DeleteUserButton userId={user.id} disabled={user.role === "ADMIN" || user.id === session.user.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
