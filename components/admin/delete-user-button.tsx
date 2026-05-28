"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "@/actions/auth/delete-user.action";

export function DeleteUserButton({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (disabled) return;
    if (!window.confirm("Delete this user account?")) return;

    startTransition(async () => {
      const result = await deleteUserAction({ userId });
      if (result.success) {
        toast.success("User deleted");
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={disabled || isPending}
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}
