import { getMatchSchedule } from "@/app/actions/matches";
import MatchSchedule from "@/components/match-schedule";

export const metadata = {
  title: "MPL Tracker — Match Schedule",
  description:
    "Track MPL match schedules, results, and predictions week by week.",
};

export default async function Home() {
  const schedule = await getMatchSchedule();

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-blue-600 shadow-sm">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">
                MPL Tracker
              </h1>
              <p className="text-[11px] leading-none text-muted-foreground">
                Season Schedule
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Match Schedule
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the weekly match schedule, track results, and view
            predictions.
          </p>
        </div>

        <MatchSchedule schedule={schedule} />
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-center px-4 text-xs text-muted-foreground sm:px-6">
          MPL Tracker &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
