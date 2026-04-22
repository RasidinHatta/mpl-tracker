import { betterAuth, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { hashPassword, verifyPassword } from "./argon2";
import transporter from "./nodemailer";

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
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await transporter.sendMail({
        from: process.env.NODEMAILER_USER,
        to: user.email,
        subject: "Verify your email - MPL Tracker",
        html: `
          <div style="max-width:500px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;">
            <h1 style="font-size:20px;color:#333;">Verify your email</h1>
            <p style="font-size:16px;">Click the button below to verify your email address:</p>
            <a href="${url}" style="display:inline-block;margin-top:15px;padding:10px 15px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">Verify Email</a>
            <p style="font-size:14px;color:#666;margin-top:15px;">Or copy this link: ${url}</p>
          </div>
        `,
      });
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
