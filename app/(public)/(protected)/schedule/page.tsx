import { getMatchSchedule } from "@/actions/matches";
import MatchSchedule from "@/components/match-schedule";
import { CalendarDays, Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "MPL Tracker — Match Schedule",
  description:
    "Track MPL match schedules, results, and predictions week by week.",
};

export default async function SchedulePage() {
  const schedule = await getMatchSchedule();

  // Calculate stats
  const totalMatches = schedule.reduce((acc, week) => acc + week.matches.length, 0);
  const completedMatches = schedule.reduce(
    (acc, week) => {
      return acc + week.matches.filter((m) => {
        if (m.teamAResult !== null && m.teamBResult !== null) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const matchDate = new Date(m.date);
        matchDate.setHours(0, 0, 0, 0);
        return today > matchDate;
      }).length;
    },
    0
  );

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 pt-2 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-6 py-6 border-b border-border/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-medium">Season Schedule</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Match Schedule</h1>
            <p className="text-muted-foreground max-w-lg">
              Track all MPL matches, view results, and check predictions for the current season.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm font-semibold">{completedMatches} / {totalMatches}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/10">
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Weeks</p>
                <p className="text-sm font-semibold">{schedule.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <MatchSchedule schedule={schedule} />
    </div>
  );
}