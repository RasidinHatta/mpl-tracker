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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createMatch } from "@/actions/matches";
import { MatchFormat, MatchGroup } from "@/lib/generated/prisma/enums";
import { TeamAvatar } from "@/components/match-schedule";

type TeamType = {
  id: number;
  name: string;
  logo: string | null;
};

export function AddMatchDialog({ teams, group }: { teams: TeamType[], group: MatchGroup }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [week, setWeek] = useState("1");
  const [day, setDay] = useState("1");
  const [matchNo, setMatchNo] = useState("1");
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [format, setFormat] = useState<MatchFormat>(MatchFormat.BO3);

  const handleSave = async () => {
    if (!date || !time || !week || !day || !matchNo || !teamAId || !teamBId || !format) {
      toast.error("Please fill all fields");
      return;
    }
    if (teamAId === teamBId) {
      toast.error("Teams must be different");
      return;
    }

    try {
      setLoading(true);
      // Construct date string
      const dateTime = new Date(`${date}T${time}`);
      
      await createMatch({
        week: parseInt(week),
        day: parseInt(day),
        date: dateTime,
        matchNo: parseInt(matchNo),
        teamAId: parseInt(teamAId),
        teamBId: parseInt(teamBId),
        format,
        group
      });
      
      toast.success("Match added successfully");
      setOpen(false);
      router.refresh();
      
      // Reset form
      setDate("");
      setTime("");
      setTeamAId("");
      setTeamBId("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Match
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Match</DialogTitle>
          <DialogDescription>
            Schedule a new match for {group}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Week</Label>
              <Input type="number" min="1" value={week} onChange={e => setWeek(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Day</Label>
              <Input type="number" min="1" value={day} onChange={e => setDay(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Match No</Label>
              <Input type="number" min="1" value={matchNo} onChange={e => setMatchNo(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Team A</Label>
              <Select value={teamAId} onValueChange={(val) => val && setTeamAId(val)}>
                <SelectTrigger className="w-full h-12 bg-transparent border-input">
                  <SelectValue placeholder="Select team">
                    {teamAId ? (
                      <div className="flex items-center gap-2">
                        <TeamAvatar name={teams.find(t => t.id.toString() === teamAId)?.name || ""} logo={teams.find(t => t.id.toString() === teamAId)?.logo} color="left" size="small" />
                        <span>{teams.find(t => t.id.toString() === teamAId)?.name}</span>
                      </div>
                    ) : "Select team"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      <div className="flex items-center gap-2">
                        <TeamAvatar name={t.name} logo={t.logo} color="left" size="small" />
                        <span>{t.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Team B</Label>
              <Select value={teamBId} onValueChange={(val) => val && setTeamBId(val)}>
                <SelectTrigger className="w-full h-12 bg-transparent border-input">
                  <SelectValue placeholder="Select team">
                    {teamBId ? (
                      <div className="flex items-center gap-2">
                        <TeamAvatar name={teams.find(t => t.id.toString() === teamBId)?.name || ""} logo={teams.find(t => t.id.toString() === teamBId)?.logo} color="right" size="small" />
                        <span>{teams.find(t => t.id.toString() === teamBId)?.name}</span>
                      </div>
                    ) : "Select team"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      <div className="flex items-center gap-2">
                        <TeamAvatar name={t.name} logo={t.logo} color="right" size="small" />
                        <span>{t.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => v && setFormat(v as MatchFormat)}>
              <SelectTrigger className="w-full h-9 bg-transparent border-input">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MatchFormat.BO3}>BO3</SelectItem>
                <SelectItem value={MatchFormat.BO5}>BO5</SelectItem>
                <SelectItem value={MatchFormat.BO7}>BO7</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading} onClick={handleSave}>
            Save Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
