
import React, { useState, useEffect, useCallback } from 'react';
import { getEvents } from '../../services/googleCalendarService';
import type { TokenResponse, CalendarEvent } from '../../types';
import { LocationIcon } from '../icons/LocationIcon';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';

interface CalendarTimelineProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
}

const TimelineEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const startTime = event.start.dateTime ? formatTime(event.start.dateTime) : "All Day";
    const endTime = event.end.dateTime ? formatTime(event.end.dateTime) : null;

    const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime;

    return (
        <div className="relative">
            <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 bg-accent-blue rounded-full border-2 border-dark-surface"></div>
            <div className="pl-4">
                <p className="text-sm font-bold text-accent-blue">
                    {timeDisplay}
                </p>
                <p className="font-semibold text-text-light mt-1">{event.summary}</p>
                {event.location && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                        <LocationIcon className="w-3 h-3" />
                        <span>{event.location}</span>
                    </div>
                )}
            </div>
        </div>
    );
};


export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({ isAuthenticated, token }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const fetchTodaysEvents = async () => {
            if (!isAuthenticated || !token) {
                setEvents([]);
                return;
            }

            setIsLoading(true);
            try {
                const today = new Date();
                const timeMin = new Date(today.setHours(0, 0, 0, 0)).toISOString();
                const timeMax = new Date(today.setHours(23, 59, 59, 999)).toISOString();

                const eventsData = await getEvents('primary', token.access_token, timeMin, timeMax);
                setEvents(eventsData);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Could not load calendar events: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTodaysEvents();
    }, [isAuthenticated, token, toast]);

    const SkeletonLoader = () => (
        <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-accent-blue/20"></div>
            <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="relative">
                        <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 bg-accent-blue/20 rounded-full border-2 border-dark-surface"></div>
                        <div className="pl-4">
                            <Skeleton className="h-5 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full p-6">
            {!isAuthenticated && <p className="text-center text-sm text-text-muted pt-8">Sign in to view your calendar timeline.</p>}
            {isLoading && <SkeletonLoader />}
            {isAuthenticated && !isLoading && events.length === 0 && <p className="text-center text-sm text-text-muted pt-8">No events scheduled for today.</p>}

            {!isLoading && events.length > 0 && (
                <div className="relative pl-8">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-accent-blue/20"></div>
                    <div className="space-y-6">
                        {events.map((event) => <TimelineEvent key={event.id} event={event} />)}
                    </div>
                </div>
            )}
        </div>
    );
};
