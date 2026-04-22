"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { signInSchema } from "@/lib/schema";

export async function signInEmailAction(formData: FormData) {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const result = signInSchema.safeParse(raw);

  if (!result.success) {
    const errorMessages = result.error.issues.map((err) => err.message).join(", ");
    return { error: errorMessages, fieldErrors: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: { email, password },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";
      return { error: err.message || "An error occurred during sign in." };
    }

    if (err instanceof Error) return { error: err.message };
    return { error: "Internal Server Error" };
  }
}
