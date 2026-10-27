"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChatProvider } from "@/lib/ai-chat";
import { useAuth } from "@/lib/auth";
import { AiMenuButton, ChatWidget } from "./ChatWidget";
import { Button, Loading } from "./ui";

const MENU = [
  { href: "/rooms", label: "회의실" },
  { href: "/timeline", label: "예약표" },
  { href: "/my", label: "내 예약" },
];

const ADMIN_MENU = [
  { href: "/admin", label: "현황판" },
  { href: "/admin/rooms", label: "회의실 관리" },
  { href: "/admin/reservations", label: "전체 예약" },
  { href: "/admin/issues", label: "제보 관리" },
  { href: "/admin/seed", label: "데이터 초기화" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, offline, retry, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";
  const loggingOut = useRef(false);

  // 로그인하지 않았으면 로그인 화면으로. (직접 로그아웃한 경우에는 보던 화면을 기억하지 않는다)
  useEffect(() => {
    if (ready && !user && !offline && !isLogin) {
      router.replace(loggingOut.current ? "/login" : `/login?next=${encodeURIComponent(pathname)}`);
    }
    if (user) loggingOut.current = false;
  }, [ready, user, offline, isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;
  if (offline) {
    return (
      <div className="mx-auto mt-24 max-w-sm px-4 text-center">
        <p className="mb-1 font-semibold">서버에 연결할 수 없어요.</p>
        <p className="mb-4 text-sm text-muted">서버가 잠들어 있었다면 깨어나는 데 30초쯤 걸릴 수 있어요.</p>
        <Button onClick={retry}>
          다시 시도
        </Button>
      </div>
    );
  }
  if (!ready || !user) return <Loading />;

  const isAdminPage = pathname.startsWith("/admin");
  // href 가 null 이면 화면 이동이 아닌 버튼 (AI 예약 챗봇 열기)
  const linkClass = (href: string | null) =>
    `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      href && isActive(pathname, href)
        ? "bg-surface text-foreground ring-1 ring-line"
        : "text-muted hover:text-foreground"
    }`;

  return (
    <ChatProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
            <Link href="/rooms" className="shrink-0 text-base font-semibold tracking-tight text-foreground">
              🗓️ 회의실 예약
            </Link>
            <nav className="hidden flex-1 gap-1 md:flex">
              {MENU.map((m) => (
                <Link key={m.href} href={m.href} className={linkClass(m.href)}>
                  {m.label}
                </Link>
              ))}
              <AiMenuButton className={linkClass(null)} />
            </nav>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <span className="hidden text-muted sm:inline">
                {user.departmentName} · <b>{user.name}</b>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.role === "ADMIN" ? "bg-foreground text-white" : "bg-surface-2 text-muted"
                }`}
              >
                {user.role === "ADMIN" ? "관리자" : "직원"}
              </span>
              <button
                onClick={() => {
                  loggingOut.current = true;
                  logout();
                }}
                className="rounded-lg px-2 py-1 text-subtle hover:bg-surface-2"
              >
                로그아웃
              </button>
            </div>
          </div>
          {/* 휴대폰: 메뉴를 가로로 밀어서 보기 */}
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 md:hidden">
            {MENU.map((m) => (
              <Link key={m.href} href={m.href} className={linkClass(m.href)}>
                {m.label}
              </Link>
            ))}
            <AiMenuButton className={linkClass(null)} />
          </nav>
          {user.role === "ADMIN" && (
            <div className="border-t border-line bg-surface-2/60">
              <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5">
                <span className="mr-1 shrink-0 text-xs font-semibold text-foreground">관리자</span>
                {ADMIN_MENU.map((m) => (
                  <Link key={m.href} href={m.href} className={linkClass(m.href)}>
                    {m.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-28">
          {isAdminPage && user.role !== "ADMIN" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
              관리자만 사용할 수 있는 기능이에요.
            </div>
          ) : (
            children
          )}
        </main>
        {/* AI 예약 챗봇: 모든 화면 오른쪽 아래 */}
        <ChatWidget />
      </div>
    </ChatProvider>
  );
}
