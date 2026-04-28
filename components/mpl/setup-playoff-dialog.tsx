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
    seed1: "",
    seed2: "",
    seed3: "",
    seed4: "",
    seed5: "",
    seed6: "",
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      await initializePlayoffBracket(group, {
        seed1: Number(seeds.seed5), // Top 1 -> Upper Bracket Semi
        seed2: Number(seeds.seed6), // Top 2 -> Upper Bracket Semi
        seed3: Number(seeds.seed1), // Lower bracket 1 (Rank 3)
        seed4: Number(seeds.seed2), // Lower bracket 2 (Rank 4)
        seed5: Number(seeds.seed3), // Lower bracket 3 (Rank 5)
        seed6: Number(seeds.seed4), // Lower bracket 4 (Rank 6)
      });
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(seeds).every((v) => v !== "");

  // Options limited to qualified teams
  const top2Teams = standings.slice(0, 2).map(s => teams.find(t => t.id === s.teamId)).filter(Boolean) as typeof teams;
  const lowerBracketTeams = standings.slice(2, 6).map(s => teams.find(t => t.id === s.teamId)).filter(Boolean) as typeof teams;

  const lowerSelectedIds = [seeds.seed1, seeds.seed2, seeds.seed3, seeds.seed4].filter(Boolean);
  const upperSelectedIds = [seeds.seed5, seeds.seed6].filter(Boolean);

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
            Select the 6 teams that qualified. The Top 2 teams skip directly to the Upper Bracket Semifinals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          
          {/* Lower Bracket Selector */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b pb-1 text-muted-foreground">Lower Bracket (Play-ins)</h4>
            {[1, 2, 3, 4].map((seed) => {
              const currentVal = seeds[`seed${seed}` as keyof typeof seeds];
              const selectedTeam = lowerBracketTeams.find(t => t.id.toString() === currentVal);
              return (
              <div key={seed} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`seed${seed}`} className="text-right">
                  Seed {seed}
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Select
                    value={currentVal}
                    onValueChange={(val) => setSeeds({ ...seeds, [`seed${seed}`]: val })}
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
                      {lowerBracketTeams
                        .filter(t => !lowerSelectedIds.includes(t.id.toString()) || t.id.toString() === currentVal)
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
                      onClick={() => setSeeds({ ...seeds, [`seed${seed}`]: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )})}
          </div>

          {/* Upper Bracket Selector */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b pb-1 text-muted-foreground">Upper Bracket (Top 2)</h4>
            {[5, 6].map((seed) => {
              const currentVal = seeds[`seed${seed}` as keyof typeof seeds];
              const selectedTeam = top2Teams.find(t => t.id.toString() === currentVal);
              return (
              <div key={seed} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`seed${seed}`} className="text-right">
                  Seed {seed}
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Select
                    value={currentVal}
                    onValueChange={(val) => setSeeds({ ...seeds, [`seed${seed}`]: val })}
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
                      {top2Teams
                        .filter(t => !upperSelectedIds.includes(t.id.toString()) || t.id.toString() === currentVal)
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
                      onClick={() => setSeeds({ ...seeds, [`seed${seed}`]: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )})}
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
