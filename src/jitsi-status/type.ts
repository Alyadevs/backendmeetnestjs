export interface ProsodyRoom {
  jid: string;
  name: string;
  participants: number;
}

export interface LiveParticipant {
  id: string;
  displayName: string;
  roomName: string;
  joinedAt: Date;
  avatarUrl?: string;
  audioMuted: boolean;
  videoMuted: boolean;
}

export interface LiveRoom {
  roomName: string;
  jid: string;
  participantCount: number;
  startedAt: Date;
  participants: LiveParticipant[];
}

// ─── Événements WebSocket (NestJS → React) ────────────────────────────────────
export enum WsEvent {
  ROOMS_UPDATE = 'rooms:update',
  ROOM_CREATED = 'room:created',
  ROOM_CLOSED = 'room:closed',
  PARTICIPANT_JOIN = 'participant:join',
  PARTICIPANT_LEAVE = 'participant:leave',
  STATS_UPDATE = 'stats:update',
  HISTORY_UPDATE = 'history:update',
}

export interface DashboardStats {
  activeRooms: number;
  totalParticipants: number;
  totalMeetingsToday: number;
  totalMeetingsAllTime: number;
  avgDurationMinutes: number;
}
