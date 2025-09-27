import React, { useState, useMemo, useEffect } from 'react';
import { CalendarListItem } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface GoogleCalendarEmbedProps {
  calendarId: string;
  setCalendarId: (id: string) => void;
  refreshKey: number;
  isAuthenticated: boolean;
  calendarList: CalendarListItem[];
}

export const GoogleCalendarEmbed: React.FC<GoogleCalendarEmbedProps> = ({ calendarId, setCalendarId, refreshKey, isAuthenticated, calendarList }) => {
  const [inputId, setInputId] = useState(calendarId);

  useEffect(() => {
    setInputId(calendarId);
  }, [calendarId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputId.trim()) {
      setCalendarId(inputId.trim());
    }
  };

  const calendarSrc = useMemo(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const encodedCalendarId = encodeURIComponent(calendarId);
      const encodedTimeZone = encodeURIComponent(timeZone);
      return `https://calendar.google.com/calendar/embed?height=600&wkst=1&mode=WEEK&ctz=${encodedTimeZone}&bgcolor=%23FDF6E3&src=${encodedCalendarId}&color=%23144A87`;
    } catch (e) {
      return `https://calendar.google.com/calendar/embed?mode=WEEK&src=${encodeURIComponent(calendarId)}`;
    }
  }, [calendarId]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-4 border-b border-midnight-navy/10 flex-shrink-0">
        {isAuthenticated && calendarList.length > 0 ? (
          <div>
            <Select
              id="calendar-select"
              label="Select a calendar to view:"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
            >
              {calendarList.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.summary}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          !isAuthenticated && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-grow">
                 <Input
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    placeholder="Enter Google Calendar ID"
                  />
              </div>
              <Button type="submit" variant="secondary">Load</Button>
            </form>
          )
        )}
      </div>
      <div className="flex-grow p-4">
        <iframe
          key={`${calendarId}-${refreshKey}`}
          className="w-full h-full border-0"
          src={calendarSrc}
          title="Google Calendar Embed"
        ></iframe>
      </div>
    </div>
  );
};