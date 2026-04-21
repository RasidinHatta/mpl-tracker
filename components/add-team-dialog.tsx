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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createTeam } from "@/actions/matches";
import { MatchGroup } from "@/lib/generated/prisma/enums";

export function AddTeamDialog({ group }: { group: MatchGroup }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");

  const handleSave = async () => {
    if (!name) {
      toast.error("Team name is required");
      return;
    }

    try {
      setLoading(true);
      await createTeam({
        name,
        logo: logo || undefined,
        group
      });
      
      toast.success("Team added successfully");
      setOpen(false);
      router.refresh();
      
      // Reset form
      setName("");
      setLogo("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add team");
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
            Add Team
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogDescription>
            Add a new team to {group}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Team Name</Label>
            <Input type="text" placeholder="e.g. Fnatic ONIC" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Logo URL (Optional)</Label>
            <Input type="url" placeholder="https://example.com/logo.png" value={logo} onChange={e => setLogo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading} onClick={handleSave}>
            Save Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
