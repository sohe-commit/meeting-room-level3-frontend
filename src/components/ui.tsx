import Link from "next/link";
import { STATUS_LABEL, STATUS_STYLE } from "@/lib/format";
import type { DisplayStatus, Room } from "@/lib/types";

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

const BUTTON_STYLE = {
  primary: "bg-brand text-white hover:bg-black disabled:bg-stone-400",
  secondary: "border border-line bg-surface text-foreground hover:bg-background disabled:text-subtle",
  ai: "bg-ai text-white hover:bg-[#e64d00] disabled:bg-[#ffb48f]",
  danger: "border border-[#efc6c6] bg-surface text-[#c41c1c] hover:bg-[#fdf3f3] disabled:text-rose-300",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_STYLE;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1 rounded-lg px-[18px] py-2.5 text-[15px] leading-5 font-medium transition disabled:cursor-not-allowed ${BUTTON_STYLE[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof BUTTON_STYLE;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg px-[18px] py-2.5 text-[15px] leading-5 font-medium transition ${BUTTON_STYLE[variant]}`}
    >
      {children}
    </Link>
  );
}

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Tag({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "amber" | "violet" | "rose" | "green" | "ai";
}) {
  const tones = {
    gray: "bg-surface-2 text-foreground",
    amber: "bg-amber-50 text-amber-800",
    violet: "bg-[#eef0ff] text-[#2b31a8]",
    ai: "bg-ai-soft text-[#c24100]",
    rose: "bg-rose-50 text-rose-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`inline-block shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** 회의실 장비 표시 */
export function EquipmentTags({ room }: { room: Room }) {
  const items = [
    room.hasTv && "📺 TV",
    room.hasVideoConf && "🎥 화상회의",
    room.hasWhiteboard && "🖊️ 화이트보드",
    room.hasProjector && "📽️ 빔프로젝터",
  ].filter(Boolean) as string[];
  if (items.length === 0) return <span className="text-xs text-muted">장비 없음</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-[#efc6c6] bg-[#fdf3f3] px-4 py-3 text-sm text-[#a51717]">
      {message}
    </div>
  );
}

export function SuccessBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="rounded-lg border border-[#bfe5cb] bg-[#effaf2] px-4 py-3 text-sm text-[#156b34]">
      {message}
    </div>
  );
}

export function Loading({ text = "불러오는 중이에요…" }: { text?: string }) {
  return <p className="py-10 text-center text-sm text-muted">{text}</p>;
}

export function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-line bg-surface py-10 text-center text-sm text-muted">
      {text}
    </p>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-subtle focus:border-foreground focus:ring-2 focus:ring-foreground/10";
