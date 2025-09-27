import React from 'react';
import { MarketingIcon } from '../icons/MarketingIcon';

export const MarketingOpsHub: React.FC = () => {
  return (
    <div className="text-center py-16 border-2 border-dashed border-midnight-navy/20 rounded-lg max-w-4xl mx-auto">
      <MarketingIcon className="w-12 h-12 mx-auto text-midnight-navy/40" />
      <h2 className="mt-4 text-xl font-bold text-midnight-navy">Marketing Operations</h2>
      <p className="mt-2 text-midnight-navy/70">Tools to streamline workflows, manage budgets, and analyze performance are coming soon.</p>
    </div>
  );
};