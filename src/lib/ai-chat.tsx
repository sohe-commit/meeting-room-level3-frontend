"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, api } from "./api";
import { useAuth } from "./auth";
import type { AiResult, Reservation } from "./types";
import { RESERVATIONS_CHANGED } from "./use-load";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  result?: AiResult;
  /** 서버에 닿지 못했을 때 (대화 맥락에는 넣지 않는다) */
  failed?: boolean;
  /** 이 말로 대화 하나가 끝났다 (예약·취소 뒤). 다음 말부터 새 대화로 본다. */
  closes?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  busy: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  send: (text: string) => Promise<void>;
  cancel: (messageId: number, reservationIds: number[]) => Promise<void>;
  reset: () => void;
}

const MAX_HISTORY = 12;
const ChatContext = createContext<ChatState | null>(null);

/** 예약까지 끝난 대화는 다음 요청의 맥락에서 뺀다. */
function historyOf(messages: ChatMessage[]) {
  let start = 0;
  messages.forEach((m, i) => {
    if (m.closes) start = i + 1;
  });
  return messages
    .slice(start)
    .filter((m) => !m.failed)
    .map((m) => ({ role: m.role, content: m.text }))
    .slice(-MAX_HISTORY);
}

function storageKey(userId: number) {
  return `meeting-room-chat-${userId}`;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // 새로고침해도 대화가 남도록 이 탭 안에서만 보관한다.
    try {
      const saved = sessionStorage.getItem(storageKey(userId));
      return saved ? (JSON.parse(saved) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const nextId = useRef(messages.reduce((max, m) => Math.max(max, m.id), 0) + 1);
  const latest = useRef(messages);

  useEffect(() => {
    latest.current = messages;
    try {
      sessionStorage.setItem(storageKey(userId), JSON.stringify(messages.slice(-40)));
    } catch {
      // 저장이 막힌 브라우저에서는 이번 화면에서만 대화를 기억한다.
    }
  }, [messages, userId]);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (text.length < 2) return;
    const history = historyOf(latest.current);
    const userMsg: ChatMessage = { id: nextId.current++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);
    try {
      const result = await api<AiResult>("/ai/reserve", { method: "POST", body: { text, history } });
      const done = result.status === "BOOKED" || result.status === "PARTIAL";
      // 예약이 끝났으면 다음 말은 새 대화로 시작한다.
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "assistant", text: result.message, result, closes: done },
      ]);
      if (done) window.dispatchEvent(new Event(RESERVATIONS_CHANGED));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "AI 예약을 하지 못했어요.";
      setMessages((prev) => [
        ...prev.map((m) => (m.id === userMsg.id ? { ...m, failed: true } : m)),
        { id: nextId.current++, role: "assistant", text: message, failed: true },
      ]);
    } finally {
      setBusy(false);
    }
  }, []);

  const cancel = useCallback(async (messageId: number, reservationIds: number[]) => {
    const updated: Reservation[] = [];
    let error: string | null = null;
    for (const id of reservationIds) {
      try {
        updated.push(await api<Reservation>(`/reservations/${id}/cancel`, { method: "PATCH" }));
      } catch (err) {
        error = err instanceof ApiError ? err.message : "취소하지 못했어요.";
      }
    }
    setMessages((prev) => [
      ...prev.map((m) =>
        m.id === messageId && m.result
          ? {
              ...m,
              result: {
                ...m.result,
                reservations: m.result.reservations?.map((r) => updated.find((u) => u.id === r.id) ?? r),
              },
            }
          : m,
      ),
      {
        id: nextId.current++,
        role: "assistant",
        text: error ?? `예약 ${updated.length}건을 취소했어요. 다른 조건으로 다시 말해 주세요.`,
        failed: !!error,
        closes: true,
      },
    ]);
    if (updated.length > 0) window.dispatchEvent(new Event(RESERVATIONS_CHANGED));
  }, []);

  const reset = useCallback(() => setMessages([]), []);

  const value = useMemo(
    () => ({ messages, busy, open, setOpen, send, cancel, reset }),
    [messages, busy, open, send, cancel, reset],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatState {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("ChatProvider 안에서만 쓸 수 있어요.");
  return ctx;
}
