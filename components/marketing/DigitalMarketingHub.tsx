import React from 'react';
import { LookerStudioHub } from '../LookerStudioHub';

interface DigitalMarketingHubProps {
  isAuthenticated: boolean;
}

export const DigitalMarketingHub: React.FC<DigitalMarketingHubProps> = ({ isAuthenticated }) => {
  return (
    <div>
      <LookerStudioHub isAuthenticated={isAuthenticated} />
    </div>
  );
};