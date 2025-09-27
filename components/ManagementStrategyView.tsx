import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExecutiveIntelligenceCore } from './ExecutiveIntelligenceCore';
import { IntelligentDelegationEngine } from './IntelligentDelegationEngine';
import { BrandHub } from './BrandHub';
import { CompetitorHub } from './CompetitorHub';
import type { GoogleUser, TokenResponse } from '../types';

interface ManagementStrategyViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
}

type Tab = 'executive' | 'delegation' | 'brand' | 'competitor';

const tabs: { id: Tab; label: string }[] = [
  { id: 'executive', label: 'Executive Core' },
  { id: 'delegation', label: 'Delegation Engine' },
  { id: 'brand', label: 'Brand Hub' },
  { id: 'competitor', label: 'Competitor Hub' },
];

export const ManagementStrategyView: React.FC<ManagementStrategyViewProps> = ({ isAuthenticated, token, user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('executive');

  const renderContent = () => {
    switch (activeTab) {
      case 'executive':
        return <ExecutiveIntelligenceCore isAuthenticated={isAuthenticated} token={token} user={user} />;
      case 'delegation':
        return <IntelligentDelegationEngine isAuthenticated={isAuthenticated} token={token} user={user} />;
      case 'brand':
        return <BrandHub />;
      case 'competitor':
        return <CompetitorHub isAuthenticated={isAuthenticated} token={token} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-shrink-0 border-b border-cream/10">
        <nav className="flex items-center justify-center space-x-4 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'text-creativity-orange' : 'text-cream/70 hover:text-cream'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-strategy-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-creativity-orange"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow p-6 md:p-10 overflow-y-auto">
        <div className="mx-auto max-w-7xl">
           {renderContent()}
        </div>
      </div>
    </div>
  );
};