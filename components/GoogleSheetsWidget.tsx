import React from 'react';
import { LookerStudioIcon } from './icons/LookerStudioIcon';

export const GoogleSheetsWidget: React.FC<{isAuthenticated: boolean}> = ({isAuthenticated}) => {
    
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-cream text-midnight-navy">
                <LookerStudioIcon className="w-10 h-10 text-midnight-navy/30" />
                <p className="mt-2 text-sm text-midnight-navy/60">Please sign in to view the Looker Studio report.</p>
            </div>
        )
    }

    const reportSrc = "https://lookerstudio.google.com/embed/reporting/6c87e6d6-e367-4ef1-a0a8-21bcdc632c03/page/7zNQF";

    return (
        <div className="w-full h-full bg-cream text-midnight-navy">
            <iframe
                className="w-full h-full border-none"
                src={reportSrc}
                title="Looker Studio Embed"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
        </div>
    );
};