"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DateNav } from "@/components/DateNav";
import { DayTimeline } from "@/components/DayTimeline";
import {
  Button,
  ButtonLink,
  Card,
  EquipmentTags,
  ErrorBox,
  Field,
  Loading,
  SuccessBox,
  Tag,
  inputClass,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { CATEGORY_LABEL, EQUIPMENT_LABEL, formatDateTime, roomEquipment, todayKst } from "@/lib/format";
import type { IssueCategory, IssueEquipment, Room, RoomDetail, RoomIssue } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

export default function RoomDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const [date, setDate] = useState(todayKst());
  const { data: room, error, loading, reload } = useLoad(
    () => api<RoomDetail>(`/rooms/${id}?date=${date}`),
    [id, date],
  );

  if (loading && !room) return <Loading />;
  if (!room) return <ErrorBox message={error} />;

  return (
    <>
      <div className="mb-2 text-sm">
        <Link href="/rooms" className="text-muted hover:underline">
          ← 회의실 목록
        </Link>
      </div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {room.name} {!room.isActive && <Tag tone="amber">점검 중</Tag>}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {room.floor}층 · 정원 {room.capacity}명
          </p>
          <div className="mt-2">
            <EquipmentTags room={room} />
          </div>
        </div>
        {room.isActive && <ButtonLink href={`/reservations/new?roomId=${room.id}&date=${date}`}>예약하기</ButtonLink>}
      </div>

      {!room.isActive && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          지금은 점검 중인 회의실이라 새로 예약할 수 없어요.
        </div>
      )}

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">시간표</h2>
          <DateNav date={date} onChange={setDate} />
        </div>
        <ErrorBox message={error} />
        <DayTimeline date={room.date} rooms={[room]} />
        <p className="mt-2 text-xs text-muted">빈칸을 누르면 그 시각으로 예약 화면이 열려요.</p>
      </section>

      <IssueSection room={room} issues={room.openIssues} onCreated={reload} />
    </>
  );
}

function IssueSection({ room, issues, onCreated }: { room: Room; issues: RoomIssue[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">시설 제보</h2>
          <p className="text-sm text-muted">소모품이나 고장 난 장비가 있으면 알려 주세요. 총무팀이 확인해요.</p>
        </div>
        {!open && (
          <Button variant="secondary" onClick={() => setOpen(true)}>
            ✏️ 제보 쓰기
          </Button>
        )}
      </div>

      {open && (
        <IssueForm
          room={room}
          onDone={() => {
            setOpen(false);
            onCreated();
          }}
          onCancel={() => setOpen(false)}
        />
      )}

      {issues.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface py-6 text-center text-sm text-muted">
          처리 안 된 제보가 없어요. 깨끗해요! ✨
        </p>
      ) : (
        <ul className="space-y-2">
          {issues.map((issue) => (
            <li key={issue.id} className="rounded-xl border border-rose-100 bg-white p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag tone="rose">
                  {CATEGORY_LABEL[issue.category]}
                  {issue.equipment && ` · ${EQUIPMENT_LABEL[issue.equipment]}`}
                </Tag>
                <span className="text-sm">{issue.content}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {issue.writerDepartment} · {formatDateTime(issue.createdAt)} · 처리 전
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IssueForm({ room, onDone, onCancel }: { room: Room; onDone: () => void; onCancel: () => void }) {
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [equipment, setEquipment] = useState<IssueEquipment | "">("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // 장비 고장일 때는 이 방에 있는 장비 + 기타 장비만 고를 수 있다.
  const equipmentChoices: IssueEquipment[] = [...roomEquipment(room), "OTHER"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/rooms/${room.id}/issues`, {
        method: "POST",
        body: {
          category: category || undefined,
          equipment: category === "BROKEN" ? equipment || undefined : undefined,
          content,
        },
      });
      setDone("제보를 남겼어요. 고마워요!");
      setTimeout(onDone, 800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "제보를 남기지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-4">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="분류">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABEL) as IssueCategory[]).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => {
                  setCategory(c);
                  if (c !== "BROKEN") setEquipment("");
                }}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  category === c ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line bg-white"
                }`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </Field>

        {category === "BROKEN" && (
          <Field label="어떤 장비가 고장 났나요?" hint="이 회의실에 있는 장비만 보여요. 목록에 없으면 '기타 장비'를 골라 주세요.">
            <div className="flex flex-wrap gap-2">
              {equipmentChoices.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  aria-pressed={equipment === eq}
                  onClick={() => setEquipment(eq)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    equipment === eq ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line bg-white"
                  }`}
                >
                  {EQUIPMENT_LABEL[eq]}
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field label="내용" hint={`${content.trim().length} / 200자 · 쓴 제보는 고치거나 지울 수 없어요.`}>
          <textarea
            className={`${inputClass} min-h-20`}
            maxLength={200}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="예: 빨간 매직이 안 나와요."
          />
        </Field>

        <ErrorBox message={error} />
        <SuccessBox message={done} />
        <div className="flex gap-2">
          <Button type="submit" disabled={busy || !!done}>
            {busy ? "보내는 중…" : "제보 남기기"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            닫기
          </Button>
        </div>
      </form>
    </Card>
  );
}
