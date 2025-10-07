import React from 'react';
import type { Hub } from '../../types';
import { Skeleton } from '../ui/Skeleton';

const HubCard: React.FC<{ hub: Hub }> = ({ hub }) => (
    <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
        <h5 className="font-bold text-accent-blue">{hub.function_name}</h5>
        <p className="text-sm text-text-light mt-1">{hub['What They Enable']}</p>
        <div className="mt-2 text-xs text-text-muted">
            <p><strong>Owner:</strong> {hub.owner}</p>
            <p><strong>Serves:</strong> {hub.Serves}</p>
        </div>
    </div>
);


interface HubsListProps {
  hubs: Hub[];
  isLoading: boolean;
}

export const HubsList: React.FC<HubsListProps> = ({ hubs, isLoading }) => {
    return (
        <div className="h-full overflow-y-auto pr-4 space-y-4">
            {isLoading ? (
                 [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
            ) : hubs.length > 0 ? (
                hubs.map(hub => <HubCard key={hub.rowIndex} hub={hub} />)
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-center text-text-muted">No hubs found.</p>
                </div>
            )}
        </div>
    );
};