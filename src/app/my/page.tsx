"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ReservationRow } from "@/components/ReservationRow";
import { Button, ButtonLink, Empty, ErrorBox, Loading, PageTitle, SuccessBox } from "@/components/ui";
import { WeekBoard, mondayOf } from "@/components/WeekBoard";
import { ApiError, api } from "@/lib/api";
import { MEETING_TYPE_LABEL, STATUS_LABEL, todayKst } from "@/lib/format";
import type { DisplayStatus, MeetingType, Reservation } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

const STATUS_TABS: (DisplayStatus | "")[] = ["", "UPCOMING", "ONGOING", "DONE", "CANCELLED"];
const TYPE_TABS: (MeetingType | "")[] = ["", "MEETING", "TRAINING"];

const chip = (selected: boolean) =>
  `shrink-0 rounded-full px-3 py-1.5 text-sm ${
    selected ? "bg-foreground font-semibold text-white" : "bg-surface text-muted ring-1 ring-line hover:text-foreground"
  }`;

export default function MyReservationsPage() {
  const router = useRouter();
  const params = useSearchParams();
  // 보기 방식과 주는 주소에 남겨서 새로고침해도 그대로 보이게 한다.
  const view = params.get("view") === "week" ? "week" : "list";
  const monday = mondayOf(params.get("week") || todayKst());

  const [status, setStatus] = useState<DisplayStatus | "">("");
  const [type, setType] = useState<MeetingType | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, error, loading, reload } = useLoad(() => api<Reservation[]>("/reservations/me"), []);

  function go(next: { view?: string; week?: string }) {
    const q = new URLSearchParams();
    const v = next.view ?? view;
    if (v === "week") {
      q.set("view", "week");
      q.set("week", next.week ?? monday);
    }
    router.replace(`/my${q.size ? `?${q}` : ""}`);
  }

  async function cancel(r: Reservation) {
    if (!window.confirm(`${r.roomName} ${r.startTime}~${r.endTime} "${r.title}" 예약을 취소할까요?`)) return;
    setMessage(null);
    setActionError(null);
    try {
      await api(`/reservations/${r.id}/cancel`, { method: "PATCH" });
      setMessage("예약을 취소했어요.");
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "취소하지 못했어요.");
    }
  }

  const all = data ?? [];
  const byType = all.filter((r) => !type || r.meetingType === type);
  const list = byType.filter((r) => !status || r.status === status);
  const typeCount = (t: MeetingType | "") => all.filter((r) => !t || r.meetingType === t).length;

  return (
    <>
      <PageTitle
        title="내 예약"
        description="회의가 끝나기 전까지는 직접 취소할 수 있어요."
        action={<ButtonLink href="/reservations/new">+ 새 예약</ButtonLink>}
      />

      <div className="mb-5 inline-flex rounded-lg bg-surface-2 p-1" role="tablist" aria-label="보기 방식">
        {[
          { key: "list", label: "목록" },
          { key: "week", label: "주간 보드" },
        ].map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={view === v.key}
            onClick={() => go({ view: v.key })}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              view === v.key ? "bg-surface text-foreground ring-1 ring-line" : "text-muted hover:text-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mb-3 space-y-2">
        <SuccessBox message={message} />
        <ErrorBox message={actionError ?? error} />
      </div>

      {loading && !data ? (
        <Loading />
      ) : view === "week" ? (
        <WeekBoard reservations={all} monday={monday} onWeekChange={(week) => go({ week })} />
      ) : (
        <>
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
            {TYPE_TABS.map((t) => (
              <button key={t || "ALL"} onClick={() => setType(t)} className={chip(type === t)}>
                {t ? MEETING_TYPE_LABEL[t] : "모든 유형"} <span className="opacity-70">{typeCount(t)}</span>
              </button>
            ))}
          </div>
          <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t || "ALL"}
                onClick={() => setStatus(t)}
                className={`shrink-0 rounded-lg px-3 py-1 text-sm ${
                  status === t ? "bg-surface font-medium text-foreground ring-1 ring-line" : "text-muted hover:text-foreground"
                }`}
              >
                {t ? STATUS_LABEL[t] : "전체 상태"}
              </button>
            ))}
          </div>
          {list.length === 0 ? (
            <Empty text="해당하는 예약이 없어요." />
          ) : (
            <ul className="space-y-2">
              {list.map((r) => (
                <ReservationRow
                  key={r.id}
                  r={r}
                  action={
                    (r.status === "UPCOMING" || r.status === "ONGOING") && (
                      <Button variant="danger" onClick={() => cancel(r)}>
                        취소
                      </Button>
                    )
                  }
                />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
