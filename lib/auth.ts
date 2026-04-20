import { betterAuth, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { hashPassword, verifyPassword } from "./argon2";

const options = {
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["USER", "ADMIN"],
        input: false,
        defaultValue: "USER",
      },
    },
  },
  socialProviders: {
    google: {
      clientId: String(process.env.AUTH_GOOGLE_ID),
      clientSecret: String(process.env.AUTH_GOOGLE_SECRET),
    },
  },
  plugins: [
    nextCookies(),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(options);

export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOWN";
