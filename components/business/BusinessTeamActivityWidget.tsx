
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
            className={`!p-4 cursor-pointer transition-shadow ${isHighlighted ? 'ring-2 ring-accent-orange' : 'hover:ring-2 hover:ring-accent-orange/50'}`} 
            onClick={onClick}
        >
            <h4 className="font-bold text-accent-blue text-sm">{String(name)}</h4>
            <p className="text-xs text-text-light font-semibold">{String(role)}</p>
            {capacity !== null && typeof capacity !== 'undefined' && (
                <div className="mt-2">
                    <label className="text-xs font-semibold text-text-muted capitalize">Utilization</label>
                    <div className="flex items-center gap-3 mt-1">
                        <ProgressBar progress={capacity} />
                        <span className="text-sm font-semibold text-text-light">{capacity}%</span>
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

export const BusinessTeamActivityWidget: React.FC<TeamActivityWidgetProps> = ({ people, isLoading, onPersonSelect, highlightedPersonId }) => {
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
            <h3 className="text-lg font-semibold text-text-light mb-4">Team Capacity</h3>
            <div className="h-full overflow-y-auto pr-2">
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
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-sm text-text-muted py-10">No team data available.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
