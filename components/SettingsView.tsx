import React from 'react';
import { Card } from './ui/Card';

export const SettingsView: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
       <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-cream">Settings</h1>
            <p className="mt-2 text-lg text-cream/70">Manage your preferences and integrations.</p>
        </div>

      <div className="mt-10">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-midnight-navy">More settings are coming soon!</h2>
            <p className="mt-2 text-midnight-navy/60">You got this 💪</p>
          </div>
        </Card>
      </div>
    </div>
  );
};