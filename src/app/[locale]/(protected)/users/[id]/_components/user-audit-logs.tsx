import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SelectAuditLog } from "@/lib/schema/schema-types";

export default async function UserAuditLogs({
  auditLogs,
}: {
  auditLogs: SelectAuditLog[];
}) {
  const t = await getTranslations("users");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("auditLogAction")}</TableHead>
          <TableHead>{t("auditLogModel")}</TableHead>
          <TableHead>{t("auditLogRecordId")}</TableHead>
          <TableHead>{t("auditLogChanges")}</TableHead>
          <TableHead>{t("auditLogPerformedAt")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {auditLogs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.model}</TableCell>
            <TableCell>{log.recordId}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {JSON.stringify(log.changes)}
            </TableCell>
            <TableCell>{format(new Date(log.performedAt), "PPP p")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
