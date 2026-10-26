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

export interface Reservation {
  id: number;
  roomId: number;
  roomName: string | null;
  roomFloor: number | null;
  title: string;
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
