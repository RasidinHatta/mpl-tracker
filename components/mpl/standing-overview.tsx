"use client";

import React, { useMemo, useState } from "react";
import type { StandingsHistoryResult } from "@/actions/mpl/standings";
import type { TeamStanding } from "@/actions/mpl/standings";
import { TeamAvatar } from "@/components/mpl/match-schedule";

export function StandingOverview({ historyData, standings }: { historyData: StandingsHistoryResult, standings: TeamStanding[] }) {
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);

  const { history, currentWeek, totalWeeks } = historyData;
  const numTeams = standings.length;

  if (totalWeeks === 0 || numTeams === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        No standing history available yet.
      </div>
    );
  }

  // Configuration for layout
  const rowHeight = 60;
  const colWidth = 100;
  const paddingLeft = 60; // For rank labels
  const paddingRight = 200; // For team names
  const paddingTop = 40; // For week labels
  const paddingBottom = 20;

  const width = paddingLeft + (totalWeeks > 1 ? (totalWeeks - 1) * colWidth : 0) + paddingRight;
  const height = paddingTop + (numTeams > 1 ? (numTeams - 1) * rowHeight : 0) + paddingBottom;

  // Track each team's path
  const teamPaths = useMemo(() => {
    const paths: Record<number, { x: number, y: number, week: number, rank: number }[]> = {};

    standings.forEach(t => {
      paths[t.teamId] = [];
    });

    history.forEach((h, weekIdx) => {
      h.standings.forEach(s => {
        if (paths[s.teamId]) {
          paths[s.teamId].push({
            week: h.week,
            rank: s.rank,
            x: paddingLeft + weekIdx * colWidth,
            y: paddingTop + (s.rank - 1) * rowHeight
          });
        }
      });
    });

    return paths;
  }, [history, standings]);

  const teamColors = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
    "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
    "#f43f5e", "#14b8a6", "#eab308", "#10b981", "#64748b"
  ];

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden pb-4 relative">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[20px_20px] mask-[radial-gradient(ellipse_90%_90%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none opacity-30" />

      <div className="relative mx-auto" style={{ width, height, minWidth: "max-content" }}>
        {/* SVG for lines */}
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {standings.map((team, idx) => {
            const pathData = teamPaths[team.teamId];
            if (!pathData || pathData.length < 2) return null;

            let d = `M ${pathData[0].x} ${pathData[0].y}`;
            for (let i = 1; i < pathData.length; i++) {
              const p1 = pathData[i - 1];
              const p2 = pathData[i];
              const offset = colWidth / 3;
              // Straight horizontal, then diagonal, then straight horizontal
              d += ` L ${p1.x + offset} ${p1.y} L ${p2.x - offset} ${p2.y} L ${p2.x} ${p2.y}`;
            }

            const color = team.color || teamColors[idx % teamColors.length];
            const isHovered = hoveredTeam === team.teamId;
            const isOtherHovered = hoveredTeam !== null && hoveredTeam !== team.teamId;

            return (
              <g
                key={team.teamId}
                onMouseEnter={() => setHoveredTeam(team.teamId)}
                onMouseLeave={() => setHoveredTeam(null)}
                className={`transition-opacity duration-300 pointer-events-auto cursor-pointer ${isOtherHovered ? 'opacity-10' : 'opacity-100'}`}
              >
                {/* Invisible thicker path to increase hover area */}
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                />
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth="4"
                  filter="url(#neon-glow)"
                  className={`transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? "3" : "2"}
                  className={`transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-80'}`}
                />
              </g>
            );
          })}
        </svg>

        {/* HTML overlay for labels and avatars */}
        {/* Week Headers */}
        {Array.from({ length: totalWeeks }).map((_, i) => {
          const w = i + 1;
          const isFuture = w > currentWeek;
          return (
            <div
              key={w}
              className={`absolute text-[10px] font-black uppercase tracking-[0.2em] -translate-x-1/2 -translate-y-full ${isFuture ? 'text-muted-foreground/30' : 'text-muted-foreground/70'}`}
              style={{ left: paddingLeft + i * colWidth, top: paddingTop - 15 }}
            >
              Week {w}
            </div>
          );
        })}

        {/* Rank Labels (Left Side) */}
        {Array.from({ length: numTeams }).map((_, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center font-black text-sm bg-background border border-border/40 text-foreground/80 rounded shadow-[0_0_10px_rgba(0,0,0,0.5)] w-7 h-7 -translate-x-full -translate-y-1/2"
            style={{ left: paddingLeft - 20, top: paddingTop + i * rowHeight }}
          >
            {i + 1}
          </div>
        ))}

        {/* Nodes and Team Names (Right Side) */}
        {standings.map((team, idx) => {
          const pathData = teamPaths[team.teamId];
          if (!pathData) return null;
          const color = team.color || teamColors[idx % teamColors.length];
          const isHovered = hoveredTeam === team.teamId;
          const isOtherHovered = hoveredTeam !== null && hoveredTeam !== team.teamId;

          return (
            <React.Fragment key={team.teamId}>
              {pathData.map((pt, i) => {
                const isLast = i === pathData.length - 1;

                if (isLast) {
                  return (
                    <div
                      key={`${team.teamId}-${pt.week}-logo`}
                      onMouseEnter={() => setHoveredTeam(team.teamId)}
                      onMouseLeave={() => setHoveredTeam(null)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto transition-all duration-300 ${isHovered ? 'z-40 scale-125' : 'z-20 scale-100'} ${isOtherHovered ? 'opacity-10' : 'opacity-100'}`}
                      style={{ left: pt.x, top: pt.y }}
                      title={`${team.teamName} - Week ${pt.week} (Rank ${pt.rank})`}
                    >
                      <div className="w-7 h-7 flex items-center justify-center bg-white rounded-[6px] shadow-[0_0_8px_rgba(255,255,255,0.4)] overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center scale-[1.35]">
                          <TeamAvatar name={team.teamName} logo={team.logo} color="left" size="small" />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${team.teamId}-${pt.week}`}
                    onMouseEnter={() => setHoveredTeam(team.teamId)}
                    onMouseLeave={() => setHoveredTeam(null)}
                    className={`absolute w-7 h-7 rounded-none -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer pointer-events-auto ${isHovered ? 'z-30 scale-150' : 'z-10 scale-100'} ${isOtherHovered ? 'opacity-10' : 'opacity-100'}`}
                    style={{
                      left: pt.x,
                      top: pt.y,
                      backgroundColor: color,
                      boxShadow: isHovered ? `0 0 12px ${color}` : 'none'
                    }}
                    title={`${team.teamName} - Week ${pt.week} (Rank ${pt.rank})`}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
