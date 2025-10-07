import { PendingEvent, CalendarListItem, CalendarEvent } from '../types';

const CALENDAR_API_BASE_URL = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_LIST_API_URL = `${CALENDAR_API_BASE_URL}/users/me/calendarList`;


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

  const response = await fetch(`${CALENDAR_API_BASE_URL}/calendars/primary/events`, {
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

export const getEvents = async (calendarId: string, accessToken: string, timeMin?: string, timeMax?: string, maxResults?: number): Promise<CalendarEvent[]> => {
  const params = new URLSearchParams();
  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);
  if (maxResults) params.append('maxResults', String(maxResults));
  params.append('orderBy', 'startTime');
  params.append('singleEvents', 'true');

  const url = `${CALENDAR_API_BASE_URL}/calendars/${calendarId}/events?${params.toString()}`;

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
  // Return a more detailed version of the event data for UI components
  return data.items?.map((event: any): CalendarEvent => ({
      id: event.id,
      summary: event.summary,
      start: {
        dateTime: event.start.dateTime,
        date: event.start.date,
        timeZone: event.start.timeZone,
      },
      end: {
        dateTime: event.end.dateTime,
        date: event.end.date,
        timeZone: event.end.timeZone,
      },
      location: event.location,
      description: event.description,
  })) || [];
};

export const updateEvent = async (
    calendarId: string,
    eventId: string,
    eventData: Partial<Pick<CalendarEvent, 'summary' | 'location' | 'description'>>,
    accessToken: string
): Promise<CalendarEvent> => {
    const response = await fetch(`${CALENDAR_API_BASE_URL}/calendars/${calendarId}/events/${eventId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to update calendar event.');
    }
    return response.json();
};

export const deleteEvent = async (calendarId: string, eventId: string, accessToken: string): Promise<void> => {
    const response = await fetch(`${CALENDAR_API_BASE_URL}/calendars/${calendarId}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (response.status !== 204) {
        let errorData;
        try {
            errorData = await response.json();
        } catch(e) {
            throw new Error('Failed to delete event.');
        }
        throw new Error(errorData?.error?.message || 'Failed to delete event.');
    }
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