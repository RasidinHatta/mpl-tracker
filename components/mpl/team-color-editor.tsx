"use client";

import { useState } from "react";
import { updateTeam } from "@/actions/mpl/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function TeamEditor({ teamId, initialName, initialLogo, initialColor }: { teamId: number, initialName: string, initialLogo?: string | null, initialColor?: string | null }) {
  const [name, setName] = useState(initialName);
  const [logo, setLogo] = useState(initialLogo || "");
  const [color, setColor] = useState(initialColor || "#000000");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSave() {
    setIsPending(true);
    try {
      const res = await updateTeam(teamId, { name, logo: logo || null, color });
      if (res.success) {
        toast.success(`Team updated for ${name}`);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to update team");
      }
    } catch (err) {
      toast.error("Failed to update team");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="inline-flex items-center justify-center shrink-0 h-6 w-6 ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit Team">
        <Pencil className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Edit Team</h4>
            <p className="text-sm text-muted-foreground">
              Update team name, logo URL, and accent color.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Team Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ONIC" className="h-8" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="logo" className="text-xs">Logo URL</Label>
              <Input id="logo" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." className="h-8" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="color" className="text-xs">Accent Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <Input value={color} onChange={e => setColor(e.target.value)} placeholder="#000000" className="flex-1 font-mono text-xs h-8" />
              </div>
            </div>
          </div>

          <Button className="w-full" size="sm" onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
