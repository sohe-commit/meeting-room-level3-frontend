"use client";

import { useState } from "react";
import { ReservationRow } from "@/components/ReservationRow";
import { Button, ButtonLink, Empty, ErrorBox, Loading, PageTitle, SuccessBox } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { STATUS_LABEL } from "@/lib/format";
import type { DisplayStatus, Reservation } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

const TABS: (DisplayStatus | "")[] = ["", "UPCOMING", "ONGOING", "DONE", "CANCELLED"];

export default function MyReservationsPage() {
  const [status, setStatus] = useState<DisplayStatus | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, error, loading, reload } = useLoad(
    () => api<Reservation[]>(`/reservations/me${status ? `?status=${status}` : ""}`),
    [status],
  );

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

  return (
    <>
      <PageTitle
        title="내 예약"
        description="회의가 끝나기 전까지는 직접 취소할 수 있어요."
        action={<ButtonLink href="/reservations/new">+ 새 예약</ButtonLink>}
      />
      <div className="mb-4 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t || "ALL"}
            onClick={() => setStatus(t)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              status === t ? "bg-foreground font-semibold text-white" : "bg-white text-muted ring-1 ring-line"
            }`}
          >
            {t ? STATUS_LABEL[t] : "전체"}
          </button>
        ))}
      </div>
      <div className="mb-3 space-y-2">
        <SuccessBox message={message} />
        <ErrorBox message={actionError ?? error} />
      </div>
      {loading && !data ? (
        <Loading />
      ) : data && data.length === 0 ? (
        <Empty text="해당하는 예약이 없어요." />
      ) : (
        <ul className="space-y-2">
          {data?.map((r) => (
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
  );
}
