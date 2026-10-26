"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink, Card, ErrorBox, PageTitle, StatusBadge, SuccessBox, Tag, inputClass } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Reservation } from "@/lib/types";

interface Conditions {
  date: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  needs: { tv: boolean; videoConf: boolean; whiteboard: boolean; projector: boolean };
  title: string;
}

interface AiResult {
  status: "BOOKED" | "NEED_MORE" | "REJECTED" | "NO_ROOM";
  message: string;
  interpreted?: Conditions;
  reservation?: Reservation;
  suggestions?: { startTime: string; endTime: string; roomName: string }[];
}

const EXAMPLES = [
  "내일 오후 2시에 6명, 화상회의 필요, 1시간",
  "모레 오전 10시 반부터 4명이서 화이트보드 있는 방 1시간 반",
  "다음 주 월요일 3시에 빔프로젝터로 발표 연습 8명",
];

const NEED_LABEL = { tv: "TV", videoConf: "화상회의 장비", whiteboard: "화이트보드", projector: "빔프로젝터" };

export default function AiPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    setCancelMsg(null);
    try {
      setResult(await api<AiResult>("/ai/reserve", { method: "POST", body: { text } }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "AI 예약을 하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: number) {
    try {
      const r = await api<Reservation>(`/reservations/${id}/cancel`, { method: "PATCH" });
      setResult((prev) => (prev ? { ...prev, reservation: r } : prev));
      setCancelMsg("예약을 취소했어요. 문장을 고쳐서 다시 시도해 보세요.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "취소하지 못했어요.");
    }
  }

  const c = result?.interpreted;
  const needs = c ? (Object.keys(NEED_LABEL) as (keyof typeof NEED_LABEL)[]).filter((k) => c.needs?.[k]) : [];

  return (
    <>
      <PageTitle
        title="AI로 예약하기"
        description="원하는 조건을 말하듯이 적으면 AI가 조건에 맞는 빈 회의실을 찾아 바로 예약해요."
      />
      <Card className="mb-5 max-w-3xl">
        <form onSubmit={submit} className="space-y-3">
          <textarea
            className={`${inputClass} min-h-24`}
            maxLength={300}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: 내일 오후 2시에 6명, 화상회의 필요, 1시간"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                {ex}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={busy || text.trim().length < 2}>
            {busy ? "AI가 회의실을 찾는 중…" : "✨ AI로 예약하기"}
          </Button>
        </form>
      </Card>

      <div className="max-w-3xl space-y-4">
        {error && (
          <div className="space-y-2">
            <ErrorBox message={error} />
            <ButtonLink href="/reservations/new" variant="secondary">
              직접 예약하기
            </ButtonLink>
          </div>
        )}

        {c && (
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-muted">AI가 이해한 조건</h2>
            <div className="flex flex-wrap gap-1.5 text-sm">
              {c.date && <Tag>📅 {formatDate(c.date)}</Tag>}
              {c.startTime && (
                <Tag>
                  🕑 {c.startTime}
                  {c.endTime && `~${c.endTime}`}
                </Tag>
              )}
              {c.attendeeCount && <Tag>👥 {c.attendeeCount}명</Tag>}
              {needs.map((k) => (
                <Tag key={k} tone="violet">
                  {NEED_LABEL[k]}
                </Tag>
              ))}
              {c.title && <Tag>📝 {c.title}</Tag>}
            </div>
          </Card>
        )}

        {result && result.status === "BOOKED" && result.reservation && (
          <Card className="border-emerald-200">
            <SuccessBox message={`✅ ${result.message}`} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={result.reservation.status} />
              <span className="font-bold">
                {result.reservation.roomName} · {formatDate(result.reservation.date)} {result.reservation.startTime}~
                {result.reservation.endTime}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {result.reservation.title} · {result.reservation.attendeeCount}명
            </p>
            <SuccessBox message={cancelMsg} />
            <div className="mt-3 flex gap-2">
              <ButtonLink href={`/reservations/${result.reservation.id}`} variant="secondary">
                예약 상세 보기
              </ButtonLink>
              {result.reservation.status !== "CANCELLED" && (
                <Button variant="danger" onClick={() => cancel(result.reservation!.id)}>
                  마음에 안 들어요, 바로 취소
                </Button>
              )}
            </div>
          </Card>
        )}

        {result && result.status !== "BOOKED" && (
          <Card className="border-amber-200">
            <p className="font-semibold text-amber-800">
              {result.status === "NEED_MORE" ? "🤔 " : "⚠️ "}
              {result.message}
            </p>
            {result.status === "NO_ROOM" && result.suggestions && result.suggestions.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-sm text-muted">이 시간은 비어 있어요:</p>
                <ul className="space-y-1">
                  {result.suggestions.map((s) => (
                    <li key={s.startTime} className="text-sm">
                      <Link
                        href={`/reservations/new?date=${c?.date}&start=${s.startTime}&end=${s.endTime}`}
                        className="text-brand hover:underline"
                      >
                        {s.startTime}~{s.endTime} · {s.roomName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
