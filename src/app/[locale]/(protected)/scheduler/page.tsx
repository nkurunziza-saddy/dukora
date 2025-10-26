import type { Metadata } from "next";
import { EventCalendar } from "@/components/event-calendar";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import type { InsertSchedule } from "@/lib/schema/schema-types";
import {
  createSchedule as _createSchedule,
  deleteSchedule as _deleteSchedule,
  updateSchedule as _updateSchedule,
  getSchedules,
} from "@/server/actions/schedule-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "scheduler",
  });
}

export default async function page() {
  const schedules = await getSchedules({});
  if (!schedules.data) return null;

  const createSchedule = async (
    event: Omit<InsertSchedule, "businessId" | "userId">,
  ) => {
    "use server";
    await _createSchedule(event);
  };
  const updateSchedule = async (
    id: string,
    event: Partial<Omit<InsertSchedule, "userId" | "businessId">>,
  ) => {
    "use server";
    await _updateSchedule({ scheduleId: id, updates: event });
  };
  const deleteSchedule = async (eventId: string) => {
    "use server";
    await _deleteSchedule(eventId);
  };

  return (
    <EventCalendar
      events={schedules.data}
      onEventAdd={createSchedule}
      onEventUpdate={updateSchedule}
      onEventDelete={deleteSchedule}
    />
  );
}
