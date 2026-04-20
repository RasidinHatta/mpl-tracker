"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth.client";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const SignOutButton = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleClick() {
    await signOut({
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("You’ve logged out. See you soon!");
          router.push("/sign-in");
        },
      },
    });
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      disabled={isPending}
      className="w-full h-auto flex justify-start px-1.5 py-1.5 font-normal hover:bg-red-500/10 transition-colors"
    >
      <LogOutIcon className="mr-2 h-4 w-4 text-red-500" />
      <span className="text-red-500">Log out</span>
    </Button>
  );
};
