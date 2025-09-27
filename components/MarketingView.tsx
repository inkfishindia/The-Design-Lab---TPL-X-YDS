import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { GoogleUser, TokenResponse } from '../types';
import { DigitalMarketingHub } from './marketing/DigitalMarketingHub';
import { ContentCreatorHub } from './marketing/ContentCreatorHub';
import { ImageDesigner } from './marketing/ImageDesigner';
import { MarketingOpsHub } from './marketing/MarketingOpsHub';
import { MarketingDashboard } from './marketing/MarketingDashboard';

interface MarketingViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
}

type Tab = 'dashboard' | 'specialist' | 'creator' | 'designer' | 'ops';

const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'specialist', label: 'Digital Marketing' },
  { id: 'creator', label: 'Content Creator' },
  { id: 'designer', label: 'Graphic Designer' },
  { id: 'ops', label: 'Marketing Ops' },
];


export const MarketingView: React.FC<MarketingViewProps> = ({ isAuthenticated, token, user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MarketingDashboard isAuthenticated={isAuthenticated} token={token} />;
      case 'specialist':
        return <DigitalMarketingHub isAuthenticated={isAuthenticated} />;
      case 'creator':
        return <ContentCreatorHub />;
      case 'designer':
        return <ImageDesigner />;
      case 'ops':
        return <MarketingOpsHub />;
      default:
        return <MarketingDashboard isAuthenticated={isAuthenticated} token={token} />;
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
                  layoutId="active-marketing-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-creativity-orange"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow p-6 md:p-10 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};