/* eslint-disable @next/next/no-img-element */
"use client";

import { PlayoffMatchWithTeams } from "@/actions/mpl/playoffs";
import type { TeamStanding } from "@/actions/mpl/standings";
import { MatchGroup } from "@/lib/generated/prisma/enums";
import { UpdatePlayoffMatchDialog } from "./update-playoff-match-dialog";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { Trophy } from "lucide-react";

type Props = {
  matches: PlayoffMatchWithTeams[];
  standings: TeamStanding[];
  group: MatchGroup;
  isAdmin: boolean;
  isSignedIn: boolean;
};

function formatMatchDate(date: Date | string | null) {
  if (!date) return null;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return null;

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getMatchWinner(match?: PlayoffMatchWithTeams) {
  if (
    !match ||
    match.teamAResult === null ||
    match.teamBResult === null ||
    !match.teamA ||
    !match.teamB
  ) {
    return null;
  }

  if (match.teamAResult > match.teamBResult) return match.teamA;
  if (match.teamBResult > match.teamAResult) return match.teamB;
  return null;
}

function getGroupCode(group: MatchGroup) {
  return group.replace("MPL", "");
}

function getGroupLogo(group: MatchGroup) {
  const logos: Record<MatchGroup, string> = {
    [MatchGroup.MPLID]: "/mpl-id.png",
    [MatchGroup.MPLPH]: "/mpl-ph.png",
    [MatchGroup.MPLMY]: "/mpl-my.png",
  };

  return logos[group];
}

export function PlayoffBracket({ matches, standings, group, isAdmin, isSignedIn }: Props) {
  const getMatch = (id: string) => matches.find((m) => m.matchId === id);

  const ubq1 = getMatch("UBQ1");
  const ubq2 = getMatch("UBQ2");
  const ubs1 = getMatch("UBS1");
  const ubs2 = getMatch("UBS2");
  const ubf = getMatch("UBF");
  const lbsf = getMatch("LBSF");
  const lbf = getMatch("LBF");
  const gf = getMatch("GF");
  const champion = getMatchWinner(gf);
  const championStats = getTeamPlayoffStats(matches, champion?.id);
  const regularStats = getTeamRegularStats(standings, champion?.id);
  const groupCode = getGroupCode(group);
  const groupLogo = getGroupLogo(group);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto pb-12">
      <div className="relative flex w-[1140px] max-w-none select-none gap-5 p-4" id="bracket-container">
        <BracketLines />
        {/* Column 1: UB Quarterfinals */}
        <div className="flex w-52 shrink-0 flex-col gap-8">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">UB Quarterfinals</div>
          <MatchCard match={ubq1} isAdmin={isAdmin} isSignedIn={isSignedIn} title="M1" placeholderA="Seed 3" placeholderB="Seed 6" matchId="M1" />
          <div className="h-[90px]" /> {/* Spacer */}
          <MatchCard match={ubq2} isAdmin={isAdmin} isSignedIn={isSignedIn} title="M2" placeholderA="Seed 4" placeholderB="Seed 5" matchId="M2" />
        </div>

        {/* Column 2: UB Semifinals & LB Semifinal */}
        <div className="flex w-52 shrink-0 flex-col gap-8">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">UB Semifinals</div>
          <div className="mt-8">
            <MatchCard match={ubs1} isAdmin={isAdmin} isSignedIn={isSignedIn} title="M3" placeholderA="Seed 1" placeholderB="Winner M1" matchId="M3" />
          </div>
          <div className="h-8" />
          <MatchCard match={ubs2} isAdmin={isAdmin} isSignedIn={isSignedIn} title="M4" placeholderA="Seed 2" placeholderB="Winner M2" matchId="M4" />
          
          <div className="mt-10 text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">LB Semifinal</div>
          <MatchCard match={lbsf} isAdmin={isAdmin} isSignedIn={isSignedIn} title="M6" placeholderA="Loser M3" placeholderB="Loser M4" matchId="M6" />
        </div>

        {/* Column 3: UB Final & LB Final */}
        <div className="flex w-52 shrink-0 flex-col gap-8">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">UB Final</div>
          <div className="mt-28">
            <MatchCard match={ubf} isAdmin={isAdmin} isSignedIn={isSignedIn} title="M5" placeholderA="Winner M3" placeholderB="Winner M4" matchId="M5" />
          </div>
          
          <div className="mt-[136px] text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">LB Final</div>
          <MatchCard match={lbf} isAdmin={isAdmin} isSignedIn={isSignedIn} title="M7" placeholderA="Loser M5" placeholderB="Winner M6" matchId="M7" />
        </div>

        {/* Column 4: Grand Final */}
        <div className="flex w-60 shrink-0 flex-col gap-8">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">Grand Final</div>
          <div className="mt-[198px]">
            <MatchCard match={gf} isAdmin={isAdmin} isSignedIn={isSignedIn} title="M8" placeholderA="Winner M5" placeholderB="Winner M7" matchId="M8" featured />
          </div>
        </div>

        {/* Column 5: Champion */}
        <div className="flex w-64 shrink-0 flex-col gap-8">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">Champion</div>
          <div className="mt-[116px]">
            <ChampionCard champion={champion} regularStats={regularStats} playoffStats={championStats} groupCode={groupCode} groupLogo={groupLogo} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getTeamPlayoffStats(matches: PlayoffMatchWithTeams[], teamId?: number) {
  if (!teamId) {
    return { wins: 0, losses: 0, winRate: null };
  }

  return matches.reduce(
    (stats, match) => {
      if (
        match.teamAResult === null ||
        match.teamBResult === null ||
        !match.teamA ||
        !match.teamB ||
        (match.teamA.id !== teamId && match.teamB.id !== teamId)
      ) {
        return stats;
      }

      const didWin =
        (match.teamA.id === teamId && match.teamAResult > match.teamBResult) ||
        (match.teamB.id === teamId && match.teamBResult > match.teamAResult);

      const wins = stats.wins + (didWin ? 1 : 0);
      const losses = stats.losses + (didWin ? 0 : 1);
      const total = wins + losses;

      return {
        wins,
        losses,
        winRate: total ? Math.round((wins / total) * 100) : null,
      };
    },
    { wins: 0, losses: 0, winRate: null as number | null }
  );
}

function getTeamRegularStats(standings: TeamStanding[], teamId?: number) {
  const standing = standings.find((team) => team.teamId === teamId);
  if (!standing) {
    return { wins: 0, losses: 0, winRate: null };
  }

  const total = standing.matchWins + standing.matchLosses;

  return {
    wins: standing.matchWins,
    losses: standing.matchLosses,
    winRate: total ? Math.round((standing.matchWins / total) * 100) : null,
  };
}

function ChampionCard({
  champion,
  regularStats,
  playoffStats,
  groupCode,
  groupLogo,
}: {
  champion: NonNullable<ReturnType<typeof getMatchWinner>> | null;
  regularStats: ReturnType<typeof getTeamRegularStats>;
  playoffStats: ReturnType<typeof getTeamPlayoffStats>;
  groupCode: string;
  groupLogo: string;
}) {
  return (
    <div id="match-CHAMPION" className="relative w-full">
      <div className="absolute -top-5 left-0 right-0 flex justify-center">
        <div className="rounded-full border border-amber-300/70 bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 shadow-sm dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-200">
          MPL {groupCode} Season 17 Champion
        </div>
      </div>

      <div className="relative z-10 overflow-hidden rounded-md border border-amber-300/70 bg-gradient-to-br from-amber-50 via-card to-card p-4 shadow-lg dark:border-amber-400/40 dark:from-amber-500/15">
        <div className="flex min-h-[150px] items-center justify-center border-b border-amber-200/70 pb-4 dark:border-amber-400/20">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-amber-300/70 bg-white p-4 shadow-inner">
            <img src={groupLogo} alt={`MPL ${groupCode}`} className="h-full w-full object-contain" />
          </div>
        </div>

        <div className="relative flex min-h-[104px] flex-col justify-between gap-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-amber-300/70 bg-white p-2 shadow-sm">
              {champion?.logo ? (
                <img src={champion.logo} alt={champion.name} className="h-full w-full object-contain" />
              ) : champion ? (
                <span className="text-lg font-black text-amber-700 dark:text-amber-200">{champion.name.slice(0, 1)}</span>
              ) : (
                <Trophy className="h-7 w-7 text-amber-500" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-200">Champion</div>
              <div className="truncate text-xl font-black tracking-tight text-foreground">
                {champion?.name ?? "TBD"}
              </div>
            </div>
          </div>

          <ChampionStatsTable
            hasChampion={Boolean(champion)}
            regularStats={regularStats}
            playoffStats={playoffStats}
          />
        </div>
      </div>
    </div>
  );
}

function ChampionStatsTable({
  hasChampion,
  regularStats,
  playoffStats,
}: {
  hasChampion: boolean;
  regularStats: ReturnType<typeof getTeamRegularStats>;
  playoffStats: ReturnType<typeof getTeamPlayoffStats>;
}) {
  const rows = [
    { label: "Regular", stats: regularStats },
    { label: "Playoff", stats: playoffStats },
  ];

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-2 text-xs">
      <div />
      <div className="text-right font-bold uppercase tracking-wider text-muted-foreground">W-L</div>
      <div className="text-right font-bold uppercase tracking-wider text-muted-foreground">Win Rate</div>

      {rows.map((row) => (
        <div key={row.label} className="contents">
          <div className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">{row.label}</div>
          <div className="text-right font-semibold text-foreground">
            {hasChampion ? `${row.stats.wins}-${row.stats.losses}` : "-"}
          </div>
          <div className="text-right font-semibold text-foreground">
            {hasChampion ? `${row.stats.winRate ?? 0}%` : "-"}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchCard({ match, isAdmin, isSignedIn, title, placeholderA = "TBD", placeholderB = "TBD", matchId, featured = false }: { match?: PlayoffMatchWithTeams; isAdmin: boolean, isSignedIn: boolean, title?: string, placeholderA?: string, placeholderB?: string, matchId: string, featured?: boolean }) {
  if (!match) return <div id={`match-${matchId}`} className={cn("rounded border border-dashed bg-muted/20 opacity-50 flex items-center justify-center text-[10px]", featured ? "h-[72px]" : "h-[52px]")}>Match not found</div>;

  const getWinner = () => {
    if (match.teamAResult !== null && match.teamBResult !== null) {
      if (match.teamAResult > match.teamBResult) return 'A';
      if (match.teamBResult > match.teamAResult) return 'B';
    }
    return null;
  };
  const winner = getWinner();
  const dateLabel = formatMatchDate(match.date);

  return (
    <div className="relative w-full" id={`match-${matchId}`} data-featured={featured ? "true" : undefined}>
      {(title || dateLabel) && (
        <div className={cn("absolute left-0 right-0 flex items-center justify-between gap-2 font-semibold text-muted-foreground", featured ? "-top-5 text-[11px]" : "-top-4 text-[10px]")}>
          {title && <span className="tracking-wider uppercase">{title}</span>}
          {dateLabel && <span className="text-muted-foreground/80">{dateLabel}</span>}
        </div>
      )}

      <div className={cn("flex flex-col w-full border bg-card rounded-[3px] shadow-sm relative z-10 overflow-hidden", featured ? "text-sm border-amber-300/70 shadow-md dark:border-amber-400/40" : "text-xs border-border")}>
        {/* Team A */}
        <div className={cn("flex items-center justify-between border-b border-border/60", featured ? "h-9 pl-3 pr-1.5" : "h-[26px] pl-2 pr-1", winner === 'B' ? "opacity-60 bg-muted/30" : winner === 'A' ? "bg-primary/5" : "")}>
          <div className={cn("flex items-center overflow-hidden", featured ? "gap-3" : "gap-2")}>
            {match.teamA ? (
              <>
                {match.teamA.logo ? (
                  <div className={cn("bg-white border border-border/50 rounded-sm flex items-center justify-center p-[2px] shrink-0", featured ? "h-6 w-6" : "h-[18px] w-[18px]")}>
                    <img src={match.teamA.logo} alt={match.teamA.name} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className={cn("bg-muted flex items-center justify-center font-bold shrink-0 rounded-sm border border-border/50", featured ? "h-6 w-6 text-[10px]" : "h-[18px] w-[18px] text-[8px]")}>?</div>
                )}
                <span className={cn("font-medium truncate", featured ? "max-w-[128px]" : "max-w-[92px]", winner === 'A' ? "font-bold text-foreground" : "text-muted-foreground")}>{match.teamA.name}</span>
              </>
            ) : (
              <>
                <div className={cn("bg-muted/20 border border-border/30 flex items-center justify-center font-bold text-muted-foreground shrink-0 rounded-sm", featured ? "h-6 w-6 text-[10px]" : "h-[18px] w-[18px] text-[8px]")}></div>
                <span className={cn("font-medium text-muted-foreground italic truncate", featured ? "max-w-[128px]" : "max-w-[92px]")}>{placeholderA}</span>
              </>
            )}
          </div>
          <div className={cn("font-bold text-center h-full flex items-center justify-center", featured ? "w-8" : "w-6", winner === 'A' ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/30")}>
            {match.teamAResult ?? "-"}
          </div>
        </div>

        {/* Team B */}
        <div className={cn("flex items-center justify-between", featured ? "h-9 pl-3 pr-1.5" : "h-[26px] pl-2 pr-1", winner === 'A' ? "opacity-60 bg-muted/30" : winner === 'B' ? "bg-primary/5" : "")}>
          <div className={cn("flex items-center overflow-hidden", featured ? "gap-3" : "gap-2")}>
            {match.teamB ? (
              <>
                {match.teamB.logo ? (
                  <div className={cn("bg-white border border-border/50 rounded-sm flex items-center justify-center p-[2px] shrink-0", featured ? "h-6 w-6" : "h-[18px] w-[18px]")}>
                    <img src={match.teamB.logo} alt={match.teamB.name} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className={cn("bg-muted flex items-center justify-center font-bold shrink-0 rounded-sm border border-border/50", featured ? "h-6 w-6 text-[10px]" : "h-[18px] w-[18px] text-[8px]")}>?</div>
                )}
                <span className={cn("font-medium truncate", featured ? "max-w-[128px]" : "max-w-[92px]", winner === 'B' ? "font-bold text-foreground" : "text-muted-foreground")}>{match.teamB.name}</span>
              </>
            ) : (
              <>
                <div className={cn("bg-muted/20 border border-border/30 flex items-center justify-center font-bold text-muted-foreground shrink-0 rounded-sm", featured ? "h-6 w-6 text-[10px]" : "h-[18px] w-[18px] text-[8px]")}></div>
                <span className={cn("font-medium text-muted-foreground italic truncate", featured ? "max-w-[128px]" : "max-w-[92px]")}>{placeholderB}</span>
              </>
            )}
          </div>
          <div className={cn("font-bold text-center h-full flex items-center justify-center", featured ? "w-8" : "w-6", winner === 'B' ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/30")}>
            {match.teamBResult ?? "-"}
          </div>
        </div>

        {/* Info / Update Button */}
        <div className={cn("absolute top-1/2 -translate-y-1/2 flex items-center justify-center", featured ? "right-9" : "right-7")}>
          <UpdatePlayoffMatchDialog match={match} isAdmin={isAdmin} isSignedIn={isSignedIn} />
        </div>
      </div>
    </div>
  );
}

function BracketLines() {
  const [lines, setLines] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } }[]>([]);
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: { start: { x: number; y: number }; end: { x: number; y: number } }[] = [];

      const getCoords = (id: string, position: "right" | "left-top" | "left-bottom" | "left-center") => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        // Calculate coords relative to the SVG container
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        
        const rowHeight = el.dataset.featured === "true" ? 36 : 26;
        if (position === "right") return { x: x + rect.width, y: y + rect.height / 2 };
        if (position === "left-top") return { x: x, y: y + rowHeight / 2 };
        if (position === "left-bottom") return { x: x, y: y + rowHeight * 1.5 };
        if (position === "left-center") return { x: x, y: y + rect.height / 2 };
        return null;
      };

      const addLine = (fromId: string, toId: string, toPosition: "left-top" | "left-bottom" | "left-center") => {
        const start = getCoords(`match-${fromId}`, "right");
        const end = getCoords(`match-${toId}`, toPosition);
        if (start && end) {
          newLines.push({ start, end });
        }
      };

      // Connections based on Hybrid bracket format
      addLine("M1", "M3", "left-bottom");
      addLine("M2", "M4", "left-bottom");
      addLine("M3", "M5", "left-top");
      addLine("M4", "M5", "left-bottom");
      addLine("M6", "M7", "left-bottom");
      addLine("M5", "M8", "left-top");
      addLine("M7", "M8", "left-bottom");
      addLine("M8", "CHAMPION", "left-center");

      setLines(newLines);
    };

    // Initial render
    updateLines();
    
    // Setup observer to watch for layout shifts (like font loading or spacing changes)
    const observer = new ResizeObserver(updateLines);
    const container = document.getElementById("bracket-container");
    if (container) observer.observe(container);
    window.addEventListener("resize", updateLines);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, []);

  return (
    <svg className="absolute inset-0 pointer-events-none z-0 overflow-visible w-full h-full" ref={containerRef}>
      {lines.map((l, i) => {
        const midX = l.start.x + 12; // Go out 12px horizontally before turning
        // To make it look perfectly clean: horizontal out, vertical, horizontal in
        return (
          <path
            key={i}
            d={`M ${l.start.x} ${l.start.y} H ${midX} V ${l.end.y} H ${l.end.x}`}
            fill="none"
            className="stroke-black dark:stroke-white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
