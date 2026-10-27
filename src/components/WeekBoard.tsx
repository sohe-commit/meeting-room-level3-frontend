import Link from "next/link";
import { MEETING_TYPE_LABEL, addDays, timeToMinutes, todayKst } from "@/lib/format";
import type { Reservation } from "@/lib/types";
import { StatusBadge, Tag } from "./ui";

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

/** 그 날짜가 들어 있는 주의 월요일 */
export function mondayOf(date: string): string {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0=일
  return addDays(date, -((weekday + 6) % 7));
}

function shortDay(date: string) {
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d}`;
}

function hoursText(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && `${h}시간`, m && `${m}분`].filter(Boolean).join(" ") || "0분";
}

/**
 * 내 예약 주간 보드: 월~금 칸에 그날 내 회의를 시간순으로 쌓아 보여 준다.
 * 주말에 예약이 있으면 토·일 칸도 보인다. 취소된 예약은 빼고 보여 준다.
 */
export function WeekBoard({
  reservations,
  monday,
  onWeekChange,
}: {
  reservations: Reservation[];
  monday: string;
  onWeekChange: (monday: string) => void;
}) {
  const today = todayKst();
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const active = reservations.filter((r) => r.status !== "CANCELLED");
  const byDay = new Map(
    days.map((d) => [d, active.filter((r) => r.date === d).sort((a, b) => a.startTime.localeCompare(b.startTime))]),
  );
  const hasWeekend = (byDay.get(days[5])?.length ?? 0) + (byDay.get(days[6])?.length ?? 0) > 0;
  const shown = hasWeekend ? days : days.slice(0, 5);
  const weekItems = shown.flatMap((d) => byDay.get(d) ?? []);
  const totalMinutes = weekItems.reduce((sum, r) => sum + timeToMinutes(r.endTime) - timeToMinutes(r.startTime), 0);
  const navBtn = "rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:bg-background";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" className={navBtn} onClick={() => onWeekChange(addDays(monday, -7))} aria-label="지난주">
          ◀
        </button>
        <button type="button" className={navBtn} onClick={() => onWeekChange(mondayOf(today))}>
          이번 주
        </button>
        <button type="button" className={navBtn} onClick={() => onWeekChange(addDays(monday, 7))} aria-label="다음 주">
          ▶
        </button>
        <span className="ml-1 font-semibold">
          {shortDay(monday)} ~ {shortDay(shown[shown.length - 1])}
        </span>
        <span className="text-sm text-muted">
          · 회의 {weekItems.length}건 · 총 {hoursText(totalMinutes)}
        </span>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${hasWeekend ? "md:grid-cols-7" : "md:grid-cols-5"}`}>
        {shown.map((d, i) => {
          const items = byDay.get(d) ?? [];
          const isToday = d === today;
          return (
            <section
              key={d}
              className={`flex min-h-32 flex-col rounded-xl border bg-surface ${isToday ? "border-brand" : "border-line"}`}
            >
              <header className="flex items-center justify-between border-b border-line-soft px-3 py-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {DAY_NAMES[i]}
                  <span className="font-normal text-muted">{shortDay(d)}</span>
                </span>
                {isToday ? (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-medium text-white">오늘</span>
                ) : (
                  items.length > 0 && <span className="text-xs text-muted">{items.length}건</span>
                )}
              </header>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {items.length === 0 ? (
                  <p className="m-auto py-3 text-xs text-subtle">회의 없음</p>
                ) : (
                  items.map((r) => (
                    <Link
                      key={r.id}
                      href={`/reservations/${r.id}`}
                      className={`block rounded-lg border px-2.5 py-2 text-sm transition hover:border-brand ${
                        r.status === "DONE" ? "border-line-soft bg-background text-muted" : "border-line bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold tabular-nums">
                          {r.startTime}~{r.endTime}
                        </span>
                        {r.status !== "UPCOMING" && <StatusBadge status={r.status} />}
                      </div>
                      <p className="mt-0.5 truncate">{r.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
                        <span>{r.roomName}</span>
                        {r.meetingType === "TRAINING" && <Tag tone="butter">{MEETING_TYPE_LABEL.TRAINING}</Tag>}
                        {r.createdVia === "AI" && <Tag tone="ai">AI</Tag>}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
