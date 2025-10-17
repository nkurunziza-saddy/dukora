import type { InsertSchedule, SelectSchedule } from "@/lib/schema/schema-types";

export type CalendarView = "month" | "week" | "day" | "agenda";

export type CalendarEventInput = Omit<InsertSchedule, "businessId" | "userId">;
export type CalendarEvent = Omit<SelectSchedule, "businessId" | "userId">;

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange";
