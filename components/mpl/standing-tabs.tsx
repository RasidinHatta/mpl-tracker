"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TeamAvatar } from "@/components/mpl/match-schedule";
import type { TeamStanding } from "@/actions/mpl/standings";
import { BarChart3, Trophy, TrendingUp } from "lucide-react";

// ─── Chance Calculation ────────────────────────────────────────────────────────
//
// For each rank threshold (top-2 = Upper Bracket, top-6 = Playoff):
//
//  • If team is INSIDE the zone  → chance = how secure is their lead over
//    the first team outside the zone:  lead / (lead + their_remaining + 1) → [55, 99]
//  • If team is OUTSIDE the zone → can they still mathematically catch up?
//    pct = (remaining - gap) / (remaining + 1) capped → [0, 49]
//  • Edge cases: already locked in (100) or mathematically eliminated (0).
//
// Percentages are floating-point; display with toFixed(2).

type TeamWithChances = TeamStanding & {
  upperBracketPct: number; // 0.00 – 100.00 float
  playoffPct: number;
};

function computeChances(standings: TeamStanding[]): TeamWithChances[] {
  const n = standings.length;
  if (n === 0) return [];

  const UB_SPOTS = 2;
  const PO_SPOTS = Math.min(6, n);

  const allUnplayed = standings.every(
    (s) => s.matchWins + s.matchLosses === 0
  );

  return standings.map((team, idx) => {
    const rank = idx + 1;
    const currentPts = team.matchPoints;
    const playedMatches = team.matchWins + team.matchLosses;
    const remaining = Math.max(0, team.totalMatches - playedMatches);
    const maxPts = currentPts + remaining;

    function chanceFor(spots: number): number {
      // No data yet → equal split
      if (allUnplayed) {
        return rank <= spots
          ? 50.0
          : parseFloat(((spots / n) * 100).toFixed(2));
      }

      const thresholdTeam = standings[spots - 1];
      const firstOutside = standings[spots]; // undefined if spots === n

      if (rank <= spots) {
        // Inside zone: how likely to stay?
        if (!firstOutside) return 100.0;

        const theirRem = Math.max(
          0,
          firstOutside.totalMatches -
            (firstOutside.matchWins + firstOutside.matchLosses)
        );

        // They can never overtake even winning every remaining match
        if (firstOutside.matchPoints + theirRem < currentPts) return 100.0;

        const lead = currentPts - firstOutside.matchPoints; // positive
        const raw = lead / (lead + theirRem + 1);
        return parseFloat(Math.min(99, Math.max(55, raw * 100)).toFixed(2));
      } else {
        // Outside zone: can we climb in?
        if (maxPts < thresholdTeam.matchPoints) return 0.0;
        if (remaining === 0) return 0.0;

        const gap = thresholdTeam.matchPoints - currentPts; // positive
        const raw = Math.max(0, (remaining - gap) / (remaining + 1));
        return parseFloat(Math.min(49, raw * 60).toFixed(2));
      }
    }

    return {
      ...team,
      upperBracketPct: chanceFor(UB_SPOTS),
      playoffPct: chanceFor(PO_SPOTS),
    };
  });
}

// ─── ChancePct ────────────────────────────────────────────────────────────────

function ChancePct({ pct }: { pct: number }) {
  const color =
    pct >= 90
      ? "text-green-500 dark:text-green-400"
      : pct >= 50
      ? "text-amber-500 dark:text-amber-400"
      : pct > 0
      ? "text-muted-foreground"
      : "text-red-500/70 dark:text-red-400/70";

  return (
    <span className={`text-sm font-black tabular-nums ${color}`}>
      {pct.toFixed(2)}%
    </span>
  );
}

// ─── StandingTabs ─────────────────────────────────────────────────────────────

export function StandingTabs({ standings }: { standings: TeamStanding[] }) {
  const withChances = computeChances(standings);

  return (
    <Tabs defaultValue="standings" className="w-full">
      <TabsList className="mb-6 h-10 gap-1">
        <TabsTrigger value="standings" className="gap-1.5">
          <Trophy className="h-3.5 w-3.5" />
          Standings
        </TabsTrigger>
        <TabsTrigger value="chances" className="gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Bracket Chances
        </TabsTrigger>
      </TabsList>

      {/* ── Tab 1: Classic standings ─────────────────────────────────────── */}
      <TabsContent value="standings">
        <Card>
          <CardHeader>
            <CardTitle>Regular Season</CardTitle>
            <CardDescription>
              Current team rankings based on match points and net game wins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted border-none">
                    <TableHead className="text-foreground font-bold h-10 px-4 uppercase tracking-tight w-[300px] text-xs">
                      Team
                    </TableHead>
                    <TableHead className="text-center text-red-600 dark:text-red-500 font-bold uppercase tracking-tight h-10 text-xs">
                      Match Point
                    </TableHead>
                    <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">
                      Match W-L
                    </TableHead>
                    <TableHead className="text-center text-red-600 dark:text-red-500 font-bold uppercase tracking-tight h-10 text-xs">
                      Net Game Win
                    </TableHead>
                    <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">
                      Game W-L
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((team) => (
                    <TableRow
                      key={team.teamId}
                      className="hover:bg-muted/50 border-border transition-colors"
                    >
                      <TableCell className="p-0 align-middle">
                        <div className="flex items-center">
                          <div className="flex h-12 w-6 shrink-0 items-center justify-center bg-muted-foreground/20 text-foreground font-black text-lg mr-4">
                            {team.rank}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="shrink-0">
                              <TeamAvatar
                                name={team.teamName}
                                logo={team.logo}
                                color="left"
                                size="small"
                              />
                            </div>
                            <span className="font-bold text-sm text-foreground uppercase tracking-tight">
                              {team.teamName}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-red-600 dark:text-red-500 text-sm">
                        {team.matchPoints}
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground text-sm tracking-tight">
                        {team.matchWins} - {team.matchLosses}
                      </TableCell>
                      <TableCell className="text-center font-black text-red-600 dark:text-red-500 text-sm">
                        {team.netGameWin}
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground text-sm tracking-tight">
                        {team.gameWins} - {team.gameLosses}
                      </TableCell>
                    </TableRow>
                  ))}
                  {standings.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground font-semibold"
                      >
                        No team standings available yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Tab 2: Bracket chances ───────────────────────────────────────── */}
      <TabsContent value="chances">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Bracket &amp; Playoff Chances
            </CardTitle>
            <CardDescription>
              Estimated probability of reaching the Upper Bracket (Top 2) and
              qualifying for Playoffs (Top 6) based on current standings and
              remaining scheduled matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted border-none">
                    <TableHead className="text-foreground font-bold h-10 px-4 uppercase tracking-tight w-[300px] text-xs">
                      Team
                    </TableHead>
                    <TableHead className="text-center text-red-600 dark:text-red-500 font-bold uppercase tracking-tight h-10 text-xs">
                      Match Point
                    </TableHead>
                    <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">
                      Match W-L
                    </TableHead>
                    <TableHead className="text-center text-red-600 dark:text-red-500 font-bold uppercase tracking-tight h-10 text-xs">
                      Net Game Win
                    </TableHead>
                    <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">
                      Game W-L
                    </TableHead>
                    <TableHead className="text-center text-amber-500 dark:text-amber-400 font-bold uppercase tracking-tight h-10 text-xs">
                      Upper Bracket
                    </TableHead>
                    <TableHead className="text-center text-primary font-bold uppercase tracking-tight h-10 text-xs">
                      Playoff
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withChances.map((team, idx) => {
                    const isUB = idx < 2;
                    const isPO = !isUB && idx < 6;
                    return (
                      <TableRow
                        key={team.teamId}
                        className={`border-border transition-colors ${
                          isUB
                            ? "bg-amber-500/5 hover:bg-amber-500/10"
                            : isPO
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <TableCell className="p-0 align-middle">
                          <div className="flex items-center">
                            <div
                              className={`flex h-12 w-6 shrink-0 items-center justify-center font-black text-lg mr-4 ${
                                isUB
                                  ? "bg-amber-500/30 text-amber-600 dark:text-amber-400"
                                  : isPO
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted-foreground/20 text-foreground"
                              }`}
                            >
                              {team.rank}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="shrink-0">
                                <TeamAvatar
                                  name={team.teamName}
                                  logo={team.logo}
                                  color="left"
                                  size="small"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-sm text-foreground uppercase tracking-tight">
                                  {team.teamName}
                                </span>
                                {isUB && (
                                  <p className="text-[10px] font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wider leading-none mt-0.5">
                                    Upper Bracket
                                  </p>
                                )}
                                {isPO && (
                                  <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider leading-none mt-0.5">
                                    Playoff Zone
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-black text-red-600 dark:text-red-500 text-sm">
                          {team.matchPoints}
                        </TableCell>
                        <TableCell className="text-center font-bold text-foreground text-sm tracking-tight">
                          {team.matchWins} - {team.matchLosses}
                        </TableCell>
                        <TableCell className="text-center font-black text-red-600 dark:text-red-500 text-sm">
                          {team.netGameWin}
                        </TableCell>
                        <TableCell className="text-center font-bold text-foreground text-sm tracking-tight">
                          {team.gameWins} - {team.gameLosses}
                        </TableCell>
                        <TableCell className="text-center">
                          <ChancePct pct={team.upperBracketPct} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ChancePct pct={team.playoffPct} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {standings.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground font-semibold"
                      >
                        No team standings available yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-amber-500/30" />
                <span>Upper Bracket (Top 2)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary/20" />
                <span>Playoff Zone (Top 6)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/20" />
                <span>Outside playoff contention</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
