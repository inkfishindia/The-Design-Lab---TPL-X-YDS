

import React, { useState } from 'react';
import type { TokenResponse } from '../types';

import { BrandHub } from './BrandHub';
import { CompetitorHub } from './CompetitorHub';

interface StrategyViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
}

type StrategyTab = 'brand' | 'competitor' | 'planning';

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


export const StrategyView: React.FC<StrategyViewProps> = ({ isAuthenticated, token }) => {
    const [activeTab, setActiveTab] = useState<StrategyTab>('brand');

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-shrink-0">
                <div className="border-b border-dark-border">
                    <nav className="flex items-center gap-4">
                        <TabButton label="Brand Hub" isActive={activeTab === 'brand'} onClick={() => setActiveTab('brand')} />
                        <TabButton label="Competitor Hub" isActive={activeTab === 'competitor'} onClick={() => setActiveTab('competitor')} />
                    </nav>
                </div>
            </div>

            <main className="flex-grow mt-6 overflow-y-auto">
                {activeTab === 'brand' && <BrandHub />}
                {activeTab === 'competitor' && <CompetitorHub isAuthenticated={isAuthenticated} token={token} />}
            </main>
        </div>
    );
};
