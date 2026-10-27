"use client";

import { useEffect } from "react";
import { useChat } from "@/lib/ai-chat";
import { ChatPanel } from "./ChatPanel";

/** 화면 오른쪽 아래에 떠 있는 AI 예약 챗봇. 휴대폰에서는 화면 전체로 열린다. */
export function ChatWidget() {
  const { open, setOpen, busy } = useChat();

  // Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="AI 예약 도우미"
          className="fixed inset-0 z-40 bg-surface sm:inset-auto sm:right-5 sm:bottom-24 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-line sm:shadow-[0_12px_40px_rgba(17,17,17,0.14)]"
        >
          <ChatPanel
            onClose={() => setOpen(false)}
            // 휴대폰에서는 챗봇이 화면을 다 덮으니, 다른 화면으로 갈 때 닫는다.
            onNavigate={() => window.innerWidth < 640 && setOpen(false)}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "AI 예약 도우미 닫기" : "AI 예약 도우미 열기"}
        title="AI 예약 도우미"
        className={`fixed right-5 bottom-5 z-40 h-14 w-14 items-center justify-center rounded-full bg-ai text-white shadow-[0_6px_20px_rgba(255,86,0,0.35)] transition hover:scale-105 hover:bg-[#e64d00] ${
          open ? "hidden sm:flex" : "flex"
        }`}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 3C6.98 3 3 6.58 3 11c0 2.13.93 4.06 2.45 5.5L4.5 21l4.36-2.18c.98.27 2.03.43 3.14.43 5.02 0 9-3.58 9-8.25S17.02 3 12 3z" />
            </svg>
            {busy && <span className="absolute top-1 right-1 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-foreground" />}
          </>
        )}
      </button>
    </>
  );
}

/** 상단 메뉴의 "AI 예약": 화면을 옮기지 않고 챗봇을 연다. */
export function AiMenuButton({ className }: { className: string }) {
  const { setOpen } = useChat();
  return (
    <button type="button" onClick={() => setOpen(true)} className={className}>
      <i className="h-1.5 w-1.5 rounded-full bg-ai" aria-hidden />
      AI 예약
    </button>
  );
}
