import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { USER_ROLES } from "@/lib/schema/models/enums";
import { UserRole } from "./schema/schema-types";

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: UserRole.VIEW_ONLY,
            },
          };
        },
      },
    },
  },
  user: {
    modelName: "usersTable",
    additionalFields: {
      role: {
        type: [...USER_ROLES],
        required: false,
        defaultValue: "user",
        input: false,
      },
      lang: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
      businessId: {
        type: "string",
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

export const getCurrentSession = async () => {
  "use server";
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};
