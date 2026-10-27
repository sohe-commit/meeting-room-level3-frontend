"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/lib/ai-chat";
import type { ChatMessage } from "@/lib/ai-chat";
import { formatDate } from "@/lib/format";
import type { AiConditions } from "@/lib/types";
import { StatusBadge } from "./ui";

const EXAMPLES = [
  "내일 오후 2시에 6명, 화상회의 필요, 1시간",
  "다음 주 월, 수, 금 10시에 4명 주간 회의",
  "모레 3시에 빔프로젝터로 발표 연습 8명",
];

const NEED_LABEL = { tv: "TV", videoConf: "화상회의", whiteboard: "화이트보드", projector: "빔프로젝터" };

/** AI 표시: 주황 동그라미 안의 반짝이 */
export function AiMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-ai text-foreground"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm7 11l.95 2.55L22.5 16.5l-2.55.95L19 20l-.95-2.55-2.55-.95 2.55-.95L19 13z" />
      </svg>
    </span>
  );
}

function Conditions({ c }: { c: AiConditions }) {
  const needs = (Object.keys(NEED_LABEL) as (keyof typeof NEED_LABEL)[]).filter((k) => c.needs?.[k]);
  const chips = [
    ...(c.dates ?? []).map((d) => `📅 ${formatDate(d)}`),
    c.startTime && `🕑 ${c.startTime}${c.endTime ? `~${c.endTime}` : ""}`,
    c.attendeeCount && `👥 ${c.attendeeCount}명`,
    ...needs.map((k) => NEED_LABEL[k]),
    c.title && `📝 ${c.title}`,
  ].filter(Boolean) as string[];
  if (chips.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="mb-1 text-[11px] text-subtle">AI가 이해한 조건</p>
      <div className="flex flex-wrap gap-1">
        {chips.map((chip) => (
          <span key={chip} className="rounded-md border border-line-soft bg-surface px-1.5 py-0.5 text-[11px] text-muted">
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function AssistantMessage({ m, onNavigate }: { m: ChatMessage; onNavigate: () => void }) {
  const { send, cancel, busy } = useChat();
  const r = m.result;
  const booked = r?.reservations ?? [];
  const active = booked.filter((b) => b.status === "UPCOMING" || b.status === "ONGOING");

  return (
    <div className="flex items-start gap-2">
      <AiMark size={26} />
      <div className="min-w-0 max-w-[85%] space-y-2">
        <div
          className={`rounded-2xl rounded-tl-md px-3.5 py-2.5 text-sm leading-relaxed ${
            m.failed ? "bg-[#fdf3f3] text-[#a51717]" : "bg-background text-foreground"
          }`}
        >
          {r && (r.status === "BOOKED" || r.status === "PARTIAL") ? "✅ " : ""}
          {m.text}
          {r?.interpreted && r.status !== "BOOKED" && r.status !== "PARTIAL" && <Conditions c={r.interpreted} />}
        </div>

        {booked.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <ul className="divide-y divide-line-soft">
              {booked.map((b) => (
                <li key={b.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <StatusBadge status={b.status} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {b.roomName} · {formatDate(b.date)}
                    </span>
                    <span className="block text-xs text-muted">
                      {b.startTime}~{b.endTime} · {b.attendeeCount}명 · {b.title}
                    </span>
                  </span>
                  <Link
                    href={`/reservations/${b.id}`}
                    onClick={onNavigate}
                    className="shrink-0 text-xs font-medium text-foreground underline decoration-line underline-offset-4 hover:decoration-brand"
                  >
                    상세
                  </Link>
                </li>
              ))}
            </ul>
            {active.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-line-soft bg-background/60 px-3 py-2">
                <Link
                  href={`/timeline?date=${active[0].date}`}
                  onClick={onNavigate}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium hover:bg-background"
                >
                  예약표에서 보기
                </Link>
                <button
                  type="button"
                  onClick={() => cancel(m.id, active.map((b) => b.id))}
                  className="rounded-lg border border-[#efc6c6] bg-surface px-2.5 py-1 text-xs font-medium text-[#c41c1c] hover:bg-[#fdf3f3]"
                >
                  {active.length > 1 ? `모두 취소 (${active.length}건)` : "바로 취소"}
                </button>
              </div>
            )}
          </div>
        )}

        {r?.failures && r.failures.length > 0 && booked.length > 0 && (
          <ul className="space-y-1 rounded-xl border border-[#f3dcc0] bg-[#fdf7ef] px-3 py-2 text-xs text-[#8a4b00]">
            {r.failures.map((f) => (
              <li key={f.date}>
                ✕ {formatDate(f.date)} — {f.message}
              </li>
            ))}
          </ul>
        )}

        {r?.suggestions && r.suggestions.length > 0 && (
          <div>
            <p className="mb-1 text-xs text-muted">이 시간은 비어 있어요. 눌러서 바로 예약해요.</p>
            <div className="flex flex-wrap gap-1.5">
              {r.suggestions.map((s) => (
                <button
                  key={s.startTime}
                  type="button"
                  disabled={busy}
                  onClick={() => send(`${formatDate(s.date)} ${s.startTime}~${s.endTime}으로 해 줘`)}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium hover:border-brand disabled:opacity-50"
                >
                  {s.startTime}~{s.endTime} · {s.roomName}
                </button>
              ))}
            </div>
          </div>
        )}

        {m.failed && !m.closes && (
          <Link
            href="/reservations/new"
            onClick={onNavigate}
            className="inline-block text-xs font-medium underline decoration-line underline-offset-4"
          >
            직접 예약하기
          </Link>
        )}
      </div>
    </div>
  );
}

/** AI 예약 대화창. 떠 있는 챗봇과 /ai 화면이 같이 쓴다. */
export function ChatPanel({ onClose, onNavigate }: { onClose?: () => void; onNavigate?: () => void }) {
  const { messages, busy, send, reset } = useChat();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 새 말이 오면 맨 아래로 내린다. (처음 열 때는 바로, 그다음부터는 부드럽게)
  const opened = useRef(false);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: opened.current ? "smooth" : "auto" });
    opened.current = true;
  }, [messages, busy]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(value = text) {
    if (busy || value.trim().length < 2) return;
    setText("");
    send(value);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-line-soft px-4 py-3">
        <AiMark size={32} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight">AI 예약 도우미</p>
          <p className="truncate text-xs text-muted">말하듯이 적으면 빈 회의실을 찾아 바로 예약해요</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-background hover:text-foreground"
          >
            새 대화
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="챗봇 닫기"
            className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div className="flex items-start gap-2">
          <AiMark size={26} />
          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-background px-3.5 py-2.5 text-sm leading-relaxed">
            안녕하세요! 날짜·시간·인원을 알려 주시면 조건에 맞는 빈 회의실을 찾아 바로 예약해 드려요.
            <span className="mt-1 block text-xs text-muted">
              여러 날(최대 5일)도 한 번에 예약할 수 있어요. 부족한 조건은 제가 되물어 볼게요.
            </span>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-start gap-1.5 pl-8">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => submit(ex)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-left text-xs text-foreground hover:border-brand"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-brand px-3.5 py-2.5 text-sm leading-relaxed text-white">
                {m.text}
              </div>
            </div>
          ) : (
            <AssistantMessage key={m.id} m={m} onNavigate={onNavigate ?? (() => {})} />
          ),
        )}

        {busy && (
          <div className="flex items-center gap-2">
            <AiMark size={26} />
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-background px-3.5 py-3" aria-label="AI가 답하는 중">
              {[0, 150, 300].map((delay) => (
                <i
                  key={delay}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-subtle"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        className="border-t border-line-soft p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-end gap-2 rounded-xl border border-line bg-surface p-1.5 pl-3 focus-within:border-brand">
          <textarea
            ref={inputRef}
            rows={1}
            maxLength={300}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter 로 보내고, Shift+Enter 는 줄바꿈. 한글 조합 중에는 보내지 않는다.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="예: 내일 2시에 4명 1시간"
            className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-subtle"
          />
          <button
            type="submit"
            disabled={busy || text.trim().length < 2}
            aria-label="보내기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ai text-foreground transition hover:bg-ai-hover disabled:bg-ai-soft disabled:text-subtle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-subtle">AI 예약도 직접 예약과 같은 규칙(10~19시, 최대 3시간 등)을 지켜요.</p>
      </form>
    </div>
  );
}
