import React, { useState } from 'react';
import { LookerStudioHub } from '../LookerStudioHub';
import { CustomerPsychologyGenerator } from './CustomerPsychologyGenerator';
import { CompetitorListeningBlock } from './CompetitorListeningBlock';
import { ContentStrategyGenerator } from './ContentStrategyGenerator';
import type { TokenResponse } from '../../types';

interface MarketingDashboardProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
}

export const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ isAuthenticated, token }) => {
    const [customerPsychologyOutput, setCustomerPsychologyOutput] = useState('');

    return (
        <div>
            <div className="text-center">
                <h2 className="text-3xl font-display font-bold text-cream">Marketing Dashboard</h2>
                <p className="mt-2 text-lg text-cream/70">Your central command for market analysis, customer insights, and strategic planning.</p>
            </div>
            <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">
                <div className="space-y-8">
                    <CustomerPsychologyGenerator onGenerationComplete={setCustomerPsychologyOutput} />
                    <CompetitorListeningBlock />
                </div>
                <div className="space-y-8">
                    <ContentStrategyGenerator initialAudience={customerPsychologyOutput} />
                    <LookerStudioHub isAuthenticated={isAuthenticated} />
                </div>
            </div>
        </div>
    );
};