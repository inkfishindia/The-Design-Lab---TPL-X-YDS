import React, { useState, useEffect, useCallback } from 'react';
import type { TokenResponse, GmailMessage } from '../types';
import { getRecentEmails } from '../services/googleMailService';
import { MailOpenIcon } from './icons/MailOpenIcon';

interface GmailSnapshotWidgetProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

export const GmailSnapshotWidget: React.FC<GmailSnapshotWidgetProps> = ({ isAuthenticated, token }) => {
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    if (!isAuthenticated || !token) {
        setEmails([]);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const recentEmails = await getRecentEmails(token.access_token);
      setEmails(recentEmails);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not load emails: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow p-4 overflow-y-auto min-h-[150px]">
            {isAuthenticated ? (
                <>
                    {isLoading && <p className="text-sm text-center text-midnight-navy/70">Loading emails...</p>}
                    {error && <p className="text-sm text-center text-error-red">{error}</p>}
                    {!isLoading && emails.length === 0 && !error && (
                        <div className="text-center pt-10">
                            <MailOpenIcon className="w-10 h-10 mx-auto text-midnight-navy/40" />
                            <p className="mt-2 text-sm text-midnight-navy/60">Your inbox is empty.</p>
                        </div>
                    )}
                    <ul className="space-y-3">
                        {emails.map(email => (
                            <li key={email.id} className="text-sm border-b border-midnight-navy/10 pb-3 last:border-b-0">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-semibold truncate text-midnight-navy">{email.from}</p>
                                    <p className="text-xs text-midnight-navy/60 flex-shrink-0 ml-2">{formatDate(email.date)}</p>
                                </div>
                                <p className="font-medium text-midnight-navy/90 truncate mt-0.5">{email.subject}</p>
                                <p className="text-xs text-midnight-navy/70 truncate">{email.snippet}</p>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <div className="text-center pt-10">
                    <MailOpenIcon className="w-10 h-10 mx-auto text-midnight-navy/40" />
                    <p className="mt-2 text-sm text-midnight-navy/60">Sign in to view your recent emails.</p>
                </div>
            )}
        </div>
         <div className="p-2 text-center border-t border-midnight-navy/10">
            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-heritage-blue hover:underline">
                Open Gmail
            </a>
        </div>
    </div>
  );
};