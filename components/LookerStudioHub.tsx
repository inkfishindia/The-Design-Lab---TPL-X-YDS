import React, { useState, useEffect } from 'react';
import { LookerStudioIcon } from './icons/LookerStudioIcon';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface LookerStudioHubProps {
  isAuthenticated: boolean;
}

export const LookerStudioHub: React.FC<LookerStudioHubProps> = ({ isAuthenticated }) => {
  const [reportUrl, setReportUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem('lookerStudio_reportUrl');
      if (savedUrl) {
        setReportUrl(JSON.parse(savedUrl));
        setInputUrl(JSON.parse(savedUrl));
      }
    } catch (error) {
      console.error("Failed to load Looker Studio URL from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (reportUrl) {
      localStorage.setItem('lookerStudio_reportUrl', JSON.stringify(reportUrl));
    } else {
      localStorage.removeItem('lookerStudio_reportUrl');
    }
  }, [reportUrl]);

  const handleLoadReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim().startsWith('https://lookerstudio.google.com/embed/')) {
      setReportUrl(inputUrl.trim());
    } else {
      alert('Please enter a valid Looker Studio embed URL. It should start with "https://lookerstudio.google.com/embed/".');
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="text-center py-10">
        <LookerStudioIcon className="w-12 h-12 mx-auto text-midnight-navy/50" />
        <h3 className="mt-2 text-lg font-medium text-midnight-navy">Looker Studio Hub</h3>
        <p className="mt-1 text-sm text-midnight-navy/70">Please sign in to embed and view your reports.</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-midnight-navy">Looker Studio Hub</h2>
        <p className="mt-2 text-lg text-midnight-navy/70">Embed and analyze your key business metrics.</p>
      </div>

      <div className="mt-8 max-w-5xl mx-auto">
        <Card>
          <form onSubmit={handleLoadReport} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
                <Input
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="Paste Looker Studio Embed URL..."
                aria-label="Looker Studio Embed URL"
                />
            </div>
            <Button type="submit">
              Load Report
            </Button>
          </form>
          <p className="text-xs text-midnight-navy/60 mt-3">
            To get the URL: In Looker Studio, go to your report &gt; Share &gt; Embed report &gt; Copy the 'Embed URL'.
          </p>
        </Card>

        <div className="mt-6">
          {reportUrl ? (
            <Card className="overflow-hidden border aspect-video !p-0">
              <iframe
                key={reportUrl}
                width="100%"
                height="100%"
                src={reportUrl}
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups"
                title="Looker Studio Report"
              ></iframe>
            </Card>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-midnight-navy/20 rounded-lg">
              <LookerStudioIcon className="w-10 h-10 mx-auto text-midnight-navy/40" />
              <p className="mt-4 text-midnight-navy/70">Your embedded report will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};