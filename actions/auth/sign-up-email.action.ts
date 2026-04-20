"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { APIError } from "better-auth/api";

export async function signUpEmailAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";
      if (errCode === "USER_ALREADY_EXISTS") {
        return { error: "User already exists. Please try another email or sign in." };
      }
      return { error: err.message || "An error occurred during sign up." };
    }

    if (err instanceof Error) return { error: err.message };
    return { error: "Internal Server Error" };
  }
}
