import React from 'react';
import { LookerStudioIcon } from './icons/LookerStudioIcon';

interface LookerStudioWidgetProps {
  isAuthenticated: boolean;
}

export const LookerStudioWidget: React.FC<LookerStudioWidgetProps> = ({ isAuthenticated }) => {
  const reportSrc = "https://lookerstudio.google.com/embed/reporting/6c87e6d6-e367-4ef1-a0a8-21bcdc632c03/page/p_g82fzookwd?rm=minimal";

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-cream text-midnight-navy">
          <LookerStudioIcon className="w-10 h-10 text-midnight-navy/30" />
        <p className="mt-2 text-sm text-midnight-navy/60">Please sign in to view the report.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={reportSrc}
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        title="Looker Studio Report"
      ></iframe>
    </div>
  );
};
