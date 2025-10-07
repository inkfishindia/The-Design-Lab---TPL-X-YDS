
import React from 'react';
import type { GoogleUser, TokenResponse } from '../types';
import { CalendarTimeline } from './command-centre/CalendarTimeline';
import { CalendarIcon } from './icons/CalendarIcon';

interface CommandCentreViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
  onSignInRequest: () => void;
}

const DashboardCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-dark-surface rounded-xl flex flex-col h-full overflow-hidden">
        <header className="flex-shrink-0 flex items-center gap-3 p-4 px-6 border-b border-dark-border">
            <span className="text-accent-blue">{icon}</span>
            <h3 className="font-semibold text-text-light">{title}</h3>
        </header>
        <div className="flex-grow overflow-auto relative">
            {children}
        </div>
    </div>
);


export const CommandCentreView: React.FC<CommandCentreViewProps> = ({ isAuthenticated, token }) => {
  const briefingWidget = (
    <DashboardCard title="Daily Briefing" icon={<CalendarIcon className="w-6 h-6" />}>
        <CalendarTimeline isAuthenticated={isAuthenticated} token={token} />
    </DashboardCard>
  );

  return (
      <div className="h-full w-full flex flex-col">
          <main className="flex-grow p-6 overflow-hidden">
              {briefingWidget}
          </main>
      </div>
  );
};
