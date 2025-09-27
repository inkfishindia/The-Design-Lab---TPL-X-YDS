export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  description?: string;
}

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface PendingEvent {
  summary: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  description?: string;
}

export interface CalendarListItem {
  id: string;
  summary: string;
  primary?: boolean;
}

export interface TaskList {
  kind: "tasks#taskList";
  id: string;
  title: string;
}

export interface Task {
  kind: "tasks#task";
  id: string;
  title: string;
  status: 'needsAction' | 'completed';
  due?: string;
}

export interface DelegationBriefForSheet {
  task: string;
  assignedTo: string;
  context: string;
  successCriteria: string;
}

export interface GmailMessage {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
}
