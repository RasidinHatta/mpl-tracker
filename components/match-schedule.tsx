"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WeekSchedule } from "@/actions/matches";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseResult(result: string | null) {
  if (!result) return null;
  // Expected format: "3-2" or "TeamA 3 - 2 TeamB" etc.
  const parts = result.split("-").map((s) => s.trim());
  if (parts.length === 2) {
    return { scoreA: parts[0], scoreB: parts[1] };
  }
  return null;
}

function MatchCard({
  match,
}: {
  match: WeekSchedule["matches"][number];
}) {
  const scores = parseResult(match.result);
  const hasResult = scores !== null;

  return (
    <Card className="group/match relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      {/* Decorative gradient bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-500 via-blue-500 to-cyan-500 opacity-60 transition-opacity duration-300 group-hover/match:opacity-100" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              {formatDate(match.date)}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span>{match.day}</span>
          </CardDescription>
          {hasResult ? (
            <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
              Completed
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider animate-pulse">
              Upcoming
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Teams vs display */}
        <div className="flex items-center justify-between gap-3">
          {/* Team A */}
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-violet-500/10 to-blue-500/10 ring-1 ring-violet-500/20 transition-all duration-300 group-hover/match:ring-violet-500/40">
              <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                {match.teamA.name.charAt(0)}
              </span>
            </div>
            <span className="max-w-[100px] truncate text-center text-xs font-medium">
              {match.teamA.name}
            </span>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1">
            {hasResult ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tabular-nums tracking-tight">
                  {scores.scoreA}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  —
                </span>
                <span className="text-2xl font-extrabold tabular-nums tracking-tight">
                  {scores.scoreB}
                </span>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60">
                <span className="text-sm font-bold text-muted-foreground">
                  VS
                </span>
              </div>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20 transition-all duration-300 group-hover/match:ring-cyan-500/40">
              <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                {match.teamB.name.charAt(0)}
              </span>
            </div>
            <span className="max-w-[100px] truncate text-center text-xs font-medium">
              {match.teamB.name}
            </span>
          </div>
        </div>

        {/* Prediction row */}
        {match.prediction && (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
            <span>
              Prediction: <span className="font-medium text-foreground">{match.prediction}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MatchSchedule({
  schedule,
}: {
  schedule: WeekSchedule[];
}) {
  if (schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">No matches scheduled</p>
          <p className="text-sm text-muted-foreground">
            Match schedules will appear here once available.
          </p>
        </div>
      </div>
    );
  }

  const defaultWeek = `week-${schedule[0].week}`;

  return (
    <Tabs defaultValue={defaultWeek} className="w-full">
      <div className="mb-6 overflow-x-auto pb-2">
        <TabsList className="inline-flex h-auto w-auto gap-1 bg-muted/50 p-1 backdrop-blur-sm">
          {schedule.map((week) => {
            const completedCount = week.matches.filter(
              (m) => m.result !== null
            ).length;
            const totalCount = week.matches.length;
            const allDone = completedCount === totalCount;

            return (
              <TabsTrigger
                key={week.week}
                value={`week-${week.week}`}
                className="relative flex flex-col gap-0.5 px-4 py-2 text-xs data-active:bg-background"
              >
                <span className="font-semibold">Week {week.week}</span>
                <span className="text-[10px] text-muted-foreground">
                  {allDone ? (
                    <span className="text-emerald-500">✓ Done</span>
                  ) : (
                    `${completedCount}/${totalCount}`
                  )}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {schedule.map((week) => {
        // Group matches by day
        const matchesByDay = new Map<string, typeof week.matches>();
        for (const match of week.matches) {
          const key = `${match.day}|${new Date(match.date).toISOString().split("T")[0]}`;
          if (!matchesByDay.has(key)) {
            matchesByDay.set(key, []);
          }
          matchesByDay.get(key)!.push(match);
        }

        return (
          <TabsContent key={week.week} value={`week-${week.week}`}>
            <div className="space-y-8">
              {Array.from(matchesByDay.entries()).map(([dayKey, dayMatches]) => {
                const [dayName] = dayKey.split("|");
                return (
                  <div key={dayKey}>
                    <div className="mb-4 flex items-center gap-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {dayName}
                      </h3>
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground">
                        {dayMatches.length} match{dayMatches.length > 1 ? "es" : ""}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {dayMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
