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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchGroup } from "@/lib/generated/prisma/enums";
import { Trophy, X } from "lucide-react";
import { initializePlayoffBracket } from "@/actions/mpl/playoffs";
import { TeamStanding } from "@/actions/mpl/standings";
import { TeamAvatar } from "./match-schedule";

type SetupPlayoffDialogProps = {
  group: MatchGroup;
  teams: { id: number; name: string; logo: string | null }[];
  standings: TeamStanding[];
  isInitialized: boolean;
};

export function SetupPlayoffDialog({ group, teams, standings, isInitialized }: SetupPlayoffDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeds, setSeeds] = useState({
    seed1: "", // Team 1 (Rank 1) -> Upper Bracket Semi
    seed2: "", // Team 2 (Rank 2) -> Upper Bracket Semi
    seed3: "", // Team 3 (Rank 3) -> Lower Bracket Play-in
    seed4: "", // Team 4 (Rank 4) -> Lower Bracket Play-in
    seed5: "", // Team 5 (Rank 5) -> Lower Bracket Play-in
    seed6: "", // Team 6 (Rank 6) -> Lower Bracket Play-in
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      await initializePlayoffBracket(group, {
        seed1: Number(seeds.seed1), // Rank 1 -> Upper Bracket Semi
        seed2: Number(seeds.seed2), // Rank 2 -> Upper Bracket Semi
        seed3: Number(seeds.seed3), // Rank 3 -> Lower Bracket Play-in
        seed4: Number(seeds.seed4), // Rank 4 -> Lower Bracket Play-in
        seed5: Number(seeds.seed5), // Rank 5 -> Lower Bracket Play-in
        seed6: Number(seeds.seed6), // Rank 6 -> Lower Bracket Play-in
      });
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(seeds).every((v) => v !== "");

  // All 6 qualified teams from standings
  const allQualifiedTeams = standings.slice(0, 6).map(s => teams.find(t => t.id === s.teamId)).filter(Boolean) as typeof teams;
  const top2Teams = allQualifiedTeams.slice(0, 2);
  const lowerBracketTeams = allQualifiedTeams.slice(2, 6);

  const upperSelectedIds = [seeds.seed1, seeds.seed2].filter(Boolean);
  const lowerSelectedIds = [seeds.seed3, seeds.seed4, seeds.seed5, seeds.seed6].filter(Boolean);

  function TeamSelector({
    seedKey,
    availableTeams,
    selectedIds,
  }: {
    seedKey: keyof typeof seeds;
    availableTeams: typeof teams;
    selectedIds: string[];
  }) {
    const currentVal = seeds[seedKey];
    const selectedTeam = availableTeams.find(t => t.id.toString() === currentVal);
    return (
      <div className="col-span-3 flex items-center gap-2">
        <Select
          value={currentVal}
          onValueChange={(val) => setSeeds({ ...seeds, [seedKey]: val })}
        >
          <SelectTrigger className="w-full h-12 bg-transparent border-input">
            <SelectValue placeholder="Select team">
              {selectedTeam ? (
                <div className="flex items-center gap-2">
                  <TeamAvatar name={selectedTeam.name} logo={selectedTeam.logo} color="left" size="small" />
                  <span>{selectedTeam.name}</span>
                </div>
              ) : "Select team"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableTeams
              .filter(t => !selectedIds.includes(t.id.toString()) || t.id.toString() === currentVal)
              .map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  <div className="flex items-center gap-2">
                    <TeamAvatar name={t.name} logo={t.logo} color="left" size="small" />
                    {t.name}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {currentVal && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground shrink-0 rounded-full"
            onClick={() => setSeeds({ ...seeds, [seedKey]: "" })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={isInitialized ? "outline" : "default"}>
            <Trophy className="mr-2 h-4 w-4" />
            {isInitialized ? "Reset Bracket" : "Initialize Bracket"}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Setup Playoff Bracket</DialogTitle>
          <DialogDescription>
            Select the 6 qualified teams in ranking order. Team 1 &amp; 2 skip directly to the Upper Bracket Semifinals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">

          {/* Upper Bracket — Team 1 & 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b pb-1 text-muted-foreground">Upper Bracket (Top 2)</h4>
            {([1, 2] as const).map((num) => {
              const seedKey = `seed${num}` as keyof typeof seeds;
              return (
                <div key={num} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={seedKey} className="text-right">Team {num}</Label>
                  <TeamSelector
                    seedKey={seedKey}
                    availableTeams={top2Teams}
                    selectedIds={upperSelectedIds}
                  />
                </div>
              );
            })}
          </div>

          {/* Lower Bracket — Team 3–6 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b pb-1 text-muted-foreground">Lower Bracket (Play-ins)</h4>
            {([3, 4, 5, 6] as const).map((num) => {
              const seedKey = `seed${num}` as keyof typeof seeds;
              return (
                <div key={num} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={seedKey} className="text-right">Team {num}</Label>
                  <TeamSelector
                    seedKey={seedKey}
                    availableTeams={lowerBracketTeams}
                    selectedIds={lowerSelectedIds}
                  />
                </div>
              );
            })}
          </div>

        </div>
        <DialogFooter>
          <Button disabled={!isFormValid || loading} onClick={onSubmit}>
            {loading ? "Saving..." : "Save Bracket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
