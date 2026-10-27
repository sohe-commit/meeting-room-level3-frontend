import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Reservation } from "@/lib/types";
import { StatusBadge, Tag } from "./ui";

/** 예약 목록의 한 줄 */
export function ReservationRow({
  r,
  showDepartment = false,
  action,
}: {
  r: Reservation;
  showDepartment?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3 sm:p-4">
      <Link href={`/reservations/${r.id}`} className="min-w-0 flex-1 hover:underline">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={r.status} />
          <span className="font-semibold">
            {formatDate(r.date)} {r.startTime}~{r.endTime}
          </span>
          <span className="text-sm text-muted">{r.roomName}</span>
          {r.meetingType === "TRAINING" && <Tag tone="butter">교육·행사</Tag>}
          {r.createdVia === "AI" && <Tag tone="ai">AI 예약</Tag>}
        </div>
        <p className="mt-1 truncate text-sm text-muted">
          {showDepartment && r.departmentName && `${r.departmentName}${r.reserver ? ` ${r.reserver.name}` : ""} · `}
          {r.title} · {r.attendeeCount}명
        </p>
      </Link>
      {action}
    </li>
  );
}
