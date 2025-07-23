"use server";

import { revalidatePath } from "next/cache";

export const handleRefresh = async () => {
  revalidatePath("/", "layout");
};
