


import React, { useMemo } from 'react';
import type { Opportunity } from '../../types';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { motion } from 'framer-motion';

interface OpportunitiesListProps {
  opportunities: Opportunity[];
  isLoading: boolean;
}

const KanbanCard: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
    return (
        <motion.div
            layout
            className="bg-cream text-midnight-navy p-3 rounded-md shadow-sm"
        >
            <p className="font-bold text-heritage-blue text-sm">{String(opportunity['account_fk_resolved'] || opportunity['account_fk'])}</p>
            <p className="text-xs text-midnight-navy/80 mt-1">Lead: {String(opportunity['lead_fk_resolved'] || opportunity['lead_fk'])}</p>
            <p className="text-xs text-midnight-navy/80 mt-1">Owner: {String(opportunity['sdr_owner_fk_resolved'] || 'N/A')}</p>
             <div className="mt-2 text-xs font-semibold">
                MOV: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(opportunity['projected_mov'] || 0))}
            </div>
        </motion.div>
    );
};


export const OpportunitiesList: React.FC<OpportunitiesListProps> = ({ opportunities, isLoading }) => {
  const statuses = useMemo(() => {
    const standardStages = ['Discovery', 'Negotiation/Proposal', 'Converted', 'Closed Lost'];
    
    // FIX: Use reduce to build a Set of stages, which is more robust against type inference issues than map/filter with a type guard in some environments.
    const opportunityStages = opportunities.reduce((acc, o) => {
        const stage = o['sales_stage'];
        if (typeof stage === 'string' && stage) {
            acc.add(stage);
        }
        return acc;
    }, new Set<string>());

    // Start with the standard stages that are present in the data, in their predefined order.
    const orderedStages = standardStages.filter(s => opportunityStages.has(s));
    
    // Find any other stages from the data that are not in the standard list.
    // FIX: Using spread syntax `[...opportunityStages]` is a more modern way to convert a Set to an array and can have better type inference than `Array.from()`.
    const otherStages = [...opportunityStages].filter(s => !standardStages.includes(s));
    
    // Combine them, ensuring standard stages come first.
    return [...orderedStages, ...otherStages];
  }, [opportunities]);

  const opportunitiesByStatus = useMemo(() => {
    // FIX: Corrected invalid index signature syntax `[key: 'string']` to `[key: string]`.
    const grouped: { [key: string]: Opportunity[] } = {};
    statuses.forEach(status => {
      // FIX: The explicit String() conversion and null check were unnecessary and likely causing a type error.
      // Since `statuses` are derived from string values, a direct comparison is safer and cleaner.
      grouped[status] = opportunities.filter(o => o['sales_stage'] === status);
    });
    return grouped;
  }, [opportunities, statuses]);

  if (isLoading) {
      return <div className="text-center text-cream/70">Loading opportunities...</div>
  }

  return (
    <div>
      <h3 className="text-2xl font-bold font-display text-cream mb-6">Opportunities Pipeline</h3>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map(status => (
          <div key={status} className="flex-1 flex flex-col bg-heritage-blue/20 rounded-lg p-3 min-w-[300px]">
            <h4 className="font-semibold text-cream/90 text-sm mb-3 px-1 capitalize">{status.replace(/_/g, ' ')} ({opportunitiesByStatus[status] ? opportunitiesByStatus[status].length : 0})</h4>
            <div className="flex-grow space-y-3 overflow-y-auto">
              {(opportunitiesByStatus[status] || []).map(opp => (
                <KanbanCard key={opp.rowIndex} opportunity={opp} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};