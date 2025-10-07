import React, { useMemo } from 'react';

interface GoogleCalendarEmbedProps {
  calendarId: string;
  refreshKey: number;
}

export const GoogleCalendarEmbed: React.FC<GoogleCalendarEmbedProps> = ({ calendarId, refreshKey }) => {

  const calendarSrc = useMemo(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const encodedCalendarId = encodeURIComponent(calendarId);
      const encodedTimeZone = encodeURIComponent(timeZone);
      return `https://calendar.google.com/calendar/embed?height=600&wkst=1&mode=WEEK&ctz=${encodedTimeZone}&bgcolor=%23FDF6E3&src=${encodedCalendarId}&color=%23144A87`;
    } catch (e) {
      console.error("Failed to generate calendar URL", e);
      return `https://calendar.google.com/calendar/embed?mode=WEEK&src=${encodeURIComponent(calendarId)}`;
    }
  }, [calendarId]);

  return (
    <div className="w-full h-full p-4">
      <iframe
        key={`${calendarId}-${refreshKey}`}
        className="w-full h-full border border-midnight-navy/10 rounded-lg shadow-inner bg-cream"
        src={calendarSrc}
        title="Google Calendar Embed"
      ></iframe>
    </div>
  );
};