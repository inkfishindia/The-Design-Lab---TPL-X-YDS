
import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { Lead } from '../../types';

interface LeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  onLeadSelect: (lead: Lead) => void;
}

type SortConfig = {
    key: string;
    direction: 'ascending' | 'descending';
};

const useSortableData = (items: Lead[], config: SortConfig | null = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};


export const LeadsList: React.FC<LeadsListProps> = ({ leads, isLoading, onLeadSelect }) => {
    const headers = useMemo(() => {
        if (leads.length === 0) return ['Lead Name', 'Company / brand', 'Status', 'Lead category', 'Allocated to'];
        return Object.keys(leads[0]).filter(key => key !== 'rowIndex' && !key.endsWith('_resolved'));
    }, [leads]);
    
    const { items: sortedLeads, requestSort, sortConfig } = useSortableData(leads);
    
    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    const SkeletonLoader = () => (
        <Card className="overflow-x-auto">
            <table className="min-w-full">
                <thead><tr>{headers.map((_, i) => <th key={i} className="p-3"><Skeleton className="h-5 w-full" /></th>)}</tr></thead>
                <tbody>{[...Array(10)].map((_, i) => (<tr key={i} className="border-t border-midnight-navy/10">{headers.map((_, j) => <td key={j} className="p-3"><Skeleton className="h-6 w-full" /></td>)}</tr>))}</tbody>
            </table>
        </Card>
    );

    return (
        <div>
            <h3 className="text-2xl font-bold font-display text-cream mb-6">All Partners</h3>
            {isLoading && <SkeletonLoader />}
            {!isLoading && sortedLeads.length === 0 && <Card><p className="text-center p-8 text-midnight-navy/70">No partners found.</p></Card>}
            {!isLoading && sortedLeads.length > 0 && (
                 <Card className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="border-b border-midnight-navy/20">
                            <tr>{headers.map(header => (<th key={header} className="p-3 font-semibold text-midnight-navy capitalize"><button onClick={() => requestSort(header)} className="flex items-center gap-2">{header.replace(/_/g, ' ')}<span className="opacity-50">{getSortIndicator(header)}</span></button></th>))}</tr>
                        </thead>
                        <tbody>
                            {sortedLeads.map(lead => (
                                <tr key={lead.rowIndex} className="border-t border-midnight-navy/10 hover:bg-midnight-navy/5 cursor-pointer" onClick={() => onLeadSelect(lead)}>
                                    {headers.map(header => (
                                        <td key={header} className="p-3 text-midnight-navy/90 align-middle">
                                            {String(lead[`${header}_resolved`] || lead[header] || '—')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
};