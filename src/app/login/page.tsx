"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ErrorBox, Field, inputClass } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/rooms";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(target);
  }, [ready, user, router, target]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace(target);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand">🗓️ 회의실 예약</h1>
        <p className="mb-6 text-center text-sm text-muted">(주)가상테크 사내 회의실 예약 시스템</p>
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-line bg-surface p-6" noValidate>
          <Field label="이메일">
            <input
              className={inputClass}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="비밀번호">
            <input
              className={inputClass}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <ErrorBox message={error} />
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "로그인 중…" : "로그인"}
          </Button>
        </form>
        <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-xs leading-relaxed text-muted">
          <p className="mb-1 font-semibold text-foreground">확인용 가상 계정 (비밀번호 test1234)</p>
          <p>관리자: admin@example.com</p>
          <p>직원: user@example.com</p>
          <p className="mt-1">화면의 모든 이름·연락처는 가상 데이터예요.</p>
        </div>
      </div>
    </div>
  );
}
