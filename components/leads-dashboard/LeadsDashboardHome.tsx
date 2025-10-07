

import React from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

interface LeadsDashboardHomeProps {
  isLoading: boolean;
}

export const LeadsDashboardHome: React.FC<LeadsDashboardHomeProps> = ({ isLoading }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold font-display text-cream mb-6">Leads Dashboard</h3>
      <Card>
        <div className="p-8 text-center text-midnight-navy/70">
          <p>Leads Dashboard coming soon.</p>
          <p className="text-sm">This area will feature key performance indicators, conversion funnels, and activity summaries.</p>
        </div>
      </Card>
    </div>
  );
};
