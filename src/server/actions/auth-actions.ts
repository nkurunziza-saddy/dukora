"use server";

import { cacheLife, cacheTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const getCurrentSession = async () => {
  "use cache: private";
  cacheLife("minutes");
  cacheTag("user-session");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};
