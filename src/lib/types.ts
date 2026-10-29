export type Role = "ADMIN" | "EMPLOYEE";
export type DisplayStatus = "UPCOMING" | "ONGOING" | "DONE" | "CANCELLED";
export type IssueCategory = "SUPPLY" | "BROKEN" | "CLEANING" | "OTHER";
export type IssueEquipment = "TV" | "VIDEO_CONF" | "WHITEBOARD" | "PROJECTOR" | "OTHER";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  departmentId: number;
  departmentName: string | null;
}

export interface Department {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  name: string;
  floor: number;
  capacity: number;
  hasTv: boolean;
  hasVideoConf: boolean;
  hasWhiteboard: boolean;
  hasProjector: boolean;
  isActive: boolean;
  openIssueCount?: number;
}

/** 회의 유형: 일반 회의 / 교육·행사 (3시간을 넘기는 교육·행사는 관리자만) */
export type MeetingType = "MEETING" | "TRAINING";

export interface Reservation {
  id: number;
  roomId: number;
  roomName: string | null;
  roomFloor: number | null;
  title: string;
  meetingType: MeetingType;
  attendeeCount: number;
  date: string;
  startTime: string;
  endTime: string;
  status: DisplayStatus;
  createdVia: "MANUAL" | "AI";
  cancelledAt: string | null;
  createdAt: string;
  departmentName: string | null;
  isMine: boolean;
  reserver: { name: string; email: string; phone: string } | null;
}

export interface RoomIssue {
  id: number;
  roomId: number;
  roomName: string | null;
  category: IssueCategory;
  equipment: IssueEquipment | null;
  content: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  resolvedAt: string | null;
  writerName: string | null;
  writerDepartment: string | null;
}

export interface RoomDetail extends Room {
  date: string;
  reservations: Reservation[];
  openIssues: RoomIssue[];
}

export interface Timeline {
  date: string;
  rooms: (Room & { reservations: Reservation[] })[];
}

/** AI 예약 결과 (POST /ai/reserve) */
/** AI가 읽은 예약 한 건의 날짜·시간 */
export interface AiSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface AiConditions {
  slots: AiSlot[];
  attendeeCount: number | null;
  needs: { tv: boolean; videoConf: boolean; whiteboard: boolean; projector: boolean };
  title: string | null;
}

export interface AiResult {
  status: "BOOKED" | "PARTIAL" | "NEED_MORE" | "REJECTED" | "NO_ROOM";
  message: string;
  interpreted?: AiConditions;
  reservations?: Reservation[];
  failures?: (AiSlot & { message: string })[];
  suggestions?: { date: string; startTime: string; endTime: string; roomName: string }[];
  /** 오늘 AI 예약을 쓴 횟수 (하루 한도 R16) */
  usage?: { used: number; limit: number };
}
