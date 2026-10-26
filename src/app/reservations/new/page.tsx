"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Card, EquipmentTags, ErrorBox, Field, Loading, PageTitle, inputClass } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { TIME_OPTIONS, addDays, minutesToTime, timeToMinutes, todayKst } from "@/lib/format";
import type { Reservation, Room } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

export default function NewReservationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const today = todayKst();

  const [roomId, setRoomId] = useState(params.get("roomId") ?? "");
  const [date, setDate] = useState(params.get("date") ?? today);
  const [startTime, setStartTime] = useState(params.get("start") ?? "");
  const [endTime, setEndTime] = useState(params.get("end") ?? "");
  const [title, setTitle] = useState("");
  const [attendeeCount, setAttendeeCount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: rooms, loading } = useLoad(() => api<Room[]>("/rooms"), []);
  const activeRooms = rooms?.filter((r) => r.isActive) ?? [];
  const room = activeRooms.find((r) => String(r.id) === roomId);

  function changeStart(value: string) {
    setStartTime(value);
    // 끝 시각이 비었거나 시작보다 빠르면 1시간 뒤로 맞춰 준다.
    if (value && (!endTime || timeToMinutes(endTime) <= timeToMinutes(value))) {
      setEndTime(minutesToTime(Math.min(timeToMinutes(value) + 60, 19 * 60)));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // 규칙 검사는 서버가 한다. 화면은 서버의 안내 문구를 그대로 보여 준다.
      const created = await api<Reservation>("/reservations", {
        method: "POST",
        body: {
          roomId: roomId ? Number(roomId) : undefined,
          date,
          startTime,
          endTime,
          title,
          attendeeCount: attendeeCount === "" ? undefined : Number(attendeeCount),
        },
      });
      router.push(`/reservations/${created.id}?created=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "예약하지 못했어요.");
      setBusy(false);
    }
  }

  if (loading && !rooms) return <Loading />;

  return (
    <>
      <PageTitle title="예약하기" description="30분 단위로 오전 10시~오후 7시, 한 번에 최대 3시간, 오늘부터 30일 뒤까지 예약할 수 있어요." />
      <Card className="max-w-2xl">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="회의실">
            <select className={inputClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              <option value="">회의실을 골라 주세요</option>
              {activeRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.floor}층 · 정원 {r.capacity}명)
                </option>
              ))}
            </select>
          </Field>
          {room && (
            <div className="-mt-2 rounded-lg bg-slate-50 px-3 py-2">
              <EquipmentTags room={room} />
            </div>
          )}

          <Field label="날짜">
            <input
              type="date"
              className={inputClass}
              min={today}
              max={addDays(today, 30)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="시작 시각">
              <select className={inputClass} value={startTime} onChange={(e) => changeStart(e.target.value)}>
                <option value="">선택</option>
                {TIME_OPTIONS.slice(0, -1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="끝 시각">
              <select className={inputClass} value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                <option value="">선택</option>
                {TIME_OPTIONS.slice(1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="회의 제목">
            <input
              className={inputClass}
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 주간 회의"
            />
          </Field>

          <Field label="참석 인원" hint={room ? `이 회의실의 정원은 ${room.capacity}명이에요.` : undefined}>
            <input
              className={inputClass}
              type="number"
              min={1}
              inputMode="numeric"
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(e.target.value)}
              placeholder="예: 4"
            />
          </Field>

          <ErrorBox message={error} />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "예약하는 중…" : "예약하기"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              돌아가기
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
