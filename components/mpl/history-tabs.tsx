"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HistoryMatrix } from "@/components/mpl/history-matrix";
import { TeamAvatar } from "@/components/mpl/match-schedule";
import {
  CheckCircle2,
  Clock,
  Grid3X3,
  Swords,
  Trophy,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Team = { id: number; name: string; logo: string | null };

type SimpleMatch = {
  teamAId: number;
  teamBId: number;
  teamAResult: number | null;
  teamBResult: number | null;
};

type FullMatch = {
  id: number;
  week: number;
  day: number;
  matchNo: number;
  date: Date | string;
  teamAId: number;
  teamBId: number;
  teamAResult: number | null;
  teamBResult: number | null;
  teamA: Team;
  teamB: Team;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── TeamMatchRow ─────────────────────────────────────────────────────────────

function TeamMatchRow({
  match,
  teamId,
}: {
  match: FullMatch;
  teamId: number;
}) {
  const isTeamA = match.teamAId === teamId;
  const opponent = isTeamA ? match.teamB : match.teamA;
  const myResult = isTeamA ? match.teamAResult : match.teamBResult;
  const oppResult = isTeamA ? match.teamBResult : match.teamAResult;
  const isCompleted = myResult !== null && oppResult !== null;

  let resultLabel = "";
  let scoreColor = "text-muted-foreground";
  let labelColor = "text-muted-foreground";
  let bgAccent = "";

  if (isCompleted) {
    if (myResult! > oppResult!) {
      resultLabel = "WIN";
      scoreColor = "text-green-500 dark:text-green-400";
      labelColor = "text-green-500 dark:text-green-400";
      bgAccent = "border-l-2 border-l-green-500/60";
    } else if (myResult! < oppResult!) {
      resultLabel = "LOSS";
      scoreColor = "text-red-500 dark:text-red-400";
      labelColor = "text-red-500 dark:text-red-400";
      bgAccent = "border-l-2 border-l-red-500/60";
    } else {
      resultLabel = "DRAW";
      scoreColor = "text-yellow-500 dark:text-yellow-400";
      labelColor = "text-yellow-500 dark:text-yellow-400";
      bgAccent = "border-l-2 border-l-yellow-500/60";
    }
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3 hover:bg-muted/30 transition-colors ${bgAccent}`}
    >
      {/* Week */}
      <div className="flex flex-col items-center min-w-[40px] text-center">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">
          Wk
        </span>
        <span className="text-base font-black tabular-nums leading-none">
          {match.week}
        </span>
      </div>

      <div className="h-8 w-px bg-border/50 shrink-0" />

      {/* Opponent info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamAvatar
          name={opponent.name}
          logo={opponent.logo}
          color="right"
          size="small"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{opponent.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(match.date)} · Match {match.matchNo}
          </p>
        </div>
      </div>

      {/* Result or Upcoming */}
      {isCompleted ? (
        <div className="flex flex-col items-end shrink-0">
          <span className={`text-lg font-black tabular-nums leading-none ${scoreColor}`}>
            {myResult}–{oppResult}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5 ${labelColor}`}
          >
            {resultLabel}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Upcoming</span>
        </div>
      )}
    </div>
  );
}

// ─── TeamMatchesTab ────────────────────────────────────────────────────────────

function TeamMatchesTab({
  teams,
  allMatches,
}: {
  teams: Team[];
  allMatches: FullMatch[];
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    teams[0]?.id.toString() ?? ""
  );

  const selectedTeam = teams.find((t) => t.id.toString() === selectedTeamId);
  const teamIdNum = selectedTeam?.id ?? null;

  const teamMatches = teamIdNum
    ? allMatches.filter(
        (m) => m.teamAId === teamIdNum || m.teamBId === teamIdNum
      )
    : [];

  const completedMatches = teamMatches.filter(
    (m) => m.teamAResult !== null && m.teamBResult !== null
  );
  const remainingMatches = teamMatches.filter(
    (m) => m.teamAResult === null || m.teamBResult === null
  );

  // Quick win/loss stats
  const wins = completedMatches.filter((m) => {
    const myRes = m.teamAId === teamIdNum ? m.teamAResult! : m.teamBResult!;
    const oppRes = m.teamAId === teamIdNum ? m.teamBResult! : m.teamAResult!;
    return myRes > oppRes;
  }).length;
  const losses = completedMatches.length - wins;

  return (
    <div className="space-y-5">
      {/* Select + Stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select value={selectedTeamId} onValueChange={(v) => v && setSelectedTeamId(v)}>
          <SelectTrigger className="w-full sm:w-[260px] h-12">
            <SelectValue placeholder="Select a team">
              {selectedTeam ? (
                <div className="flex items-center gap-2">
                  <TeamAvatar
                    name={selectedTeam.name}
                    logo={selectedTeam.logo}
                    color="left"
                    size="small"
                  />
                  <span className="font-medium">{selectedTeam.name}</span>
                </div>
              ) : (
                "Select a team"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                <div className="flex items-center gap-2">
                  <TeamAvatar
                    name={team.name}
                    logo={team.logo}
                    color="left"
                    size="small"
                  />
                  <span>{team.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTeam && completedMatches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs">
              <Trophy className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{teamMatches.length} total</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs">
              <span className="font-semibold text-green-600 dark:text-green-400">{wins}W</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs">
              <span className="font-semibold text-red-600 dark:text-red-400">{losses}L</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs">
              <Clock className="h-3 w-3 text-primary/70" />
              <span className="font-semibold text-primary">{remainingMatches.length} left</span>
            </div>
          </div>
        )}
      </div>

      {selectedTeam && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Completed Matches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-border/50">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold text-sm">Completed</h3>
              <Badge variant="secondary" className="ml-auto text-xs tabular-nums">
                {completedMatches.length}
              </Badge>
            </div>

            {completedMatches.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 p-8 text-center">
                <p className="text-sm text-muted-foreground">No completed matches yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedMatches.map((m) => (
                  <TeamMatchRow key={m.id} match={m} teamId={teamIdNum!} />
                ))}
              </div>
            )}
          </div>

          {/* Remaining Matches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-border/50">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Remaining</h3>
              <Badge variant="outline" className="ml-auto text-xs tabular-nums">
                {remainingMatches.length}
              </Badge>
            </div>

            {remainingMatches.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  All matches completed! 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {remainingMatches.map((m) => (
                  <TeamMatchRow key={m.id} match={m} teamId={teamIdNum!} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HistoryTabs (main export) ─────────────────────────────────────────────────

export function HistoryTabs({
  teams,
  completedMatches,
  allMatches,
}: {
  teams: Team[];
  completedMatches: SimpleMatch[];
  allMatches: FullMatch[];
}) {
  return (
    <Tabs defaultValue="matrix" className="w-full">
      <TabsList className="mb-6 h-10 gap-1">
        <TabsTrigger value="matrix" className="gap-1.5">
          <Grid3X3 className="h-3.5 w-3.5" />
          Head-to-Head Matrix
        </TabsTrigger>
        <TabsTrigger value="team" className="gap-1.5">
          <Swords className="h-3.5 w-3.5" />
          Team Matches
        </TabsTrigger>
      </TabsList>

      <TabsContent value="matrix">
        <HistoryMatrix teams={teams} matches={completedMatches} />
      </TabsContent>

      <TabsContent value="team">
        <TeamMatchesTab teams={teams} allMatches={allMatches} />
      </TabsContent>
    </Tabs>
  );
}
