"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Empty, EquipmentTags, ErrorBox, Loading, PageTitle, Tag, inputClass } from "@/components/ui";
import { api, query } from "@/lib/api";
import type { Room } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

const FILTERS = [
  { key: "tv", label: "📺 TV" },
  { key: "videoConf", label: "🎥 화상회의 장비" },
  { key: "whiteboard", label: "🖊️ 화이트보드" },
  { key: "projector", label: "📽️ 빔프로젝터" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function RoomsPage() {
  const [minCapacity, setMinCapacity] = useState("");
  const [needs, setNeeds] = useState<Record<FilterKey, boolean>>({
    tv: false,
    videoConf: false,
    whiteboard: false,
    projector: false,
  });

  const { data: rooms, error, loading } = useLoad(
    () => api<Room[]>(`/rooms${query({ minCapacity, ...needs })}`),
    [minCapacity, needs],
  );

  return (
    <>
      <PageTitle title="회의실" description="정원과 장비로 걸러 보고, 회의실을 눌러 빈 시간을 확인하세요." />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 whitespace-nowrap text-sm">
            <span className="font-semibold">인원</span>
            <input
              className={`${inputClass} w-24`}
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="예: 6"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value.replace(/\D/g, ""))}
            />
            <span className="text-muted">명 이상</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={needs[f.key]}
                onClick={() => setNeeds((n) => ({ ...n, [f.key]: !n[f.key] }))}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  needs[f.key]
                    ? "border-brand bg-brand font-medium text-white"
                    : "border-line bg-white text-muted hover:bg-background"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <ErrorBox message={error} />
      {loading && !rooms ? (
        <Loading />
      ) : rooms && rooms.length === 0 ? (
        <Empty text="조건에 맞는 회의실이 없어요. 조건을 줄여 보세요." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms?.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`} className="group">
              <Card className="h-full transition group-hover:border-brand">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">{room.name}</h2>
                    <p className="text-sm text-muted">
                      {room.floor}층 · 정원 {room.capacity}명
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!room.isActive && <Tag tone="amber">점검 중</Tag>}
                    {(room.openIssueCount ?? 0) > 0 && (
                      <Tag tone="rose">⚠️ 제보 {room.openIssueCount}건</Tag>
                    )}
                  </div>
                </div>
                <EquipmentTags room={room} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
