"use client";

import { addDays, formatDate, todayKst } from "@/lib/format";

/** 날짜 고르기: ◀ 날짜 ▶ 오늘 */
export function DateNav({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  const today = todayKst();
  const btn = "rounded-lg border border-line bg-white px-3 py-2 text-sm hover:bg-background";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={btn} onClick={() => onChange(addDays(date, -1))} aria-label="전날">
        ◀
      </button>
      <input
        type="date"
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        value={date}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      />
      <button type="button" className={btn} onClick={() => onChange(addDays(date, 1))} aria-label="다음 날">
        ▶
      </button>
      {date !== today && (
        <button type="button" className={btn} onClick={() => onChange(today)}>
          오늘
        </button>
      )}
      <span className="text-sm font-semibold">{formatDate(date)}</span>
    </div>
  );
}
