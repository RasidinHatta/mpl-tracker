/* eslint-disable @next/next/no-img-element */
"use client";

import { PlayoffMatchWithTeams } from "@/actions/mpl/playoffs";
import { UpdatePlayoffMatchDialog } from "./update-playoff-match-dialog";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

type Props = {
  matches: PlayoffMatchWithTeams[];
  isAdmin: boolean;
};

export function PlayoffBracket({ matches, isAdmin }: Props) {
  const getMatch = (id: string) => matches.find((m) => m.matchId === id);

  const ubq1 = getMatch("UBQ1");
  const ubq2 = getMatch("UBQ2");
  const ubs1 = getMatch("UBS1");
  const ubs2 = getMatch("UBS2");
  const ubf = getMatch("UBF");
  const lbsf = getMatch("LBSF");
  const lbf = getMatch("LBF");
  const gf = getMatch("GF");

  return (
    <div className="overflow-x-auto pb-12 w-full">
      <div className="min-w-[1000px] flex gap-6 select-none p-4 relative" id="bracket-container">
        <BracketLines />
        {/* Column 1: UB Quarterfinals */}
        <div className="flex flex-col gap-8 w-64 shrink-0">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">UB Quarterfinals</div>
          <MatchCard match={ubq1} isAdmin={isAdmin} title="M1" placeholderA="Seed 3" placeholderB="Seed 6" matchId="M1" />
          <div className="h-[90px]" /> {/* Spacer */}
          <MatchCard match={ubq2} isAdmin={isAdmin} title="M2" placeholderA="Seed 4" placeholderB="Seed 5" matchId="M2" />
        </div>

        {/* Column 2: UB Semifinals & LB Semifinal */}
        <div className="flex flex-col gap-8 w-64 shrink-0">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">UB Semifinals</div>
          <div className="mt-8">
            <MatchCard match={ubs1} isAdmin={isAdmin} title="M3" placeholderA="Seed 1" placeholderB="Winner M1" matchId="M3" />
          </div>
          <div className="h-8" />
          <MatchCard match={ubs2} isAdmin={isAdmin} title="M4" placeholderA="Seed 2" placeholderB="Winner M2" matchId="M4" />
          
          <div className="mt-10 text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">LB Semifinal</div>
          <MatchCard match={lbsf} isAdmin={isAdmin} title="M6" placeholderA="Loser M3" placeholderB="Loser M4" matchId="M6" />
        </div>

        {/* Column 3: UB Final & LB Final */}
        <div className="flex flex-col gap-8 w-64 shrink-0">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">UB Final</div>
          <div className="mt-28">
            <MatchCard match={ubf} isAdmin={isAdmin} title="M5" placeholderA="Winner M3" placeholderB="Winner M4" matchId="M5" />
          </div>
          
          <div className="mt-[136px] text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">LB Final</div>
          <MatchCard match={lbf} isAdmin={isAdmin} title="M7" placeholderA="Loser M5" placeholderB="Winner M6" matchId="M7" />
        </div>

        {/* Column 4: Grand Final */}
        <div className="flex flex-col gap-8 w-64 shrink-0">
          <div className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 h-4">Grand Final</div>
          <div className="mt-[210px]">
            <MatchCard match={gf} isAdmin={isAdmin} title="M8" placeholderA="Winner M5" placeholderB="Winner M7" matchId="M8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, isAdmin, title, placeholderA = "TBD", placeholderB = "TBD", matchId }: { match?: PlayoffMatchWithTeams; isAdmin: boolean, title?: string, placeholderA?: string, placeholderB?: string, matchId: string }) {
  if (!match) return <div id={`match-${matchId}`} className="h-[52px] rounded border border-dashed bg-muted/20 opacity-50 flex items-center justify-center text-[10px]">Match not found</div>;

  const getWinner = () => {
    if (match.teamAResult !== null && match.teamBResult !== null) {
      if (match.teamAResult > match.teamBResult) return 'A';
      if (match.teamBResult > match.teamAResult) return 'B';
    }
    return null;
  };
  const winner = getWinner();

  return (
    <div className="relative w-full" id={`match-${matchId}`}>
      {title && (
        <div className="absolute -top-4 left-0 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
          {title}
        </div>
      )}

      <div className="flex flex-col w-full text-xs border border-border bg-card rounded-[3px] shadow-sm relative z-10 overflow-hidden">
        {/* Team A */}
        <div className={cn("flex items-center justify-between pl-2 pr-1 h-[26px] border-b border-border/60", winner === 'B' ? "opacity-60 bg-muted/30" : winner === 'A' ? "bg-primary/5" : "")}>
          <div className="flex items-center gap-2 overflow-hidden">
            {match.teamA ? (
              <>
                {match.teamA.logo ? (
                  <div className="h-[18px] w-[18px] bg-white border border-border/50 rounded-sm flex items-center justify-center p-[2px] shrink-0">
                    <img src={match.teamA.logo} alt={match.teamA.name} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="h-[18px] w-[18px] bg-muted text-[8px] flex items-center justify-center font-bold shrink-0 rounded-sm border border-border/50">?</div>
                )}
                <span className={cn("font-medium truncate max-w-[120px]", winner === 'A' ? "font-bold text-foreground" : "text-muted-foreground")}>{match.teamA.name}</span>
              </>
            ) : (
              <>
                <div className="h-[18px] w-[18px] bg-muted/20 border border-border/30 text-[8px] flex items-center justify-center font-bold text-muted-foreground shrink-0 rounded-sm"></div>
                <span className="font-medium text-muted-foreground italic truncate max-w-[120px]">{placeholderA}</span>
              </>
            )}
          </div>
          <div className={cn("font-bold w-6 text-center h-full flex items-center justify-center", winner === 'A' ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/30")}>
            {match.teamAResult ?? "-"}
          </div>
        </div>

        {/* Team B */}
        <div className={cn("flex items-center justify-between pl-2 pr-1 h-[26px]", winner === 'A' ? "opacity-60 bg-muted/30" : winner === 'B' ? "bg-primary/5" : "")}>
          <div className="flex items-center gap-2 overflow-hidden">
            {match.teamB ? (
              <>
                {match.teamB.logo ? (
                  <div className="h-[18px] w-[18px] bg-white border border-border/50 rounded-sm flex items-center justify-center p-[2px] shrink-0">
                    <img src={match.teamB.logo} alt={match.teamB.name} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="h-[18px] w-[18px] bg-muted text-[8px] flex items-center justify-center font-bold shrink-0 rounded-sm border border-border/50">?</div>
                )}
                <span className={cn("font-medium truncate max-w-[120px]", winner === 'B' ? "font-bold text-foreground" : "text-muted-foreground")}>{match.teamB.name}</span>
              </>
            ) : (
              <>
                <div className="h-[18px] w-[18px] bg-muted/20 border border-border/30 text-[8px] flex items-center justify-center font-bold text-muted-foreground shrink-0 rounded-sm"></div>
                <span className="font-medium text-muted-foreground italic truncate max-w-[120px]">{placeholderB}</span>
              </>
            )}
          </div>
          <div className={cn("font-bold w-6 text-center h-full flex items-center justify-center", winner === 'B' ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/30")}>
            {match.teamBResult ?? "-"}
          </div>
        </div>

        {/* Info / Update Button */}
        <div className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <UpdatePlayoffMatchDialog match={match} isAdmin={isAdmin} />
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

      const getCoords = (id: string, position: "right" | "left-top" | "left-bottom") => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        // Calculate coords relative to the SVG container
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        
        // Use exact pixel offsets from the card's dimensions (height: 52px, text-box: 26px each)
        // Adjust for the 2px border wrapper if necessary, but 26px and 13px are very accurate for center points.
        if (position === "right") return { x: x + rect.width, y: y + 26 };
        if (position === "left-top") return { x: x, y: y + 13 };
        if (position === "left-bottom") return { x: x, y: y + 39 };
        return null;
      };

      const addLine = (fromId: string, toId: string, toPosition: "left-top" | "left-bottom") => {
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
