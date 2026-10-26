import Link from "next/link";
import { TIME_OPTIONS, isPast, minutesToTime, timeToMinutes } from "@/lib/format";
import type { Reservation, Room } from "@/lib/types";

const SLOTS = TIME_OPTIONS.slice(0, -1); // 10:00 ~ 18:30 시작 칸 18개
const OPEN = 10 * 60;

/**
 * 하루 시간표 (10:00~19:00, 30분 칸).
 * 빈칸을 누르면 그 시각으로 예약 화면이 열리고, 예약된 칸에는 부서와 회의 제목이 보인다.
 */
export function DayTimeline({
  date,
  rooms,
}: {
  date: string;
  rooms: (Room & { reservations: Reservation[] })[];
}) {
  const row = (time: string) => (timeToMinutes(time) - OPEN) / 30 + 2;

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <div
        className="grid min-w-full"
        style={{
          gridTemplateColumns: `52px repeat(${rooms.length}, minmax(${rooms.length > 1 ? 130 : 200}px, 1fr))`,
          gridTemplateRows: `36px repeat(${SLOTS.length}, 30px)`,
        }}
      >
        <div className="sticky left-0 z-10 border-b border-line bg-surface" />
        {rooms.map((room, i) => (
          <div
            key={room.id}
            className="flex items-center justify-center border-b border-l border-line px-2 text-sm font-semibold"
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            {room.name}
            {!room.isActive && <span className="ml-1 text-xs font-normal text-amber-700">(점검 중)</span>}
          </div>
        ))}

        {SLOTS.map((time) => (
          <div
            key={time}
            className="sticky left-0 z-10 -translate-y-2 bg-surface pr-1 text-right text-[11px] text-muted"
            style={{ gridColumn: 1, gridRow: row(time) }}
          >
            {time.endsWith(":00") ? time : ""}
          </div>
        ))}

        {rooms.map((room, i) =>
          SLOTS.map((time) => {
            const free = room.isActive && !isPast(date, time);
            const end = minutesToTime(Math.min(timeToMinutes(time) + 60, 19 * 60));
            const style = { gridColumn: i + 2, gridRow: row(time) };
            const base = `border-l border-line ${time.endsWith(":00") ? "border-t" : "border-t border-t-slate-100"}`;
            return free ? (
              <Link
                key={`${room.id}-${time}`}
                href={`/reservations/new?roomId=${room.id}&date=${date}&start=${time}&end=${end}`}
                className={`${base} group flex items-center justify-center hover:bg-brand-soft`}
                style={style}
                aria-label={`${room.name} ${time} 예약하기`}
              >
                <span className="hidden text-xs text-brand group-hover:inline">+ {time}</span>
              </Link>
            ) : (
              <div key={`${room.id}-${time}`} className={`${base} bg-slate-50`} style={style} />
            );
          }),
        )}

        {rooms.map((room, i) =>
          room.reservations.map((r) => (
            <Link
              key={r.id}
              href={`/reservations/${r.id}`}
              className={`z-[5] m-0.5 overflow-hidden rounded-md px-2 py-1 text-xs leading-tight shadow-sm ring-1 ring-inset ${
                r.isMine
                  ? "bg-brand text-white ring-blue-700"
                  : r.status === "DONE"
                    ? "bg-slate-200 text-slate-600 ring-slate-300"
                    : "bg-blue-100 text-blue-900 ring-blue-200"
              }`}
              style={{ gridColumn: i + 2, gridRow: `${row(r.startTime)} / ${row(r.endTime)}` }}
              title={`${r.startTime}~${r.endTime} ${r.departmentName ?? ""} ${r.title}`}
            >
              <div className="font-semibold">
                {r.startTime}~{r.endTime} {r.isMine && "· 내 예약"}
              </div>
              <div className="truncate">
                {r.departmentName} · {r.title}
              </div>
            </Link>
          )),
        )}
      </div>
    </div>
  );
}
