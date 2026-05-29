import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CalendarDays, ShieldCheck, Swords, Trophy, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MatchGroup } from "@/lib/generated/prisma/enums";
import { getMatchSchedule, getTeams } from "@/actions/mpl/matches";
import { getPlayoffMatches } from "@/actions/mpl/playoffs";
import { getStandings } from "@/actions/mpl/standings";
import { AdminManageTable } from "@/components/admin/AdminManageTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "MPL Tracker - Admin",
  description: "Manage MPL Tracker teams, matches, playoff bracket, and users.",
};

function getGroup(value?: string): MatchGroup {
  return Object.values(MatchGroup).includes(value as MatchGroup) ? value as MatchGroup : MatchGroup.MPLID;
}

const groupLogos: Record<MatchGroup, string> = {
  [MatchGroup.MPLID]: "/mpl-id.png",
  [MatchGroup.MPLPH]: "/mpl-ph.png",
  [MatchGroup.MPLMY]: "/mpl-my.png",
};

function groupLinkClass(active: boolean) {
  return cn(
    "inline-flex h-8 items-center justify-center gap-2 rounded-md border px-2.5 text-[0.8rem] font-medium transition-colors",
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
              <span className="relative size-5 overflow-hidden rounded bg-white ring-1 ring-border">
                <Image
                  src={groupLogos[item]}
                  alt={`${item} logo`}
                  fill
                  sizes="20px"
                  className="object-contain p-0.5"
                />
              </span>
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

      <AdminManageTable
        group={group}
        teams={teams}
        schedule={schedule}
        standings={standings}
        playoffMatches={playoffMatches}
        users={users}
        selectedWeek={selectedWeek}
        previousWeek={previousWeek}
        nextWeek={nextWeek}
        selectedWeekCompletedMatches={selectedWeekCompletedMatches}
        playoffInitialized={playoffInitialized}
        currentUserId={session.user.id}
      />
    </div>
  );
}
