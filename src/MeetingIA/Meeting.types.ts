export interface MeetingData {
  meeting_id: string;
  date: string;
  room?: string;
  participants: string[];
  transcripts: string[];
  summary?: string;
  decisions: string[];
  action_items: string[];
  important_dates: string[];
  keywords: string[];
  total_exchanges: number;
  duration_minutes: number;
  status: 'completed' | 'in_progress';
  saved_at: Date;
}

export interface TranscriptPayload {
  meeting_id: string;
  room?: string;
  participants: string[];
  transcripts: string[];
  duration_minutes: number;
}