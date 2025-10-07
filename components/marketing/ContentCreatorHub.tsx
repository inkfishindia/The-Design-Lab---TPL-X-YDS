import React from 'react';
import { BlogGenerator } from './BlogGenerator';
import { CampaignIdeator } from './CampaignIdeator';

export const ContentCreatorHub: React.FC = () => {
  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-midnight-navy">Content Creator Toolkit</h2>
        <p className="mt-2 text-lg text-midnight-navy/70">Generate high-quality written content and brainstorm campaign ideas.</p>
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <BlogGenerator />
        <CampaignIdeator />
      </div>
    </div>
  );
};