

import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { Campaign } from '../../types';
import { Badge } from '../ui/Badge';

interface CampaignsListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  headers: string[];
}

const renderCellContent = (campaign: Campaign, header: string) => {
    const resolvedValue = campaign[`${header}_resolved`];
    if (resolvedValue) {
        return <span title={`ID: ${campaign[header]}`}>{String(resolvedValue)}</span>;
    }

    const value = campaign[header];
    if (value === null || value === undefined || String(value).trim() === '') return <span className="text-midnight-navy/50">—</span>;
    
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes('status')) {
         const lowerStatus = String(value).toLowerCase();
        let color: 'green' | 'blue' | 'gray' | 'yellow' = 'gray';
        if (lowerStatus === 'active') color = 'blue';
        else if (lowerStatus === 'completed') color = 'green';
        else if (lowerStatus === 'planning') color = 'yellow';
        return <Badge color={color}>{String(value)}</Badge>;
    }
    
    return String(value);
};

export const CampaignsList: React.FC<CampaignsListProps> = ({ campaigns, isLoading, headers: passedHeaders }) => {
    const headers = useMemo(() => {
        const headersFromData = campaigns.length > 0 
            ? Object.keys(campaigns[0]) 
            : passedHeaders;
        return headersFromData.filter(key => key !== 'rowIndex' && !key.endsWith('_resolved'));
    }, [campaigns, passedHeaders]);
    
    const SkeletonLoader = () => (
        <Card className="overflow-x-auto">
            <table className="min-w-full">
                <thead><tr>{headers.map((header, i) => <th key={i} className="p-3"><Skeleton className="h-5 w-full" /></th>)}</tr></thead>
                <tbody>{[...Array(10)].map((_, i) => (<tr key={i} className="border-t border-midnight-navy/10">{headers.map((_, j) => <td key={j} className="p-3"><Skeleton className="h-6 w-full" /></td>)}</tr>))}</tbody>
            </table>
        </Card>
    );

    return (
        <div>
            <h3 className="text-2xl font-bold font-display text-cream mb-6">All Campaigns</h3>
            {isLoading && <SkeletonLoader />}
            {!isLoading && campaigns.length === 0 && <Card><p className="text-center p-8 text-midnight-navy/70">No campaign data found.</p></Card>}
            {!isLoading && campaigns.length > 0 && (
                 <Card className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="border-b border-midnight-navy/20">
                            <tr>{headers.map(header => (<th key={header} className="p-3 font-semibold text-midnight-navy capitalize">{header.replace(/_/g, ' ')}</th>))}</tr>
                        </thead>
                        <tbody>
                            {campaigns.map(campaign => (
                                <tr key={campaign.rowIndex} className="border-t border-midnight-navy/10 hover:bg-midnight-navy/5">
                                    {headers.map(header => (
                                        <td key={header} className="p-3 text-midnight-navy/90 align-middle">
                                            {renderCellContent(campaign, header)}
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