"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Card, Empty, ErrorBox, Loading, PageTitle, SuccessBox, Tag, inputClass } from "@/components/ui";
import { ApiError, api, query } from "@/lib/api";
import { CATEGORY_LABEL, EQUIPMENT_LABEL, formatDateTime } from "@/lib/format";
import type { IssueCategory, IssueEquipment, Room, RoomIssue } from "@/lib/types";
import { useLoad } from "@/lib/use-load";

export default function AdminIssuesPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = {
    roomId: params.get("roomId") ?? "",
    category: params.get("category") ?? "",
    equipment: params.get("equipment") ?? "",
    status: params.get("status") ?? "",
  };
  const search = query(filters);
  const { data: rooms } = useLoad(() => api<Room[]>("/rooms"), []);
  const { data, error, loading, reload } = useLoad(() => api<RoomIssue[]>(`/issues${search}`), [search]);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function update(patch: Partial<typeof filters>) {
    router.replace(`${pathname}${query({ ...filters, ...patch })}`);
  }

  async function resolve(issue: RoomIssue) {
    if (!window.confirm(`'${issue.content}' 제보를 처리 완료로 바꿀까요?\n처리 완료는 되돌릴 수 없어요.`)) return;
    setMessage(null);
    setActionError(null);
    try {
      await api(`/issues/${issue.id}/resolve`, { method: "PATCH" });
      setMessage("처리 완료로 바꿨어요.");
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "바꾸지 못했어요.");
    }
  }

  return (
    <>
      <PageTitle title="시설 제보 관리" description="직원들이 남긴 제보를 확인하고, 해결했으면 처리 완료로 바꿔요." />
      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select className={inputClass} value={filters.status} onChange={(e) => update({ status: e.target.value })} aria-label="처리 여부">
            <option value="">처리 여부 전체</option>
            <option value="OPEN">처리 전</option>
            <option value="RESOLVED">처리 완료</option>
          </select>
          <select className={inputClass} value={filters.roomId} onChange={(e) => update({ roomId: e.target.value })} aria-label="회의실">
            <option value="">모든 회의실</option>
            {rooms?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select className={inputClass} value={filters.category} onChange={(e) => update({ category: e.target.value })} aria-label="분류">
            <option value="">모든 분류</option>
            {(Object.keys(CATEGORY_LABEL) as IssueCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <select className={inputClass} value={filters.equipment} onChange={(e) => update({ equipment: e.target.value })} aria-label="장비">
            <option value="">모든 장비</option>
            {(Object.keys(EQUIPMENT_LABEL) as IssueEquipment[]).map((eq) => (
              <option key={eq} value={eq}>
                {EQUIPMENT_LABEL[eq]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="mb-3 space-y-2">
        <SuccessBox message={message} />
        <ErrorBox message={actionError ?? error} />
      </div>

      {loading && !data ? (
        <Loading />
      ) : data && data.length === 0 ? (
        <Empty text="조건에 맞는 제보가 없어요." />
      ) : (
        <ul className="space-y-2">
          {data?.map((issue) => (
            <li key={issue.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3 sm:p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {issue.status === "OPEN" ? <Tag tone="rose">처리 전</Tag> : <Tag tone="green">처리 완료</Tag>}
                  <b>{issue.roomName}</b>
                  <Tag>
                    {CATEGORY_LABEL[issue.category]}
                    {issue.equipment && ` · ${EQUIPMENT_LABEL[issue.equipment]}`}
                  </Tag>
                  <span className="text-sm">{issue.content}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {issue.writerDepartment} {issue.writerName} · {formatDateTime(issue.createdAt)}
                  {issue.resolvedAt && ` · 처리 ${formatDateTime(issue.resolvedAt)}`}
                </p>
              </div>
              {issue.status === "OPEN" && <Button onClick={() => resolve(issue)}>처리 완료</Button>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
