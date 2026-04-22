import * as z from "zod";

// ─── AUTH SCHEMAS ───

export const signInSchema = z.object({
  email: z
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
  password: z
    .string()
    .min(1, "Password is required."),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters."),
  email: z
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
  confirmPassword: z
    .string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── TYPE INFERENCES ───

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
