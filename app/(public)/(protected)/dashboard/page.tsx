import { LayoutDashboard, Target, Trophy, CheckCircle2, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedProgress } from "@/components/mpl/animated-progress";
import { getStandings, getRemainingMatches } from "@/actions/mpl/standings";
import { getMatchSchedule } from "@/actions/mpl/matches";
import { getPredictionStats, getGlobalLeaderboard } from "@/actions/mpl/predictions";
import { getFavoriteTeam } from "@/actions/user/favorite-team";
import { TeamAvatar } from "@/components/mpl/match-schedule";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MatchGroup } from "@/lib/generated/prisma/enums";

// Import new components
import { FavoriteTeamCard, GlobalLeaderboardCard, ClinchFeedCard } from "@/components/mpl/dashboard-cards";

export const metadata = {
  title: "MPL Tracker — Dashboard",
  description: "Your MPL season overview at a glance.",
};

function formatDateShort(date: Date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage(props: { searchParams?: Promise<{ group?: string }> }) {
  const searchParams = await props.searchParams;
  const groupParam = searchParams?.group as MatchGroup | undefined;
  const group = groupParam || MatchGroup.MPLID;

  const [schedule, standings, stats, favoriteTeam, globalLeaderboard, remainingMatches] = await Promise.all([
    getMatchSchedule(group),
    getStandings(false, null, group),
    getPredictionStats(group),
    getFavoriteTeam(),
    getGlobalLeaderboard(group),
    getRemainingMatches(group)
  ]);

  const allMatches = schedule.flatMap((w) => w.matches);

  const completedMatches = allMatches.filter((m) => m.teamAResult !== null && m.teamBResult !== null);
  const upcomingMatches = allMatches.filter((m) => m.teamAResult === null || m.teamBResult === null);

  const nextMatches = upcomingMatches.slice(0, 3);
  const recentMatches = [...completedMatches].reverse().slice(0, 3);
  const top3 = standings.slice(0, 3);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <LayoutDashboard size={16} /> Overview
          </h2>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">

        {/* LEFT COLUMN (Main Content) */}
        <div className="md:col-span-8 flex flex-col gap-6">

          <FavoriteTeamCard
            favoriteTeam={favoriteTeam}
            standings={standings}
            remainingMatches={remainingMatches}
            teams={standings.map(s => ({ id: s.teamId, name: s.teamName, logo: s.logo }))}
          />
          <ClinchFeedCard standings={standings} remainingMatches={remainingMatches} />

          {/* Upcoming Matches */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Next Up
              </h3>
              <Link href={`/schedule${group ? `?group=${group}` : ''}`}>
                <Button variant="ghost" size="sm" className="text-xs">
                  View Full Schedule <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            {nextMatches.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nextMatches.map((match) => (
                  <Card key={match.id} className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-primary/10 bg-linear-to-b from-card to-muted/20">
                    <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-primary/50 to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        <span>Match {match.matchNo}</span>
                        <span>{formatDateShort(match.date)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 flex flex-col gap-4">
                      {/* Teams */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <TeamAvatar name={match.teamA.name} logo={match.teamA.logo} color="left" size="small" />
                          <span className="text-xs font-bold truncate max-w-[80px]">{match.teamA.name}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center px-1">
                          <span className="text-[10px] font-black text-muted-foreground/40 bg-muted px-1.5 py-0.5 rounded-sm">VS</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <TeamAvatar name={match.teamB.name} logo={match.teamB.logo} color="right" size="small" />
                          <span className="text-xs font-bold truncate max-w-[80px]">{match.teamB.name}</span>
                        </div>
                      </div>

                      {/* Prediction Status inside Next Up */}
                      <div className="flex justify-center mt-1">
                        {match.teamAPrediction !== null ? (
                          <Badge variant="outline" className="text-[10px] tracking-tight bg-primary/5 border-primary/20 text-primary">
                            Predicted: {match.teamAPrediction} - {match.teamBPrediction}
                          </Badge>
                        ) : (
                          <Link href={`/schedule${group ? `?group=${group}` : ''}`}>
                            <Badge variant="secondary" className="text-[10px] hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                              + Add Prediction
                            </Badge>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="flex items-center justify-center py-12 bg-muted/30 border-dashed">
                <span className="text-sm font-medium text-muted-foreground">No upcoming matches scheduled.</span>
              </Card>
            )}
          </div>

          {/* Recent Results */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-muted-foreground" /> Recent Results
              </h3>
            </div>

            {recentMatches.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="text-sm font-semibold">{match.teamA.name}</span>
                      <TeamAvatar name={match.teamA.name} logo={match.teamA.logo} color="left" size="small" />
                    </div>
                    <div className="flex items-center justify-center px-6 gap-3">
                      <span className="text-lg font-black tabular-nums">{match.teamAResult}</span>
                      <span className="text-muted-foreground/30 font-bold">-</span>
                      <span className="text-lg font-black tabular-nums">{match.teamBResult}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-start">
                      <TeamAvatar name={match.teamB.name} logo={match.teamB.logo} color="right" size="small" />
                      <span className="text-sm font-semibold">{match.teamB.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4 px-2">No massive clashes recently.</div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="md:col-span-4 flex flex-col gap-6">

          {/* Prediction Snapshot */}
          <Card className="bg-linear-to-br from-primary/10 via-card to-card border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Prediction Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-black">{stats.accuracy.toFixed(1)}<span className="text-xl text-muted-foreground">%</span></span>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Match Winners</span>
                    <span>{stats.correctWinners} / {stats.totalMatches}</span>
                  </div>
                  <AnimatedProgress
                    value={stats.accuracy}
                    className="**:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-red-500/80 **:data-[slot=progress-indicator]:bg-green-500 **:data-[slot=progress-indicator]:transition-all **:data-[slot=progress-indicator]:duration-1000 **:data-[slot=progress-indicator]:ease-out"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="w-3 h-3" /> Exact Scores</span>
                    <span>{stats.exactScores} / {stats.totalMatches}</span>
                  </div>
                  <AnimatedProgress
                    value={stats.exactScoreAccuracy}
                    className="**:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-red-500/80 **:data-[slot=progress-indicator]:bg-green-500 **:data-[slot=progress-indicator]:transition-all **:data-[slot=progress-indicator]:duration-1000 **:data-[slot=progress-indicator]:ease-out"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Leaderboard */}
          <GlobalLeaderboardCard leaderboard={globalLeaderboard} />

          {/* Top 3 Podiums */}
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> Current Leaders
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5">
              <div className="space-y-5">
                {top3.map((team, index: number) => (
                  <div key={team.teamId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${index === 0 ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500" :
                        index === 1 ? "bg-slate-300/30 text-slate-500 dark:text-slate-400" :
                          "bg-amber-700/20 text-amber-700 dark:text-amber-600"
                        }`}>
                        {team.rank}
                      </div>
                      <TeamAvatar name={team.teamName} logo={team.logo} color="left" size="small" />
                      <div>
                        <div className="text-sm font-bold leading-tight">{team.teamName}</div>
                        <div className="text-[10px] font-bold text-muted-foreground">{team.matchWins}-{team.matchLosses} W/L</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-red-600 dark:text-red-500">{team.matchPoints}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">Pts</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href={`/standing${group ? `?group=${group}` : ''}`}>
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    View Full Standings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
