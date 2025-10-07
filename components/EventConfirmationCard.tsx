
import React from 'react';
import { PendingEvent } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { LocationIcon } from './icons/LocationIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { Button } from './ui/Button';

interface EventConfirmationCardProps {
  event: PendingEvent;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatDateTime = (isoString?: string): string => {
    if (!isoString) return 'Not specified';
    return new Date(isoString).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export const EventConfirmationCard: React.FC<EventConfirmationCardProps> = ({ event, onConfirm, onCancel }) => {
  return (
    <div className="flex justify-start">
        <div className="w-full max-w-xl lg:max-w-2xl bg-accent-orange/10 p-4 rounded-lg border-l-4 border-accent-orange">
            <h3 className="font-semibold text-text-light text-md">Create this event?</h3>
            <div className="mt-3 text-sm text-text-muted space-y-2 border-t border-dark-border pt-3">
                <div className="flex items-start">
                    <CalendarIcon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold text-text-light">{event.summary}</span>
                </div>
                <div className="flex items-start">
                    <ClockIcon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{formatDateTime(event.startDateTime)} to {formatDateTime(event.endDateTime)}</span>
                </div>
                {event.location && (
                <div className="flex items-start">
                    <LocationIcon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{event.location}</span>
                </div>
                )}
                {event.description && (
                     <p className="text-text-muted/80 pt-1 whitespace-pre-wrap italic">"{event.description}"</p>
                )}
            </div>
            <div className="mt-4 flex justify-end space-x-3">
                <Button onClick={onCancel} variant="secondary" size="sm">
                    Cancel
                </Button>
                <Button onClick={onConfirm} variant="primary" className="!bg-success-green hover:!bg-success-green/90 focus:!ring-success-green" size="sm">
                    Confirm & Create
                </Button>
            </div>
        </div>
    </div>
  );
};
