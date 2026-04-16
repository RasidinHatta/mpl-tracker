"use client";

import { useState } from "react";
import { TeamAvatar } from "@/components/match-schedule";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Team = { id: number; name: string; logo: string | null };
type Match = { teamAId: number; teamBId: number; teamAResult: number | null; teamBResult: number | null };

export function HistoryMatrix({ teams, matches }: { teams: Team[]; matches: Match[] }) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
      <ScrollArea className="w-full max-w-full overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 border-b border-r bg-background/95 backdrop-blur-sm sticky left-0 top-0 z-30 min-w-[60px]"></th>
              {teams.map((team) => (
                <th 
                  key={team.id} 
                  className={`p-2 border-b border-r min-w-[80px] transition-colors ${hoveredCol === team.id ? "bg-primary/20 dark:bg-primary/30" : "bg-muted/20"}`}
                  onMouseEnter={() => setHoveredCol(team.id)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <div className="flex justify-center">
                    <TeamAvatar name={team.name} logo={team.logo} color="right" size="small" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null); }}>
            {teams.map((rowTeam) => (
              <tr 
                key={rowTeam.id}
              >
                <td 
                  className={`p-2 border-b border-r backdrop-blur-sm sticky left-0 z-10 w-[60px] transition-colors ${hoveredRow === rowTeam.id ? "bg-primary/20 dark:bg-primary/30" : "bg-background/95"}`}
                  onMouseEnter={() => setHoveredRow(rowTeam.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="flex justify-center">
                    <TeamAvatar name={rowTeam.name} logo={rowTeam.logo} color="left" size="small" />
                  </div>
                </td>
                {teams.map((colTeam) => {
                  const isSelf = rowTeam.id === colTeam.id;

                  const matchInstances = matches.filter(
                    (m) =>
                      (m.teamAId === rowTeam.id && m.teamBId === colTeam.id) ||
                      (m.teamAId === colTeam.id && m.teamBId === rowTeam.id)
                  );

                  let totalRowGames = 0;
                  let totalColGames = 0;
                  const results = matchInstances.map((m) => {
                    if (m.teamAId === rowTeam.id) {
                      totalRowGames += m.teamAResult!;
                      totalColGames += m.teamBResult!;
                      return `${m.teamAResult}-${m.teamBResult}`;
                    } else {
                      totalRowGames += m.teamBResult!;
                      totalColGames += m.teamAResult!;
                      return `${m.teamBResult}-${m.teamAResult}`;
                    }
                  });

                  const leg1 = results[0] || "-";
                  const leg2 = results[1] || "-";
                  const subtitle = `${leg1}, ${leg2}`;
                  const bigText = isSelf ? "" : matchInstances.length === 0 ? "0-0" : `${totalRowGames}-${totalColGames}`;

                  let bgClass = "bg-transparent";
                  if (isSelf) {
                    bgClass = "bg-muted/5";
                  } else if (matchInstances.length === 0) {
                    bgClass = "bg-background";
                  } else if (matchInstances.length > 0) {
                    if (totalRowGames > totalColGames) {
                      bgClass = "bg-green-500/20 dark:bg-green-500/30"; // Vivid dark green
                    } else if (totalRowGames < totalColGames) {
                      bgClass = "bg-red-500/20 dark:bg-red-500/30"; // Vivid dark red
                    }
                  }

                  const isHovered = hoveredRow === rowTeam.id || hoveredCol === colTeam.id;
                  const isIntersection = hoveredRow === rowTeam.id && hoveredCol === colTeam.id;
                  
                  return (
                    <td
                      key={colTeam.id}
                      className={`relative p-1.5 border-b border-r text-center transition-colors cursor-default ${bgClass}`}
                      onMouseEnter={() => {
                        setHoveredRow(rowTeam.id);
                        setHoveredCol(colTeam.id);
                      }}
                    >
                      {/* Highlight Overlay */}
                      <div className={`absolute inset-0 pointer-events-none transition-all duration-200 ${isIntersection && !isSelf ? "bg-white/30 dark:bg-white/20 ring-2 ring-inset ring-primary z-20" : isHovered && !isSelf ? "bg-white/20 dark:bg-white/10" : "opacity-0"}`} />
                      
                      <div className="relative z-0">
                        {!isSelf && (
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <span className={`text-base font-black tabular-nums tracking-tight ${isHovered ? "text-foreground" : "text-foreground/90"}`}>
                              {bigText}
                            </span>
                            <span className={`text-[10px] tabular-nums tracking-widest ${isHovered ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                              {subtitle}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-2 border-r bg-background/95 backdrop-blur-sm sticky left-0 z-10 w-[60px]"></td>
              {teams.map((team) => (
                <td 
                  key={team.id} 
                  className={`p-2 border-r min-w-[80px] transition-colors ${hoveredCol === team.id ? "bg-primary/20 dark:bg-primary/30" : "bg-muted/20"}`}
                  onMouseEnter={() => setHoveredCol(team.id)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <div className="flex justify-center">
                    <TeamAvatar name={team.name} logo={team.logo} color="right" size="small" />
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
