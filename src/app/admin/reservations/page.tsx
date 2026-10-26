"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ReservationRow } from "@/components/ReservationRow";
import { Button, Card, Empty, ErrorBox, Loading, PageTitle, inputClass } from "@/components/ui";
import { api, query } from "@/lib/api";
import { STATUS_LABEL } from "@/lib/format";
import type { Department, DisplayStatus, Reservation, Room } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

export default function AdminReservationsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = {
    date: params.get("date") ?? "",
    roomId: params.get("roomId") ?? "",
    departmentId: params.get("departmentId") ?? "",
    status: params.get("status") ?? "",
    q: params.get("q") ?? "",
  };
  // 검색어 입력칸: 주소의 검색어가 바뀌면(초기화 등) 입력칸도 맞춘다.
  const [q, setQ] = useState(filters.q);
  const [lastQ, setLastQ] = useState(filters.q);
  if (lastQ !== filters.q) {
    setLastQ(filters.q);
    setQ(filters.q);
  }

  const { data: rooms } = useLoad(() => api<Room[]>("/rooms"), []);
  const { data: departments } = useLoad(() => api<Department[]>("/departments"), []);
  const search = query(filters);
  const { data, error, loading } = useLoad(() => api<Reservation[]>(`/reservations${search}`), [search]);

  // 필터는 주소에 담아서, 현황판 숫자를 누르면 바로 걸러진 목록이 보이게 한다.
  function update(patch: Partial<typeof filters>) {
    router.replace(`${pathname}${query({ ...filters, ...patch })}`);
  }

  return (
    <>
      <PageTitle title="전체 예약 목록" description="모든 예약을 날짜·회의실·부서·상태로 걸러 보고 회의 제목으로 검색해요." />
      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="date" className={inputClass} value={filters.date} onChange={(e) => update({ date: e.target.value })} aria-label="날짜" />
          <select className={inputClass} value={filters.roomId} onChange={(e) => update({ roomId: e.target.value })} aria-label="회의실">
            <option value="">모든 회의실</option>
            {rooms?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select className={inputClass} value={filters.departmentId} onChange={(e) => update({ departmentId: e.target.value })} aria-label="부서">
            <option value="">모든 부서</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select className={inputClass} value={filters.status} onChange={(e) => update({ status: e.target.value })} aria-label="상태">
            <option value="">모든 상태</option>
            {(Object.keys(STATUS_LABEL) as DisplayStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: q.trim() });
          }}
        >
          <input className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="회의 제목으로 검색 (예: 주간)" />
          <Button type="submit">검색</Button>
          <Button type="button" variant="secondary" onClick={() => router.replace(pathname)}>
            초기화
          </Button>
        </form>
      </Card>

      <ErrorBox message={error} />
      {loading && !data ? (
        <Loading />
      ) : data && data.length === 0 ? (
        <Empty text="조건에 맞는 예약이 없어요." />
      ) : (
        <>
          <p className="mb-2 text-sm text-muted">
            {data?.length}건{data?.length === 300 && " (최근 300건까지 보여요)"}
          </p>
          <ul className="space-y-2">
            {data?.map((r) => (
              <ReservationRow key={r.id} r={r} showDepartment />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
