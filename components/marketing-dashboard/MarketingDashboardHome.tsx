
import React from 'react';
import { Card } from '../ui/Card';

interface MarketingDashboardHomeProps {
  isLoading: boolean;
}

export const MarketingDashboardHome: React.FC<MarketingDashboardHomeProps> = ({ isLoading }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold font-display text-cream mb-6">Marketing Overview</h3>
      <Card>
        <div className="p-8 text-center text-midnight-navy/70">
          <p>Marketing Dashboard coming soon.</p>
          <p className="text-sm">This area will feature key performance indicators for all your campaigns.</p>
        </div>
      </Card>
    </div>
  );
};