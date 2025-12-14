import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { USER_ROLES } from "@/lib/schema/models/enums";
import { db } from "./db";
import { UserRole } from "./schema/schema.types";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,

    // async sendResetPassword(data, request) {},
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    modelName: "usersTable",
    additionalFields: {
      role: {
        type: [...USER_ROLES],
        required: false,
        defaultValue: UserRole.ADMIN,
        input: false,
      },
      lang: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
      businessId: {
        type: "string",
        input: false,
        required: false,
      },
    },
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  plugins: [nextCookies()],
});

export type SessionUser = typeof auth.$Infer.Session.user;
export type SessionSession = typeof auth.$Infer.Session;
