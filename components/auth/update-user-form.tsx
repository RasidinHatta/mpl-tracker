"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUser } from "@/lib/auth.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UpdateUserFormProps {
  name: string;
  image: string;
}

export const UpdateUserForm = ({ name, image }: UpdateUserFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const [inputValue, setInputValue] = useState(name || "");
  const router = useRouter();

  useEffect(() => {
    setInputValue(name || "");
  }, [name]);

  // @ts-ignore
  async function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);
    const newName = String(formData.get("name"));

    if (!newName) {
      return toast.error("Please enter a name");
    }

    await updateUser({
      ...(newName && { name: newName }),
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx: any) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("User updated successfully");
          router.refresh();
        },
      },
    });
  }

  return (
    <form className="max-w-sm w-full space-y-4" onSubmit={handleSubmit as any}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Profile Picture</Label>
        <Avatar className="size-20 border border-primary/20">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl uppercase">
            {name?.slice(0, 2) || "U"}
          </AvatarFallback>
        </Avatar>
      </div>

      <Button type="submit" disabled={isPending}>
        Update User
      </Button>
    </form>
  );
};
