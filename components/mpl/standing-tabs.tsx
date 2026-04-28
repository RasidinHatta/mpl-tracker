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
import type { RemainingMatchSlim } from "@/actions/mpl/standings";

// ─── Monte Carlo simulation ────────────────────────────────────────────────────
//
// Algorithm (10 000 iterations):
//
//  1. Copy current match-points and net-game-wins into scratch arrays.
//  2. For every unplayed match, flip a biased coin (winProbA, default 0.5).
//     The winner gains +1 match point.  Net-game-win delta is sampled as
//     ±2 (2-0 result, 50% chance) or ±1 (2-1 result, 50% chance) to
//     approximate a realistic BO3 score distribution.
//  3. Sort teams by (matchPoints DESC, netGameWin DESC) — same tiebreaker
//     used by the live standings.
//  4. Tally how many times each team finishes in Top-2 (UB) and Top-6 (PO).
//  5. Percentages = count / 10 000 × 100, displayed to 2 decimal places.
//
// No artificial clamping — probabilities reflect only simulation results.
// Season-complete short-circuit: if no matches remain, emit 100% / 0%.
//
// Elo hook: replace winProbA in getRemainingMatches() when Elo ratings
// are available; no changes needed here.

const SIMULATIONS = 10_000;
const UB_SPOTS = 2;

type TeamWithChances = TeamStanding & {
  upperBracketPct: number; // 0.00 – 100.00 float
  playoffPct: number;
};

export function computeChances(
  standings: TeamStanding[],
  remainingMatches: RemainingMatchSlim[]
): TeamWithChances[] {
  const n = standings.length;
  if (n === 0) return [];

  const PO_SPOTS = Math.min(6, n);

  // Fast-path: season already complete — use current order directly.
  if (remainingMatches.length === 0) {
    return standings.map((team, i) => ({
      ...team,
      upperBracketPct: i < UB_SPOTS ? 100.0 : 0.0,
      playoffPct: i < PO_SPOTS ? 100.0 : 0.0,
    }));
  }

  // teamId → standings array index (O(1) lookup inside simulation loop)
  const idxById = new Map<number, number>();
  standings.forEach((s, i) => idxById.set(s.teamId, i));

  // Simulation counters — one cell per team index
  const ubHits = new Float64Array(n);
  const poHits = new Float64Array(n);

  // Scratch buffers reused every iteration (avoids GC pressure)
  const simPts = new Float64Array(n);
  const simNGW = new Float64Array(n);

  // Rank-order array: order[0] = standings index of the 1st-place team.
  // Re-sorted in-place each iteration.
  const order = Array.from({ length: n }, (_, i) => i);

  for (let iter = 0; iter < SIMULATIONS; iter++) {
    // 1. Reset to current standings
    for (let i = 0; i < n; i++) {
      simPts[i] = standings[i].matchPoints;
      simNGW[i] = standings[i].netGameWin;
    }

    // 2. Simulate remaining matches
    for (const m of remainingMatches) {
      const ai = idxById.get(m.teamAId);
      const bi = idxById.get(m.teamBId);
      if (ai === undefined || bi === undefined) continue;

      const aWins = Math.random() < m.winProbA;
      // BO3-style NGW delta: 2 (2-0 sweep, 50 %) or 1 (2-1, 50 %)
      const delta = Math.random() < 0.5 ? 2 : 1;

      if (aWins) {
        simPts[ai] += 1;
        simNGW[ai] += delta;
        simNGW[bi] -= delta;
      } else {
        simPts[bi] += 1;
        simNGW[bi] += delta;
        simNGW[ai] -= delta;
      }
    }

    // 3. Sort: Match Points DESC, then Net Game Win DESC
    order.sort((a, b) => {
      const pd = simPts[b] - simPts[a];
      return pd !== 0 ? pd : simNGW[b] - simNGW[a];
    });

    // 4. Tally finishes
    for (let rank = 0; rank < n; rank++) {
      const ti = order[rank];
      if (rank < UB_SPOTS) ubHits[ti]++;
      if (rank < PO_SPOTS) poHits[ti]++;
    }
  }

  // 5. Convert to percentages
  return standings.map((team, i) => ({
    ...team,
    upperBracketPct: parseFloat(((ubHits[i] / SIMULATIONS) * 100).toFixed(2)),
    playoffPct: parseFloat(((poHits[i] / SIMULATIONS) * 100).toFixed(2)),
  }));
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

export function StandingTabs({
  standings,
  remainingMatches,
}: {
  standings: TeamStanding[];
  remainingMatches: RemainingMatchSlim[];
}) {
  const withChances = computeChances(standings, remainingMatches);

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
                    <TableHead className="text-center text-foreground font-bold uppercase tracking-tight h-10 text-xs">
                      Match W-L
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
                        <TableCell className="text-center font-bold text-foreground text-sm tracking-tight">
                          {team.matchWins} - {team.matchLosses}
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
