"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
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
import { updatePlayoffMatch, type PlayoffMatchWithTeams } from "@/actions/mpl/playoffs";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TeamAvatar } from "./match-schedule";
import Link from "next/link";

function toDateInputValue(date: Date | string | null) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function UpdatePlayoffMatchDialog({ match, isAdmin, isSignedIn = true }: { match: PlayoffMatchWithTeams, isAdmin: boolean, isSignedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [teamAPrediction, setTeamAPrediction] = useState(match.teamAPrediction?.toString() || "");
  const [teamBPrediction, setTeamBPrediction] = useState(match.teamBPrediction?.toString() || "");
  const [teamAResult, setTeamAResult] = useState(match.teamAResult?.toString() || "");
  const [teamBResult, setTeamBResult] = useState(match.teamBResult?.toString() || "");
  const [date, setDate] = useState(toDateInputValue(match.date));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getMaxScore = (format: string) => {
    switch (format) {
      case "BO3": return 2;
      case "BO5": return 3;
      case "BO7": return 4;
      default: return 99;
    }
  };
  const maxScore = getMaxScore(match.format);

  const isMatchCompleted = match.teamAResult !== null && match.teamBResult !== null;

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
    if (!isSignedIn && !isAdmin) {
      toast.error("Please log in first");
      return;
    }
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
      const hasTeams = Boolean(match.teamA && match.teamB);
      await updatePlayoffMatch(match.id, {
        ...(hasTeams && {
          teamAPrediction: teamAPrediction ? parseInt(teamAPrediction) : null,
          teamBPrediction: teamBPrediction ? parseInt(teamBPrediction) : null,
          teamAResult: teamAResult ? parseInt(teamAResult) : null,
          teamBResult: teamBResult ? parseInt(teamBResult) : null,
        }),
        ...(isAdmin && { date: date ? new Date(`${date}T00:00:00`) : null }),
      });
      toast.success("Match updated successfully");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update match");
    } finally {
      setLoading(false);
    }
  };

  // Non-admin users can only predict matches once both teams are known.
  if ((!match.teamA || !match.teamB) && !isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="h-4 w-4 bg-muted border border-border text-muted-foreground hover:bg-muted-foreground hover:text-background rounded-full flex items-center justify-center transition-colors shadow-sm" title="View / Update Match" />
        }
      >
        <Info className="h-2.5 w-2.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update {match.matchId}</DialogTitle>
          <DialogDescription>
            {match.teamA && match.teamB
              ? isSignedIn
                ? `Update prediction and result for ${match.teamA.name} vs ${match.teamB.name}.`
                : `View playoff match details for ${match.teamA.name} vs ${match.teamB.name}.`
              : "Update playoff match details before both teams are known."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-6">
          {/* Teams Header */}
          <div className="flex items-center justify-between px-4 sm:px-8">
            <div className="flex flex-col items-center gap-2">
              {match.teamA ? (
                <>
                  <TeamAvatar name={match.teamA.name} logo={match.teamA.logo} color="left" />
                  <span className="text-sm font-semibold">{match.teamA.name}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">TBD</span>
              )}
            </div>
            <span className="text-muted-foreground font-medium text-sm">VS</span>
            <div className="flex flex-col items-center gap-2">
              {match.teamB ? (
                <>
                  <TeamAvatar name={match.teamB.name} logo={match.teamB.logo} color="right" />
                  <span className="text-sm font-semibold">{match.teamB.name}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">TBD</span>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="px-4 sm:px-8">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                Match date
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          )}

          {/* Prediction Row */}
          {isSignedIn && match.teamA && match.teamB && (
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
          )}

          {!isSignedIn && match.teamA && match.teamB && (
            <div className="mx-4 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground sm:mx-8">
              Please log in to make playoff predictions.
            </div>
          )}

          {/* Result Row */}
          {isAdmin && match.teamA && match.teamB && (
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
        {isSignedIn || isAdmin ? (
          <DialogFooter>
            <Button type="submit" disabled={loading} onClick={handleSave}>
              Save changes
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Link href="/sign-in" className={buttonVariants()}>
              Log in
            </Link>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
