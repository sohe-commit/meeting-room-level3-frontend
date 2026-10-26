"use client";

import Link from "next/link";
import { Card, Empty, ErrorBox, Loading, PageTitle, Tag } from "@/components/ui";
import { api } from "@/lib/api";
import { CATEGORY_LABEL, EQUIPMENT_LABEL, formatDate, formatDateTime } from "@/lib/format";
import type { IssueCategory, IssueEquipment, Reservation } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

interface Dashboard {
  date: string;
  today: { total: number; ongoing: number; upcoming: number; done: number };
  rooms: {
    id: number;
    name: string;
    floor: number;
    capacity: number;
    isActive: boolean;
    reservedMinutes: number;
    reservationRate: number;
    currentAttendees: number;
    currentTitle: string | null;
  }[];
  cancelled: { count: number; items: Reservation[] };
  issues: {
    openCount: number;
    recent: {
      id: number;
      roomName: string | null;
      category: IssueCategory;
      equipment: IssueEquipment | null;
      content: string;
      createdAt: string;
    }[];
  };
}

function hours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}시간${m ? ` ${m}분` : ""}`;
}

export default function AdminDashboardPage() {
  const { data: d, error, loading } = useLoad(() => api<Dashboard>("/admin/dashboard"), []);

  if (loading && !d) return <Loading />;
  if (!d) return <ErrorBox message={error} />;

  const listLink = (status?: string) =>
    `/admin/reservations?date=${d.date}${status ? `&status=${status}` : ""}`;
  const stats = [
    { label: "오늘 예약", value: d.today.total, href: listLink(), tone: "text-foreground" },
    { label: "진행 중", value: d.today.ongoing, href: listLink("ONGOING"), tone: "text-emerald-600" },
    { label: "예정", value: d.today.upcoming, href: listLink("UPCOMING"), tone: "text-blue-600" },
    { label: "완료", value: d.today.done, href: listLink("DONE"), tone: "text-slate-500" },
  ];

  return (
    <>
      <PageTitle title="관리자 현황판" description={`${formatDate(d.date)} 기준 · 숫자를 누르면 해당 목록으로 이동해요.`} />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:border-brand">
              <p className="text-sm text-muted">{s.label}</p>
              <p className={`mt-1 text-3xl font-bold ${s.tone}`}>
                {s.value}
                <span className="ml-0.5 text-base font-medium text-muted">건</span>
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 font-bold">회의실별 오늘 예약률</h2>
          <p className="mb-4 text-xs text-muted">예약된 시간 ÷ 하루 운영 시간(9시간)</p>
          <ul className="space-y-3">
            {d.rooms.map((room) => (
              <li key={room.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">
                    {room.name} {!room.isActive && <Tag tone="amber">점검 중</Tag>}
                  </span>
                  <span className="text-muted">
                    {hours(room.reservedMinutes)} · <b className="text-foreground">{room.reservationRate}%</b>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(room.reservationRate, 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-1 font-bold">지금 사용 현황</h2>
          <p className="mb-4 text-xs text-muted">진행 중인 회의의 참석 인원 / 정원</p>
          <ul className="divide-y divide-line">
            {d.rooms.map((room) => (
              <li key={room.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="font-semibold">{room.name}</span>
                <span className="min-w-0 flex-1 truncate text-right text-muted">
                  {room.currentTitle ?? (room.isActive ? "비어 있음" : "점검 중")}
                </span>
                <span className={`w-28 text-right ${room.currentAttendees ? "font-semibold text-emerald-600" : "text-muted"}`}>
                  정원 {room.capacity}명 중 {room.currentAttendees}명
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">
              오늘 취소 <span className="text-rose-600">{d.cancelled.count}건</span>
            </h2>
            <Link href="/admin/reservations?status=CANCELLED" className="text-sm text-brand hover:underline">
              전체 보기
            </Link>
          </div>
          {d.cancelled.items.length === 0 ? (
            <Empty text="오늘 취소된 예약이 없어요." />
          ) : (
            <ul className="divide-y divide-line text-sm">
              {d.cancelled.items.map((r) => (
                <li key={r.id} className="py-2">
                  <Link href={`/reservations/${r.id}`} className="hover:underline">
                    <b>{r.roomName}</b> {formatDate(r.date)} {r.startTime}~{r.endTime} · {r.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {r.departmentName} {r.reserver?.name} · 취소 {r.cancelledAt && formatDateTime(r.cancelledAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">
              처리 안 된 시설 제보 <span className="text-rose-600">{d.issues.openCount}건</span>
            </h2>
            <Link href="/admin/issues?status=OPEN" className="text-sm text-brand hover:underline">
              제보 관리
            </Link>
          </div>
          {d.issues.recent.length === 0 ? (
            <Empty text="처리할 제보가 없어요." />
          ) : (
            <ul className="divide-y divide-line text-sm">
              {d.issues.recent.map((i) => (
                <li key={i.id} className="py-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <b>{i.roomName}</b>
                    <Tag tone="rose">
                      {CATEGORY_LABEL[i.category]}
                      {i.equipment && ` · ${EQUIPMENT_LABEL[i.equipment]}`}
                    </Tag>
                    <span>{i.content}</span>
                  </div>
                  <p className="text-xs text-muted">{formatDateTime(i.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
