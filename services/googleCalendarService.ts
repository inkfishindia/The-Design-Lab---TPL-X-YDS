import { PendingEvent, CalendarListItem } from '../types';

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const CALENDAR_LIST_API_URL = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';


export const createEvent = async (event: PendingEvent, accessToken: string) => {
  const eventData = {
    summary: event.summary,
    location: event.location,
    description: event.description,
    start: {
      dateTime: event.startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const response = await fetch(CALENDAR_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to create calendar event.');
  }

  return await response.json();
};

export const getEvents = async (accessToken: string, timeMin?: string, timeMax?: string) => {
  const params = new URLSearchParams();
  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);
  params.append('orderBy', 'startTime');
  params.append('singleEvents', 'true');

  const url = `${CALENDAR_API_URL}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to fetch calendar events.');
  }

  const data = await response.json();
  // Return a simplified version of the event data for the AI
  return data.items?.map((event: any) => ({
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      location: event.location,
  })) || [];
};

export const getCalendarList = async (accessToken: string): Promise<CalendarListItem[]> => {
  const response = await fetch(CALENDAR_LIST_API_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Failed to fetch calendar list.');
  }

  const data = await response.json();
  return data.items;
};