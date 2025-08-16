import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { USER_ROLES } from "@/lib/schema/models/enums";
import { UserRole } from "./schema/schema-types";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,

    // async sendResetPassword(data, request) {},
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
});

export type SessionUSer = typeof auth.$Infer.Session.user;
