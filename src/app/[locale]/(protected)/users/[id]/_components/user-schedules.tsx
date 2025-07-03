import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTranslations } from "next-intl/server";
import type { SelectSchedule } from "@/lib/schema/schema-types";
import { format } from "date-fns";

export default async function UserSchedules({
  schedules,
}: {
  schedules: SelectSchedule[];
}) {
  const t = await getTranslations("users");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("scheduleTitle")}</TableHead>
          <TableHead>{t("scheduleCategory")}</TableHead>
          <TableHead>{t("scheduleStartDate")}</TableHead>
          <TableHead>{t("scheduleEndDate")}</TableHead>
          <TableHead>{t("scheduleLocation")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <TableRow key={schedule.id}>
            <TableCell>{schedule.title}</TableCell>
            <TableCell>{schedule.category}</TableCell>
            <TableCell>{format(new Date(schedule.start), "PPP")}</TableCell>
            <TableCell>{format(new Date(schedule.end), "PPP")}</TableCell>
            <TableCell>{schedule.location || "N/A"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
