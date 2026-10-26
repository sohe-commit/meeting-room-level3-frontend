import type {
  DisplayStatus,
  IssueCategory,
  IssueEquipment,
  Room,
} from "./types";

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  UPCOMING: "예정",
  ONGOING: "진행 중",
  DONE: "완료",
  CANCELLED: "취소",
};

export const STATUS_STYLE: Record<DisplayStatus, string> = {
  UPCOMING: "bg-blue-50 text-blue-700 ring-blue-200",
  ONGOING: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DONE: "bg-slate-100 text-slate-600 ring-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const CATEGORY_LABEL: Record<IssueCategory, string> = {
  SUPPLY: "소모품",
  BROKEN: "장비 고장",
  CLEANING: "청소",
  OTHER: "기타",
};

export const EQUIPMENT_LABEL: Record<IssueEquipment, string> = {
  TV: "TV",
  VIDEO_CONF: "화상회의 장비",
  WHITEBOARD: "화이트보드",
  PROJECTOR: "빔프로젝터",
  OTHER: "기타 장비",
};

/** 회의실이 가진 장비 목록 */
export function roomEquipment(room: Room): IssueEquipment[] {
  const list: IssueEquipment[] = [];
  if (room.hasTv) list.push("TV");
  if (room.hasVideoConf) list.push("VIDEO_CONF");
  if (room.hasWhiteboard) list.push("WHITEBOARD");
  if (room.hasProjector) list.push("PROJECTOR");
  return list;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 한국 시간 기준 오늘 (YYYY-MM-DD) */
export function todayKst(): string {
  const k = new Date(Date.now() + 9 * 3600_000);
  return `${k.getUTCFullYear()}-${pad(k.getUTCMonth() + 1)}-${pad(k.getUTCDate())}`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 2026-10-27 → 10월 27일 (화) */
export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${WEEKDAYS[d.getUTCDay()]})`;
}

/** ISO 시각 → 한국 시간 "10월 27일 14:05" */
export function formatDateTime(iso: string): string {
  const k = new Date(new Date(iso).getTime() + 9 * 3600_000);
  return `${k.getUTCMonth() + 1}월 ${k.getUTCDate()}일 ${pad(k.getUTCHours())}:${pad(k.getUTCMinutes())}`;
}

/** 10:00 ~ 19:00, 30분 간격 */
export const TIME_OPTIONS: string[] = Array.from(
  { length: 19 },
  (_, i) => `${pad(10 + Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`,
);

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** 한국 시간 기준 지금이 그 날짜·시각보다 뒤인지 */
export function isPast(date: string, time: string): boolean {
  return new Date(`${date}T${time}:00+09:00`).getTime() <= Date.now();
}
