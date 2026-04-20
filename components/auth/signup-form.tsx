"use client";

import { useActionState } from "react";
import { signUpEmailAction } from "@/actions/auth/sign-up-email.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInOauthButton } from "@/components/auth/sign-in-oauth-button";

export default function SignUpForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await signUpEmailAction(formData);
    if (!result.error) {
      router.push("/");
      router.refresh();
    }
    return result;
  }, { error: null });

  return (
    <Card className="w-full max-w-sm mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Create a new account.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {state.error && (
            <div className="text-sm font-medium text-destructive">{state.error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" type="text" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign up"}
          </Button>
          <div className="text-sm text-center text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </div>
        </CardFooter>
        <div className="px-6 pb-6 pt-2">
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border mb-4">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <SignInOauthButton provider="google" signUp />
        </div>
      </form>
    </Card>
  );
}
