"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMatch, type MatchWithTeams } from "@/actions/mpl/matches";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TeamAvatar } from "./match-schedule";
import { useSession } from "@/lib/auth.client";
import { UserRole } from "@/lib/generated/prisma/enums";

export function UpdateMatchDialog({ match }: { match: MatchWithTeams }) {
  const [open, setOpen] = useState(false);
  const [teamAPrediction, setTeamAPrediction] = useState(match.teamAPrediction?.toString() || "");
  const [teamBPrediction, setTeamBPrediction] = useState(match.teamBPrediction?.toString() || "");
  const [teamAResult, setTeamAResult] = useState(match.teamAResult?.toString() || "");
  const [teamBResult, setTeamBResult] = useState(match.teamBResult?.toString() || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  const getMaxScore = (format: string) => {
    switch (format) {
      case "BO3": return 2;
      case "BO5": return 3;
      case "BO7": return 4;
      default: return 99;
    }
  };
  const maxScore = getMaxScore(match.format);

  const isMatchCompleted = match.teamAResult !== null && match.teamBResult !== null || (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return today > matchDate;
  })();

  const isValidScore = (a: string, b: string) => {
    if (!a && !b) return true; // both empty = clearing, allow
    if (!a || !b) return true; // partial, allow (server handles nulls)
    const scoreA = parseInt(a);
    const scoreB = parseInt(b);
    if (isNaN(scoreA) || isNaN(scoreB)) return false;
    // One team must reach maxScore, the other must be strictly less
    const winner = Math.max(scoreA, scoreB);
    const loser = Math.min(scoreA, scoreB);
    return winner === maxScore && loser < maxScore;
  };

  const handleSave = async () => {
    if (isAdmin && (teamAResult || teamBResult) && !isValidScore(teamAResult, teamBResult)) {
      toast.error(`Invalid result: for ${match.format}, one team must reach ${maxScore} and the other must have fewer wins.`);
      return;
    }
    if ((teamAPrediction || teamBPrediction) && !isValidScore(teamAPrediction, teamBPrediction)) {
      toast.error(`Invalid prediction: for ${match.format}, one team must reach ${maxScore} and the other must have fewer wins.`);
      return;
    }
    try {
      setLoading(true);
      await updateMatch(match.id, {
        teamAPrediction: teamAPrediction ? parseInt(teamAPrediction) : null,
        teamBPrediction: teamBPrediction ? parseInt(teamBPrediction) : null,
        teamAResult: teamAResult ? parseInt(teamAResult) : null,
        teamBResult: teamBResult ? parseInt(teamBResult) : null,
      });
      toast.success("Match updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground" />
        }
      >
        View Details / Update
        <ChevronRight className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Match Details</DialogTitle>
          <DialogDescription>
            Update prediction and result for {match.teamA.name} vs {match.teamB.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-6">
          {/* Teams Header */}
          <div className="flex items-center justify-between px-4 sm:px-8">
            <div className="flex flex-col items-center gap-2">
              <TeamAvatar name={match.teamA.name} logo={match.teamA.logo} color="left" />
              <span className="text-sm font-semibold">{match.teamA.name}</span>
            </div>
            <span className="text-muted-foreground font-medium text-sm">VS</span>
            <div className="flex flex-col items-center gap-2">
              <TeamAvatar name={match.teamB.name} logo={match.teamB.logo} color="right" />
              <span className="text-sm font-semibold">{match.teamB.name}</span>
            </div>
          </div>

          {/* Prediction Row */}
          <div className="flex items-center justify-between gap-2 px-4 sm:px-8 mt-4">
            <div className="flex flex-1 items-center justify-center">
              <Input
                type="number"
                min="0"
                max={maxScore}
                className="w-20 text-center text-lg font-bold"
                value={teamAPrediction}
                disabled={isMatchCompleted}
                onChange={(e) => setTeamAPrediction(e.target.value)}
              />
            </div>

            <div className="flex w-28 flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Prediction</span>
              <span className="text-lg font-medium text-muted-foreground/50">-</span>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <Input
                type="number"
                min="0"
                max={maxScore}
                className="w-20 text-center text-lg font-bold"
                value={teamBPrediction}
                disabled={isMatchCompleted}
                onChange={(e) => setTeamBPrediction(e.target.value)}
              />
            </div>
          </div>

          {/* Result Row */}
          {isAdmin && (
            <div className="flex items-center justify-between gap-2 px-4 sm:px-8">
              <div className="flex flex-1 items-center justify-center">
                <Input
                  type="number"
                  min="0"
                  max={maxScore}
                  className="w-20 text-center text-lg font-bold"
                  value={teamAResult}
                  onChange={(e) => setTeamAResult(e.target.value)}
                />
              </div>

              <div className="flex w-28 flex-col items-center justify-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Result</span>
                <span className="text-lg font-medium text-muted-foreground/50">-</span>
              </div>

              <div className="flex flex-1 items-center justify-center">
                <Input
                  type="number"
                  min="0"
                  max={maxScore}
                  className="w-20 text-center text-lg font-bold"
                  value={teamBResult}
                  onChange={(e) => setTeamBResult(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading} onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
