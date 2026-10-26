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
        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
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
  primary: "bg-brand text-white hover:bg-blue-700 disabled:bg-blue-300",
  secondary: "border border-line bg-white text-foreground hover:bg-slate-50 disabled:text-slate-400",
  danger: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 disabled:text-rose-300",
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
      className={`inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${BUTTON_STYLE[variant]} ${className}`}
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
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${BUTTON_STYLE[variant]}`}
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
  tone?: "gray" | "amber" | "violet" | "rose" | "green";
}) {
  const tones = {
    gray: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-800",
    violet: "bg-violet-50 text-violet-700",
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
    <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

export function SuccessBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
