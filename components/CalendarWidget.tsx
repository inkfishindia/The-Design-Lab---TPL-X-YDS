import React from 'react';
import { TokenResponse } from '../types';
import { UpcomingEventsTimeline } from './UpcomingEventsTimeline';
import { GoogleCalendarEmbed } from './GoogleCalendarEmbed';

interface CalendarWidgetProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  calendarId: string;
  refreshKey: number;
  view: 'timeline' | 'full';
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  isAuthenticated,
  token,
  calendarId,
  refreshKey,
  view,
}) => {
  return (
    <div className="flex flex-col h-full bg-cream text-midnight-navy">
      <div className="flex-grow">
        {view === 'timeline' ? (
          <UpcomingEventsTimeline 
            isAuthenticated={isAuthenticated} 
            token={token}
            calendarId={calendarId}
            key={refreshKey}
          />
        ) : (
          <GoogleCalendarEmbed 
            calendarId={calendarId} 
            refreshKey={refreshKey}
          />
        )}
      </div>
    </div>
  );
};