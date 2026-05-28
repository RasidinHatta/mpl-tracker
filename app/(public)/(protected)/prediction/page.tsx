import React from "react";
import Link from "next/link";
import { PieChart, Target, CheckCircle2, Trophy, BarChart3, TrendingUp, XCircle, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { AnimatedProgress } from "@/components/mpl/animated-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPredictionStats } from "@/actions/mpl/predictions";
import { getStandings } from "@/actions/mpl/standings";
import { getMatchSchedule } from "@/actions/mpl/matches";
import { TeamAvatar } from "@/components/mpl/match-schedule";
import { MatchGroup } from "@/lib/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata = {
  title: "MPL Tracker — Predictions",
  description: "Make your match predictions and track your accuracy.",
};

export default async function PredictionPage(props: { searchParams?: Promise<{ group?: string }> }) {
  const searchParams = await props.searchParams;
  const groupParam = searchParams?.group as MatchGroup | undefined;
  const group = groupParam || MatchGroup.MPLID; // Default to MPLID
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Please log in</CardTitle>
            <CardDescription>
              Predictions are tied to your account. Log in to make predictions and track your accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in">
              <Button>Log in to continue</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = await getPredictionStats(group);
  const weeklyMatches = await getMatchSchedule(group);

  let currentWeek = 0;
  let maxWeek = 0;
  for (const week of weeklyMatches) {
    maxWeek = Math.max(maxWeek, week.week);
    if (week.matches.some(m => m.teamAResult !== null && m.teamBResult !== null)) {
      currentWeek = Math.max(currentWeek, week.week);
    }
  }
  const nextWeek = maxWeek > 0 ? Math.min(currentWeek + 1, maxWeek) : 1;

  const remainingWeeks = Array.from({ length: Math.max(0, maxWeek - nextWeek + 1) }, (_, i) => nextWeek + i);
  if (remainingWeeks.length === 0) remainingWeeks.push(nextWeek);

  const predictedStandingsByWeek = await Promise.all(
    remainingWeeks.map(async (week) => ({
      week,
      standings: await getStandings(true, week, group)
    }))
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <PieChart size={16} /> Match Predictions
          </h2>
          <h1 className="text-4xl font-bold tracking-tight">Predictions Accuracy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Matches with both result & prediction.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Win Accuracy</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.correctWinners} correct match winners.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exact Scores</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exactScores}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Perfectly guessed match scores.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Perfect Accuracy</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exactScoreAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of exact score matches.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12 mt-2">
        <Card className="md:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Accuracy Progress</CardTitle>
            <CardDescription>Visual breakdown of your prediction performance.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Weekly Performance Bar */}
            <div className="space-y-3 mb-6 overflow-y-auto pr-2 max-h-[250px]">
              {weeklyMatches.map((week) => (
                <div key={week.week} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">
                    Week {week.week}
                  </span>
                  <div className="flex flex-1 gap-1 h-3">
                    {week.matches.map((match) => {
                      const hasPrediction = match.teamAPrediction !== null && match.teamBPrediction !== null;
                      const hasResult = match.teamAResult !== null && match.teamBResult !== null;

                      let bgColor = "bg-muted"; // No prediction
                      if (hasPrediction && hasResult) {
                        const predictedWinnerA = match.teamAPrediction! > match.teamBPrediction!;
                        const actualWinnerA = match.teamAResult! > match.teamBResult!;
                        // "if prediction true make the bar green"
                        if (predictedWinnerA === actualWinnerA) {
                          bgColor = "bg-green-500";
                        } else {
                          bgColor = "bg-destructive";
                        }
                      } else if (hasPrediction && !hasResult) {
                        bgColor = "bg-primary/40"; // pending
                      }

                      return (
                        <div
                          key={match.id}
                          className={`flex-1 rounded-sm ${bgColor}`}
                          title={`${match.teamA.name} vs ${match.teamB.name}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6 mt-auto">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Match Winner Accuracy</span>
                  <span className="font-bold">{stats.accuracy.toFixed(1)}%</span>
                </div>
                <AnimatedProgress
                  value={stats.accuracy}
                  className="**:data-[slot=progress-track]:h-3 **:data-[slot=progress-track]:bg-red-500 **:data-[slot=progress-indicator]:bg-green-500 **:data-[slot=progress-indicator]:transition-all **:data-[slot=progress-indicator]:duration-1000 **:data-[slot=progress-indicator]:ease-out"
                  title={`${stats.accuracy.toFixed(1)}% Correct, ${(100 - stats.accuracy).toFixed(1)}% Incorrect`}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Exact Score Accuracy</span>
                  <span className="font-bold">{stats.exactScoreAccuracy.toFixed(1)}%</span>
                </div>
                <AnimatedProgress
                  value={stats.exactScoreAccuracy}
                  className="**:data-[slot=progress-track]:h-3 **:data-[slot=progress-track]:bg-red-500 **:data-[slot=progress-indicator]:bg-green-500 **:data-[slot=progress-indicator]:transition-all **:data-[slot=progress-indicator]:duration-1000 **:data-[slot=progress-indicator]:ease-out"
                  title={`${stats.exactScoreAccuracy.toFixed(1)}% Correct, ${(100 - stats.exactScoreAccuracy).toFixed(1)}% Incorrect`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-8">
          <CardHeader className="flex flex-row items-start md:items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Forecasted Standings</CardTitle>
              <CardDescription>What the standings would look like if your predictions come true.</CardDescription>
            </div>
            <Link href="/schedule">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Plus className="w-4 h-4 mr-2" /> Add Prediction
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {predictedStandingsByWeek.length > 0 ? (
              <Tabs defaultValue={predictedStandingsByWeek[0].week.toString()} className="w-full">
                <TabsList className="mb-4 flex flex-wrap h-auto">
                  {predictedStandingsByWeek.map(({ week }) => (
                    <TabsTrigger key={week} value={week.toString()}>
                      Week {week}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {predictedStandingsByWeek.map(({ week, standings }) => (
                  <TabsContent key={week} value={week.toString()}>
                    <div className="rounded-md border overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted hover:bg-muted border-none">
                            <TableHead className="text-foreground font-bold h-10 px-4 uppercase tracking-tight text-xs">Team</TableHead>
                            <TableHead className="text-center text-red-600 dark:text-red-500 font-bold uppercase tracking-tight h-10 text-xs">Match Point</TableHead>
                            <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">Match W-L</TableHead>
                            <TableHead className="text-center text-red-600 dark:text-red-500 font-bold uppercase tracking-tight h-10 text-xs">Net Game</TableHead>
                            <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">Game W-L</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {standings.map((team) => (
                            <TableRow key={team.teamId} className="hover:bg-muted/50 border-border transition-colors">
                              <TableCell className="p-0 align-middle">
                                <div className="flex items-center h-full">
                                  <div className="flex h-12 w-6 shrink-0 items-center justify-center bg-muted-foreground/20 text-foreground font-black text-lg mr-3">
                                    {team.rank}
                                  </div>
                                  <div className="flex items-center gap-3 py-1">
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
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground font-semibold">
                No team standings available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Predictions Breakdown */}
      <Card className="mt-2">
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
          <CardDescription>Track your predictive accuracy across every match by week.</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyMatches.length > 0 ? (
            <Tabs defaultValue={weeklyMatches[0].week.toString()} className="w-full">
              <TabsList className="mb-4 flex flex-wrap h-auto">
                {weeklyMatches.map((week) => (
                  <TabsTrigger key={week.week} value={week.week.toString()}>
                    Week {week.week}
                  </TabsTrigger>
                ))}
              </TabsList>

              {weeklyMatches.map((week) => (
                <TabsContent key={week.week} value={week.week.toString()}>
                  <div className="rounded-md border overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted border-none">
                          <TableHead className="text-foreground font-bold h-10 px-4 text-xs tracking-wide">MATCHUP</TableHead>
                          <TableHead className="text-center text-foreground font-bold h-10 px-4 text-xs tracking-wide">PREDICTION</TableHead>
                          <TableHead className="text-center text-foreground font-bold h-10 px-4 text-xs tracking-wide">RESULT</TableHead>
                          <TableHead className="text-center text-foreground font-bold h-10 px-4 text-xs tracking-wide w-[120px]">STATUS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {week.matches.map((match) => {
                          const hasPrediction = match.teamAPrediction !== null && match.teamBPrediction !== null;
                          const hasResult = match.teamAResult !== null && match.teamBResult !== null;

                          let statusIcon = <div className="text-xs font-semibold text-muted-foreground">NO PREDICTION</div>;
                          if (hasPrediction && !hasResult) {
                            statusIcon = <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground"><Clock className="w-3.5 h-3.5" /> PENDING</div>;
                          } else if (hasPrediction && hasResult) {
                            const predictedWinnerA = match.teamAPrediction! > match.teamBPrediction!;
                            const actualWinnerA = match.teamAResult! > match.teamBResult!;
                            const exact = match.teamAPrediction === match.teamAResult && match.teamBPrediction === match.teamBResult;

                            if (exact) {
                              statusIcon = <div className="flex items-center justify-center gap-1.5 text-xs text-green-500 font-bold"><CheckCircle2 className="w-4 h-4" /> EXACT</div>;
                            } else if (predictedWinnerA === actualWinnerA) {
                              statusIcon = <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-bold"><Target className="w-4 h-4" /> WINNER</div>;
                            } else {
                              statusIcon = <div className="flex items-center justify-center gap-1.5 text-xs text-destructive font-bold"><XCircle className="w-4 h-4" /> WRONG</div>;
                            }
                          } else if (!hasPrediction && hasResult) {
                            statusIcon = <div className="text-xs font-semibold text-muted-foreground/50">MISSED</div>;
                          }

                          return (
                            <TableRow key={match.id} className="hover:bg-muted/10 transition-colors">
                              <TableCell>
                                <div className="flex items-center gap-2 w-max">
                                  <span className="font-bold text-sm min-w-[60px] text-right">{match.teamA.name}</span>
                                  <div className="shrink-0">
                                    <TeamAvatar name={match.teamA.name} logo={match.teamA.logo} color="left" size="small" />
                                  </div>
                                  <span className="text-muted-foreground/40 font-bold text-xs mx-1">vs</span>
                                  <div className="shrink-0">
                                    <TeamAvatar name={match.teamB.name} logo={match.teamB.logo} color="right" size="small" />
                                  </div>
                                  <span className="font-bold text-sm min-w-[60px]">{match.teamB.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-bold text-muted-foreground">
                                {hasPrediction ? `${match.teamAPrediction} - ${match.teamBPrediction}` : "-"}
                              </TableCell>
                              <TableCell className="text-center font-bold text-foreground">
                                {hasResult ? `${match.teamAResult} - ${match.teamBResult}` : "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {statusIcon}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground font-semibold">
              No match data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
