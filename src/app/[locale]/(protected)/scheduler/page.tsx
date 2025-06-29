import { EventCalendar } from "@/components/event-calendar";
import {
  createSchedule as _createSchedule,
  deleteSchedule as _deleteSchedule,
  getSchedules,
  updateSchedule as _updateSchedule,
} from "@/server/actions/schedule-actions";
import { InsertSchedule } from "@/lib/schema/schema-types";
export default async function page() {
  const schedules = await getSchedules();
  if (!schedules.data) return null;

  const createSchedule = async (
    event: Omit<InsertSchedule, "businessId" | "userId">
  ) => {
    "use server";
    await _createSchedule(event);
  };
  const updateSchedule = async (
    id: string,
    event: Partial<Omit<InsertSchedule, "userId" | "businessId">>
  ) => {
    "use server";
    await _updateSchedule(id, event);
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
