


import React, { useState } from 'react';
import type { GoogleUser, TokenResponse } from '../types';

import { CustomerPsychologyGenerator } from './marketing/CustomerPsychologyGenerator';
import { CompetitorListeningBlock } from './marketing/CompetitorListeningBlock';
import { BlogGenerator } from './marketing/BlogGenerator';
import { CampaignIdeator } from './marketing/CampaignIdeator';
import { ImageDesigner } from './marketing/ImageDesigner';
import { VideoGenerator } from './marketing/VideoGenerator';
import { LookerStudioHub } from './LookerStudioHub';
import { ContentStrategyGenerator } from './marketing/ContentStrategyGenerator';
import { StrategyView } from './StrategyView';

interface MarketingViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
}

type MarketingTab = 'research' | 'strategy' | 'content' | 'analytics';

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            isActive ? 'bg-dark-surface text-accent-blue' : 'text-text-muted hover:bg-dark-surface/50'
        }`}
    >
        {label}
    </button>
);

export const MarketingView: React.FC<MarketingViewProps> = ({ isAuthenticated, token, user }) => {
  const [activeTab, setActiveTab] = useState<MarketingTab>('research');
  const [customerPsychologyOutput, setCustomerPsychologyOutput] = useState('');

  const renderContent = () => {
    switch (activeTab) {
      case 'research':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerPsychologyGenerator onGenerationComplete={setCustomerPsychologyOutput} />
            <CompetitorListeningBlock />
          </div>
        );
      case 'strategy':
        return <StrategyView isAuthenticated={isAuthenticated} token={token} />;
      case 'content':
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <ContentStrategyGenerator initialAudience={customerPsychologyOutput} />
                    <CampaignIdeator />
                    <BlogGenerator />
                </div>
                 <div className="space-y-6">
                    <ImageDesigner />
                    <VideoGenerator />
                </div>
            </div>
        );
      case 'analytics':
        return <LookerStudioHub isAuthenticated={isAuthenticated} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col text-text-light p-6">
      <div className="flex-shrink-0">
         <div className="border-b border-dark-border">
            <nav className="flex items-center gap-4">
                <TabButton label="Research" isActive={activeTab === 'research'} onClick={() => setActiveTab('research')} />
                <TabButton label="Marketing Strategy" isActive={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} />
                <TabButton label="Content Creation" isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                <TabButton label="Analytics" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            </nav>
        </div>
      </div>
      <main className="flex-grow pt-6">
        {renderContent()}
      </main>
    </div>
  );
};