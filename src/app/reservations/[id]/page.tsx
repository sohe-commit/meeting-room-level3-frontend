"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, Card, ErrorBox, Loading, StatusBadge, SuccessBox, Tag } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Reservation } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

export default function ReservationDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const created = useSearchParams().get("created") === "1";
  const { user } = useAuth();
  const { data: r, error, loading, setData } = useLoad(() => api<Reservation>(`/reservations/${id}`), [id]);
  const [message, setMessage] = useState<string | null>(created ? "예약이 완료됐어요." : null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function cancel() {
    if (!r || !window.confirm("이 예약을 취소할까요?")) return;
    setActionError(null);
    try {
      setData(await api<Reservation>(`/reservations/${r.id}/cancel`, { method: "PATCH" }));
      setMessage("예약을 취소했어요.");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "취소하지 못했어요.");
    }
  }

  if (loading && !r) return <Loading />;
  if (!r) return <ErrorBox message={error} />;

  const canCancel = r.isMine && (r.status === "UPCOMING" || r.status === "ONGOING");
  const rows: [string, React.ReactNode][] = [
    ["회의실", <Link key="room" href={`/rooms/${r.roomId}`} className="font-medium text-foreground underline decoration-line underline-offset-4 hover:decoration-foreground">{r.roomName} ({r.roomFloor}층)</Link>],
    ["날짜", formatDate(r.date)],
    ["시간", `${r.startTime} ~ ${r.endTime}`],
    ["참석 인원", `${r.attendeeCount}명`],
    ["부서", r.departmentName ?? "-"],
    ["예약 방법", r.createdVia === "AI" ? <Tag key="via" tone="ai">AI 예약</Tag> : "직접 예약"],
    ["예약한 시각", formatDateTime(r.createdAt)],
  ];
  if (r.cancelledAt) rows.push(["취소한 시각", formatDateTime(r.cancelledAt)]);

  return (
    <div className="max-w-2xl">
      <div className="mb-2 text-sm">
        <Link href="/my" className="text-muted hover:underline">
          ← 내 예약
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={r.status} />
        <h1 className="text-2xl font-semibold">{r.title}</h1>
        {r.isMine && <Tag tone="green">내 예약</Tag>}
      </div>
      <div className="mb-4 space-y-2">
        <SuccessBox message={message} />
        <ErrorBox message={actionError} />
      </div>

      <Card className="mb-4">
        <dl className="grid grid-cols-[6.5rem_1fr] gap-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {r.reserver && (
        <Card className="mb-4">
          <h2 className="mb-2 text-sm font-semibold">
            예약자 정보 {user?.role === "ADMIN" && !r.isMine && <span className="font-normal text-muted">(관리자에게만 보여요)</span>}
          </h2>
          <dl className="grid grid-cols-[6.5rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted">이름</dt>
            <dd>{r.reserver.name}</dd>
            <dt className="text-muted">연락처</dt>
            <dd>
              <a href={`tel:${r.reserver.phone}`} className="font-medium text-foreground underline decoration-line underline-offset-4 hover:decoration-foreground">
                {r.reserver.phone}
              </a>
            </dd>
            <dt className="text-muted">이메일</dt>
            <dd>{r.reserver.email}</dd>
          </dl>
          {user?.role === "ADMIN" && !r.isMine && (
            <p className="mt-3 rounded-lg bg-background px-3 py-2 text-xs text-muted">
              관리자도 다른 사람의 예약은 취소할 수 없어요. 필요하면 예약자에게 연락해 사정을 설명해 주세요.
            </p>
          )}
        </Card>
      )}

      {/* 예약을 마친 뒤 다음에 갈 곳 */}
      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink href={`/timeline?date=${r.date}`} variant="secondary">
          예약표에서 보기
        </ButtonLink>
        <ButtonLink href="/my" variant="secondary">
          내 예약 목록
        </ButtonLink>
        {canCancel && (
          <Button variant="danger" onClick={cancel} className="sm:ml-auto">
            예약 취소
          </Button>
        )}
      </div>
    </div>
  );
}
