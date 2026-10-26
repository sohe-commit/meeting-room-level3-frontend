"use client";

import { useState } from "react";
import { Button, Card, ErrorBox, PageTitle, SuccessBox } from "@/components/ui";
import { ApiError, api } from "@/lib/api";

interface SeedResult {
  message: string;
  counts: { departments: number; users: number; rooms: number; reservations: number; issues: number };
}

export default function AdminSeedPage() {
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reset() {
    if (!window.confirm("정말 초기화할까요?\n지금까지의 예약과 제보가 모두 지워지고 처음 가상 데이터로 돌아가요.")) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api<SeedResult>("/admin/seed", { method: "POST" }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "초기화하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="데이터 초기화" description="확인용 가상 데이터를 처음 상태로 다시 채워요." />
      <Card className="max-w-2xl space-y-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>부서 6개, 직원 20명, 회의실 5개, 예약(지난 1주 ~ 앞으로 2주), 시설 제보 8건이 다시 만들어져요.</li>
          <li>오늘 예약은 하루 종일 골고루 들어가서 진행 중·예정·완료가 함께 보여요.</li>
          <li>가상 계정 비밀번호는 모두 <b>test1234</b>로 돌아가요. 지금 로그인은 그대로 유지돼요.</li>
          <li>이 과제 전용 공간(meeting_room)의 데이터만 바뀌어요.</li>
        </ul>
        <ErrorBox message={error} />
        {result && (
          <SuccessBox
            message={`${result.message} (예약 ${result.counts.reservations}건, 제보 ${result.counts.issues}건, 직원 ${result.counts.users}명)`}
          />
        )}
        <Button variant="danger" onClick={reset} disabled={busy}>
          {busy ? "초기화하는 중…" : "가상 데이터 다시 채우기"}
        </Button>
      </Card>
    </>
  );
}
