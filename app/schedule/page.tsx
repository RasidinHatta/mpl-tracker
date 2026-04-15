import { getMatchSchedule } from "@/actions/matches";
import MatchSchedule from "@/components/match-schedule";
import { CalendarDays } from "lucide-react";

export const metadata = {
  title: "MPL Tracker — Match Schedule",
  description:
    "Track MPL match schedules, results, and predictions week by week.",
};

export default async function SchedulePage() {
  const schedule = await getMatchSchedule();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <CalendarDays size={16} /> Season Schedule
          </h2>
          <h1 className="text-4xl font-bold tracking-tight">Match Schedule</h1>
        </div>
      </div>

      {/* Content */}
      <MatchSchedule schedule={schedule} />
    </div>
  );
}
