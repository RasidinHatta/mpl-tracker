import { Trophy } from "lucide-react";

export const metadata = {
  title: "MPL Tracker — Standings",
  description: "View current MPL team standings and rankings.",
};

export default async function StandingPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <Trophy size={16} /> Season Rankings
          </h2>
          <h1 className="text-4xl font-bold tracking-tight">Standings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="text-muted-foreground text-sm">
        Standings coming soon.
      </div>
    </div>
  );
}