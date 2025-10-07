

import React, { useState, useEffect, useCallback } from 'react';
import { getEvents, updateEvent, deleteEvent } from '../services/googleCalendarService';
import type { TokenResponse, CalendarEvent } from '../types';
import { LocationIcon } from './icons/LocationIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { Skeleton } from './ui/Skeleton';
import { useToast } from './ui/Toast';
import { Button } from './ui/Button';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Modal } from './ui/Modal';
import { Input, Textarea } from './ui/Input';

interface UpcomingEventsTimelineProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  calendarId: string;
}

const EditEventModal: React.FC<{
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: CalendarEvent) => Promise<void>;
}> = ({ event, isOpen, onClose, onSave }) => {
  const [formState, setFormState] = useState({
    summary: event.summary || '',
    location: event.location || '',
    description: event.description || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setFormState({
        summary: event.summary || '',
        location: event.location || '',
        description: event.description || '',
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ ...event, ...formState });
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Event" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Summary" name="summary" value={formState.summary} onChange={handleChange} required />
        <Input label="Location" name="location" value={formState.location} onChange={handleChange} />
        <Textarea label="Description" name="description" value={formState.description} onChange={handleChange} rows={4} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


const TimelineEvent: React.FC<{ event: CalendarEvent; onEdit: (event: CalendarEvent) => void; onDelete: (eventId: string) => void; }> = ({ event, onEdit, onDelete }) => {
    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const startTime = event.start.dateTime ? formatTime(event.start.dateTime) : "All Day";
    const endTime = event.end.dateTime ? formatTime(event.end.dateTime) : null;
    const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime;

    return (
        <div className="relative group">
            <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 bg-heritage-blue rounded-full border-2 border-cream"></div>
            <div className="pl-4">
                <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => onEdit(event)} variant="secondary" size="sm" className="!p-1.5" title="Edit event">
                        <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => onDelete(event.id)} variant="danger" size="sm" className="!p-1.5" title="Delete event">
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-sm font-bold text-heritage-blue">{timeDisplay}</p>
                <p className="font-semibold text-midnight-navy mt-1 pr-16">{event.summary}</p>
                {event.location && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-midnight-navy/70">
                        <LocationIcon className="w-3 h-3" />
                        <span>{event.location}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const UpcomingEventsTimeline: React.FC<UpcomingEventsTimelineProps> = ({ isAuthenticated, token, calendarId }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const toast = useToast();

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            if (!isAuthenticated || !token) {
                setEvents([]);
                return;
            }

            setIsLoading(true);
            try {
                const now = new Date().toISOString();
                const eventsData = await getEvents(calendarId, token.access_token, now, undefined, 5);
                setEvents(eventsData);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Could not load upcoming events: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUpcomingEvents();
    }, [isAuthenticated, token, calendarId, toast]);

    const handleDelete = async (eventId: string) => {
        if (!token || !window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

        const originalEvents = [...events];
        setEvents(prev => prev.filter(e => e.id !== eventId));

        try {
            await deleteEvent(calendarId, eventId, token.access_token);
            toast.success("Event deleted.");
        } catch (err) {
            setEvents(originalEvents);
            const msg = err instanceof Error ? err.message : 'Unknown error';
            toast.error(`Failed to delete event: ${msg}`);
        }
    };

    const handleUpdate = async (updatedEvent: CalendarEvent) => {
        if (!token) return;
        
        const originalEvents = [...events];
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        setEditingEvent(null);

        try {
            await updateEvent(
                calendarId,
                updatedEvent.id,
                {
                    summary: updatedEvent.summary,
                    location: updatedEvent.location,
                    description: updatedEvent.description
                },
                token.access_token
            );
            toast.success("Event updated!");
        } catch (err) {
            setEvents(originalEvents);
            const msg = err instanceof Error ? err.message : 'Unknown error';
            toast.error(`Failed to update event: ${msg}`);
        }
    };


    const SkeletonLoader = () => (
        <div className="relative pl-5">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-heritage-blue/20"></div>
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="relative pl-4">
                        <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 bg-midnight-navy/10 rounded-full"></div>
                        <Skeleton className="h-5 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-4 h-full overflow-y-auto">
             <div 
                className="sr-only" 
                aria-live="polite" 
                role="status"
             >
                {isLoading ? 'Loading upcoming events.' : `Finished loading ${events.length} events.`}
             </div>
            {!isAuthenticated && (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <CalendarIcon className="w-10 h-10 text-midnight-navy/30" />
                    <p className="mt-2 text-sm text-midnight-navy/60">Sign in to view your upcoming events.</p>
                </div>
            )}
            {isLoading && <SkeletonLoader />}
            
            {isAuthenticated && !isLoading && events.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <CalendarIcon className="w-10 h-10 text-midnight-navy/30" />
                    <p className="mt-2 text-sm text-midnight-navy/60">No upcoming events found.</p>
                </div>
            )}

            {!isLoading && events.length > 0 && (
                <div className="relative pl-5">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-heritage-blue/20"></div>
                    <div className="space-y-6">
                        {events.map((event) => (
                            <TimelineEvent 
                                key={event.id} 
                                event={event} 
                                onEdit={() => setEditingEvent(event)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {editingEvent && (
                <EditEventModal 
                    event={editingEvent}
                    isOpen={!!editingEvent}
                    onClose={() => setEditingEvent(null)}
                    onSave={handleUpdate}
                />
            )}
        </div>
    );
};