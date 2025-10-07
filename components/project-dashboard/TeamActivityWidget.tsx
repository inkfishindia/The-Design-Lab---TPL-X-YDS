
import React from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { SheetUser } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';

const PersonCapacityCard: React.FC<{ person: SheetUser & { utilization?: number }; onClick: () => void; isHighlighted: boolean; }> = ({ person, onClick, isHighlighted }) => {
    const capacity = person.utilization;
    
    const name = person['full_name'] || 'No Name';
    const role = person['role_title'] || 'No Role';
    
    return (
        <Card 
            className={`!p-4 cursor-pointer transition-shadow ${isHighlighted ? 'ring-2 ring-creativity-orange' : 'hover:ring-2 hover:ring-creativity-orange/50'}`} 
            onClick={onClick}
        >
            <h4 className="font-bold text-heritage-blue text-sm">{String(name)}</h4>
            <p className="text-xs text-midnight-navy font-semibold">{String(role)}</p>
            {capacity !== null && typeof capacity !== 'undefined' && (
                <div className="mt-2">
                    <label className="text-xs font-semibold text-midnight-navy/80 capitalize">Utilization</label>
                    <div className="flex items-center gap-3 mt-1">
                        <ProgressBar progress={capacity} />
                        <span className="text-sm font-semibold">{capacity}%</span>
                    </div>
                </div>
            )}
        </Card>
    );
};

interface TeamActivityWidgetProps {
    people: (SheetUser & { utilization?: number })[];
    isLoading: boolean;
    onPersonSelect: (person: SheetUser) => void;
    highlightedPersonId: string | null;
}

export const TeamActivityWidget: React.FC<TeamActivityWidgetProps> = ({ people, isLoading, onPersonSelect, highlightedPersonId }) => {
    const SkeletonLoader = () => (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="!p-4">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="mt-2">
                        <Skeleton className="h-3 w-full" />
                    </div>
                </Card>
            ))}
        </div>
    );
    
    return (
        <Card>
            <h3 className="text-lg font-semibold text-midnight-navy mb-4">Team Capacity</h3>
            {isLoading ? <SkeletonLoader /> : people.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                    {people.map(person => (
                        <PersonCapacityCard 
                            key={person.rowIndex} 
                            person={person} 
                            onClick={() => onPersonSelect(person)} 
                            isHighlighted={String(person['User_id']) === highlightedPersonId}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-midnight-navy/70 py-10">No team data available.</p>
            )}
        </Card>
    );
};
