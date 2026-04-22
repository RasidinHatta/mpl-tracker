"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { signUpSchema } from "@/lib/schema";

export async function signUpEmailAction(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const result = signUpSchema.safeParse(raw);

  if (!result.success) {
    const errorMessages = result.error.issues.map((err) => err.message).join(", ");
    return { error: errorMessages, fieldErrors: result.error.flatten().fieldErrors };
  }

  const { name, email, password } = result.data;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });

    return { error: null, verificationEmailSent: true };
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
