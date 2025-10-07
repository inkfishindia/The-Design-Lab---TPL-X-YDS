import React from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { SheetUser } from '../../types';
import { ClockIcon } from '../icons/ClockIcon';

interface PeopleDirectoryProps {
  isAuthenticated: boolean;
  people: SheetUser[];
  headers: string[];
  isLoading: boolean;
  onPersonSelect: (person: SheetUser) => void;
}

const PersonCard: React.FC<{ person: SheetUser; headers: string[], onClick: () => void }> = ({ person, headers, onClick }) => {
    const capacityHeader = headers.find(h => h.toLowerCase().includes('weekly_hours_capacity'));
    const capacity = capacityHeader ? Number(person[capacityHeader] || 0) : null;
    
    const nameHeader = headers.find(h => h.toLowerCase().includes('full_name'));
    const roleHeader = headers.find(h => h.toLowerCase().includes('role_title'));
    
    const name = nameHeader ? person[nameHeader] : 'No Name';
    const role = roleHeader ? person[roleHeader] : 'No Role';
    const managerName = person.manager?.full_name;

    return (
        <Card className="flex flex-col cursor-pointer hover:ring-2 hover:ring-creativity-orange transition-shadow" onClick={onClick}>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-heritage-blue">{String(name)}</h3>
                <p className="text-sm text-midnight-navy font-semibold">{String(role)}</p>
                {managerName && <p className="text-xs text-midnight-navy/70">Manager: {String(managerName)}</p>}
            </div>
            {capacity !== null && capacityHeader && (
                <div className="mt-4 pt-4 border-t border-midnight-navy/10 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-midnight-navy/60" />
                    <span className="text-sm font-semibold text-midnight-navy/80">{capacity} hours / week</span>
                </div>
            )}
        </Card>
    );
};

export const PeopleDirectory: React.FC<PeopleDirectoryProps> = ({ isAuthenticated, people, headers, isLoading, onPersonSelect }) => {
    
    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="mt-4 pt-4 border-t border-midnight-navy/10">
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <div>
             <h3 className="text-2xl font-bold font-display text-cream mb-6">People Directory</h3>
            {isLoading && <SkeletonLoader />}
            {!isLoading && people.length === 0 && (
                <Card>
                    <p className="text-center p-8 text-midnight-navy/70">No people found in your 'PEOPLE' sheet.</p>
                </Card>
            )}
            {!isLoading && people.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {people.map(person => <PersonCard key={person.rowIndex} person={person} headers={headers} onClick={() => onPersonSelect(person)} />)}
                </div>
            )}
        </div>
    );
};
