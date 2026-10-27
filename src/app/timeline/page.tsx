"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DateNav } from "@/components/DateNav";
import { DayTimeline } from "@/components/DayTimeline";
import { ErrorBox, Loading, PageTitle } from "@/components/ui";
import { api } from "@/lib/api";
import { todayKst } from "@/lib/format";
import type { Timeline } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

export default function TimelinePage() {
  const router = useRouter();
  const date = useSearchParams().get("date") || todayKst();
  const { data, error, loading } = useLoad(() => api<Timeline>(`/reservations/timeline?date=${date}`), [date]);

  return (
    <>
      <PageTitle
        title="예약표"
        description="회의실 전체의 하루 예약을 한눈에 보고, 빈칸을 눌러 바로 예약하세요."
        action={<DateNav date={date} onChange={(d) => router.replace(`/timeline?date=${d}`)} />}
      />
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded bg-foreground" /> 내 예약
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded bg-[#eef0ff] ring-1 ring-[#d4d8ff]" /> 다른 사람 예약
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded bg-surface-2 ring-1 ring-line" /> 끝난 회의
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded bg-[#faf8f5] ring-1 ring-line" /> 예약할 수 없는 시간
        </span>
      </div>
      <ErrorBox message={error} />
      {loading && !data ? <Loading /> : data && <DayTimeline date={data.date} rooms={data.rooms} />}
    </>
  );
}
