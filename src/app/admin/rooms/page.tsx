"use client";

import { useState } from "react";
import { Button, Card, EquipmentTags, ErrorBox, Field, Loading, PageTitle, SuccessBox, Tag, inputClass } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import type { Room } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

type RoomForm = Omit<Room, "id" | "openIssueCount" | "floor" | "capacity"> & { floor: string; capacity: string };

const EMPTY: RoomForm = {
  name: "",
  floor: "",
  capacity: "",
  hasTv: false,
  hasVideoConf: false,
  hasWhiteboard: false,
  hasProjector: false,
  isActive: true,
};

const CHECKS: { key: keyof RoomForm; label: string }[] = [
  { key: "hasTv", label: "📺 TV" },
  { key: "hasVideoConf", label: "🎥 화상회의 장비" },
  { key: "hasWhiteboard", label: "🖊️ 화이트보드" },
  { key: "hasProjector", label: "📽️ 빔프로젝터" },
];

export default function AdminRoomsPage() {
  const { data: rooms, error, loading, reload } = useLoad(() => api<Room[]>("/rooms"), []);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<RoomForm>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function startEdit(room?: Room) {
    setMessage(null);
    setFormError(null);
    if (room) {
      setEditingId(room.id);
      setForm({ ...room, floor: String(room.floor), capacity: String(room.capacity) });
    } else {
      setEditingId("new");
      setForm(EMPTY);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    const body = {
      name: form.name,
      floor: form.floor === "" ? undefined : Number(form.floor),
      capacity: form.capacity === "" ? undefined : Number(form.capacity),
      hasTv: form.hasTv,
      hasVideoConf: form.hasVideoConf,
      hasWhiteboard: form.hasWhiteboard,
      hasProjector: form.hasProjector,
      isActive: form.isActive,
    };
    try {
      if (editingId === "new") {
        await api("/rooms", { method: "POST", body });
        setMessage(`'${form.name}' 회의실을 등록했어요.`);
      } else {
        await api(`/rooms/${editingId}`, { method: "PATCH", body });
        setMessage(`'${form.name}' 회의실 정보를 저장했어요.`);
      }
      setEditingId(null);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(room: Room) {
    const next = !room.isActive;
    const ask = next
      ? `'${room.name}' 회의실을 다시 사용할 수 있게 할까요?`
      : `'${room.name}' 회의실을 사용 중지할까요?\n이미 잡힌 예약은 그대로 남고, 새 예약만 막혀요.`;
    if (!window.confirm(ask)) return;
    setMessage(null);
    try {
      await api(`/rooms/${room.id}`, { method: "PATCH", body: { isActive: next } });
      setMessage(next ? `'${room.name}' 회의실을 다시 열었어요.` : `'${room.name}' 회의실을 사용 중지했어요.`);
      reload();
    } catch (err) {
      setMessage(null);
      setFormError(err instanceof ApiError ? err.message : "바꾸지 못했어요.");
    }
  }

  return (
    <>
      <PageTitle
        title="회의실 관리"
        description="회의실을 등록하고 정보를 고쳐요. 점검 중인 방은 사용 중지로 바꾸면 새 예약이 막혀요."
        action={editingId === null && <Button onClick={() => startEdit()}>+ 회의실 등록</Button>}
      />
      <div className="mb-4 space-y-2">
        <SuccessBox message={message} />
        <ErrorBox message={editingId === null ? formError : null} />
        <ErrorBox message={error} />
      </div>

      {editingId !== null && (
        <Card className="mb-6 max-w-2xl">
          <h2 className="mb-4 font-semibold">{editingId === "new" ? "새 회의실 등록" : "회의실 정보 수정"}</h2>
          <form onSubmit={save} className="space-y-4" noValidate>
            <Field label="이름">
              <input className={inputClass} maxLength={30} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 금강" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="층">
                <input className={inputClass} type="number" inputMode="numeric" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              </Field>
              <Field label="정원 (명)">
                <input className={inputClass} type="number" min={1} inputMode="numeric" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </Field>
            </div>
            <Field label="장비">
              <div className="flex flex-wrap gap-3">
                {CHECKS.map((c) => (
                  <label key={c.key} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={form[c.key] as boolean}
                      onChange={(e) => setForm({ ...form, [c.key]: e.target.checked })}
                      className="h-4 w-4 accent-[var(--brand)]"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-[var(--brand)]" />
              예약 받기 (끄면 사용 중지)
            </label>
            <ErrorBox message={formError} />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? "저장 중…" : "저장"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
                닫기
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && !rooms ? (
        <Loading />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rooms?.map((room) => (
            <Card key={room.id}>
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold">
                    {room.name}
                    {room.isActive ? <Tag tone="green">사용 중</Tag> : <Tag tone="amber">사용 중지</Tag>}
                    {(room.openIssueCount ?? 0) > 0 && <Tag tone="rose">⚠️ 제보 {room.openIssueCount}</Tag>}
                  </h3>
                  <p className="text-sm text-muted">
                    {room.floor}층 · 정원 {room.capacity}명
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => startEdit(room)}>
                    수정
                  </Button>
                  <Button variant={room.isActive ? "danger" : "secondary"} onClick={() => toggleActive(room)}>
                    {room.isActive ? "사용 중지" : "다시 열기"}
                  </Button>
                </div>
              </div>
              <EquipmentTags room={room} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
