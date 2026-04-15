"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { WeekSchedule } from "@/actions/matches";
import { Trophy, Calendar, Clock, TrendingUp, ChevronRight, Swords } from "lucide-react";

function formatDate(date: Date | string) {
  const d = new Date(date);
  return {
    full: d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    short: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

function parseResult(result: string | null) {
  if (!result) return null;
  const parts = result.split("-").map((s) => s.trim());
  if (parts.length === 2) {
    return { scoreA: parts[0], scoreB: parts[1] };
  }
  return null;
}

function isMatchCompleted(match: { result: string | null; date: Date | string }) {
  if (match.result !== null) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const matchDate = new Date(match.date);
  matchDate.setHours(0, 0, 0, 0);
  return today > matchDate;
}

function TeamAvatar({ name, logo, color }: { name: string; logo?: string | null; color: "left" | "right" }) {
  const gradientClass = color === "left" 
    ? "from-primary/20 via-primary/10 to-transparent" 
    : "from-secondary/20 via-secondary/10 to-transparent";
  
  const ringClass = color === "left"
    ? "ring-primary/30 group-hover:ring-primary/50"
    : "ring-secondary/30 group-hover:ring-secondary/50";

  return (
    <div className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${gradientClass} ring-1 ${ringClass} transition-all duration-300`}>
      {logo ? (
        <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain p-1" />
      ) : (
        <span className="text-xl font-bold text-foreground/90">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function MatchCard({
  match,
}: {
  match: WeekSchedule["matches"][number];
}) {
  const scores = parseResult(match.result);
  const hasResult = scores !== null;
  const completed = isMatchCompleted(match);
  const dateInfo = formatDate(match.date);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary via-primary/50 to-secondary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{dateInfo.short}</span>
            <span className="text-muted-foreground/30">•</span>
            <Clock className="h-3.5 w-3.5" />
            <span>{match.day}</span>
          </div>
          
          {completed ? (
            <Badge variant="secondary" className="h-5 gap-1 text-[10px] font-medium">
              <Trophy className="h-3 w-3" />
              Completed
            </Badge>
          ) : (
            <Badge variant="outline" className="h-5 gap-1 text-[10px] font-medium border-primary/20 text-primary">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Upcoming
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative pb-5 pt-0">
        {/* Teams Display */}
        <div className="flex items-center justify-between gap-4">
          {/* Team A */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <TeamAvatar name={match.teamA.name} logo={match.teamA.logo} color="left" />
            <span className="max-w-[100px] truncate text-center text-sm font-semibold">
              {match.teamA.name}
            </span>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 px-2">
            {hasResult ? (
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black tabular-nums tracking-tight ${Number(scores.scoreA) > Number(scores.scoreB) ? "text-primary" : "text-muted-foreground"}`}>
                  {scores.scoreA}
                </span>
                <span className="text-lg font-medium text-muted-foreground/50">:</span>
                <span className={`text-3xl font-black tabular-nums tracking-tight ${Number(scores.scoreB) > Number(scores.scoreA) ? "text-primary" : "text-muted-foreground"}`}>
                  {scores.scoreB}
                </span>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border">
                <Swords className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <TeamAvatar name={match.teamB.name} logo={match.teamB.logo} color="right" />
            <span className="max-w-[100px] truncate text-center text-sm font-semibold">
              {match.teamB.name}
            </span>
          </div>
        </div>

        {/* Prediction */}
        {match.prediction && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Prediction:</span>
            <span className="font-semibold text-foreground">{match.prediction}</span>
          </div>
        )}

        {/* Action hint */}
        <div className={`mt-3 flex justify-center transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
            View Details
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
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
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/80 ring-1 ring-border">
          <Calendar className="h-8 w-8 text-muted-foreground/60" />
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
      {/* Week Navigation */}
      <div className="mb-8 overflow-x-auto pb-2">
        <TabsList className="flex w-max h-auto! items-stretch gap-1 bg-muted/50 p-1.5 backdrop-blur-sm">
          {schedule.map((week) => {
            const completedCount = week.matches.filter(isMatchCompleted).length;
            const totalCount = week.matches.length;
            const progress = (completedCount / totalCount) * 100;
            const allDone = completedCount === totalCount;

            return (
              <TabsTrigger
                key={week.week}
                value={`week-${week.week}`}
                className="relative flex min-w-[100px] h-auto! flex-col items-center justify-center gap-2 px-4 py-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <span className="font-semibold text-sm">Week {week.week}</span>
                <div className="flex w-full flex-col items-center justify-center gap-1.5">
                  {allDone ? (
                    <span className="text-[10px] font-medium text-green-500 uppercase tracking-wider">Completed</span>
                  ) : (
                    <>
                      <Progress value={progress} className="h-1.5 w-16" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {completedCount}/{totalCount} Matches
                      </span>
                    </>
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Week Content */}
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

        const completedCount = week.matches.filter(isMatchCompleted).length;

        return (
          <TabsContent key={week.week} value={`week-${week.week}`} className="space-y-8">
            {/* Week Summary Header */}
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold">Week {week.week} Overview</h3>
                <p className="text-xs text-muted-foreground">
                  {week.matches.length} matches • {completedCount} completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                {completedCount === week.matches.length ? (
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    Week Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    In Progress
                  </Badge>
                )}
              </div>
            </div>

            {/* Matches by Day */}
            <div className="space-y-8">
              {Array.from(matchesByDay.entries()).map(([dayKey, dayMatches]) => {
                const [dayName, dateStr] = dayKey.split("|");
                const dateInfo = formatDate(dateStr);

                return (
                  <div key={dayKey} className="space-y-4">
                    {/* Day Header */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/80 font-semibold text-sm">
                          {dateInfo.dayName}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">{dayName}</h4>
                          <p className="text-xs text-muted-foreground">{dateInfo.full}</p>
                        </div>
                      </div>
                      <div className="h-px flex-1 bg-border/50" />
                      <span className="text-xs text-muted-foreground">
                        {dayMatches.length} match{dayMatches.length > 1 ? "es" : ""}
                      </span>
                    </div>

                    {/* Match Grid */}
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