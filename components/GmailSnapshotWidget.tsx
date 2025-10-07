
import React, { useState, useEffect } from 'react';
import type { TokenResponse, GmailMessage } from '../types';
import { getRecentEmails, getEmail } from '../services/googleMailService';
import { MailOpenIcon } from './icons/MailOpenIcon';
import { Skeleton } from './ui/Skeleton';
import { useToast } from './ui/Toast';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { StarIcon } from './icons/StarIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
const EmailViewModal: React.FC<{
    email: GmailMessage | null;
    isLoading: boolean;
    onClose: () => void;
}> = ({ email, isLoading, onClose }) => {
    if (!email) return null;

    const iframeContent = email.bodyHtml || `<pre>${email.bodyText}</pre>` || 'No content found.';
    const gmailThreadUrl = `https://mail.google.com/mail/u/0/#inbox/${email.threadId}`;

    return (
        <Modal isOpen={true} onClose={onClose} title={email.subject} size="4xl">
            <div className="text-sm">
                <div className="pb-3 border-b border-midnight-navy/10">
                    <p><strong>From:</strong> {email.from}</p>
                    <p className="text-xs text-midnight-navy/70"><strong>Date:</strong> {new Date(email.date).toLocaleString()}</p>
                </div>
                <div className="mt-4">
                    {isLoading ? (
                        <div className="space-y-2 h-96">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ) : (
                        <iframe
                            srcDoc={`<style>body{font-family: Inter, sans-serif; color: #0A192F; margin: 0; padding: 0; font-size: 14px;} a{color: #144A87;}</style>${iframeContent}`}
                            title="Email Content"
                            className="w-full h-96 border rounded-md"
                            sandbox="allow-popups" // Sandboxing for security, allow links to open
                        />
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-midnight-navy/10 flex justify-end">
                    <a
                        href={gmailThreadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed bg-heritage-blue text-white hover:bg-heritage-blue/90 focus:ring-heritage-blue focus:ring-offset-cream px-4 py-2 text-sm"
                    >
                        View & Reply in Gmail
                    </a>
                </div>
            </div>
        </Modal>
    );
};

const EmailTags: React.FC<{ labelIds?: string[] }> = ({ labelIds = [] }) => {
    const categoryLabels: { [key: string]: { name: string; color: 'blue' | 'orange' | 'green' | 'gray' } } = {
        'CATEGORY_PROMOTIONS': { name: 'Promotions', color: 'blue' },
        'CATEGORY_SOCIAL': { name: 'Social', color: 'orange' },
        'CATEGORY_UPDATES': { name: 'Updates', color: 'green' },
        'CATEGORY_FORUMS': { name: 'Forums', color: 'gray' },
    };

    const relevantLabels = labelIds.map(id => categoryLabels[id]).filter(Boolean);
    if (relevantLabels.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {relevantLabels.map(label => (
                <Badge key={label.name} color={label.color}>
                    {label.name}
                </Badge>
            ))}
        </div>
    );
};


export const GmailSnapshotWidget: React.FC<{ isAuthenticated: boolean; token: TokenResponse | null; }> = ({ isAuthenticated, token }) => {
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchEmails = async () => {
        if (!isAuthenticated || !token) {
            setEmails([]);
            return;
        }

        setIsLoading(true);
        try {
          const recentEmails = await getRecentEmails(token.access_token);
          setEmails(recentEmails);
        } catch (err) {
          console.error("Failed to fetch emails:", err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          toast.error(`Could not load emails: ${errorMessage}`);
        } finally {
          setIsLoading(false);
        }
    };
    
    fetchEmails();
  }, [isAuthenticated, token, toast]);
  
  const handleEmailClick = async (email: GmailMessage) => {
    if (!token) return;
    setIsModalLoading(true);
    setSelectedEmail(email); // Open modal immediately with basic info
    
    try {
        const fullEmail = await getEmail(email.id, token.access_token);
        setSelectedEmail(fullEmail); // Update with full content
    } catch (err) {
        console.error("Failed to fetch email content:", err);
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast.error(`Could not load email: ${msg}`);
        setSelectedEmail(null); // Close modal on error
    } finally {
        setIsModalLoading(false);
    }
  };

  const SkeletonLoader = () => (
    <ul className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <li key={i} className="text-sm border-b border-midnight-navy/10 pb-3 last:border-b-0">
                <div className="flex justify-between items-baseline">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-4 w-3/4 mt-1" />
                <Skeleton className="h-3 w-full mt-1" />
            </li>
        ))}
    </ul>
  );

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow p-4 overflow-y-auto min-h-[150px]">
            {isAuthenticated ? (
                <>
                    {isLoading && <SkeletonLoader />}
                    {!isLoading && emails.length === 0 && (
                        <div className="text-center pt-10">
                            <MailOpenIcon className="w-10 h-10 mx-auto text-midnight-navy/40" />
                            <p className="mt-2 text-sm text-midnight-navy/60">Your inbox is empty.</p>
                        </div>
                    )}
                    {!isLoading && emails.length > 0 && (
                        <ul className="space-y-1">
                            {emails.map(email => (
                                <li key={email.id}>
                                    <button 
                                        onClick={() => handleEmailClick(email)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-midnight-navy/5 transition-colors focus:outline-none focus:ring-2 focus:ring-heritage-blue"
                                        aria-label={`View email from ${email.from} with subject ${email.subject}`}
                                    >
                                        <div className="flex justify-between items-baseline">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {email.labelIds?.includes('STARRED') && (
                                                    <StarIcon className="w-4 h-4 text-yellow-400 flex-shrink-0">
                                                        <title>Starred</title>
                                                    </StarIcon>
                                                )}
                                                {email.labelIds?.includes('IMPORTANT') && (
                                                    <BookmarkIcon className="w-4 h-4 text-creativity-orange flex-shrink-0">
                                                        <title>Important</title>
                                                    </BookmarkIcon>
                                                )}
                                                <p className="font-semibold truncate text-midnight-navy text-sm">{email.from}</p>
                                            </div>
                                            <p className="text-xs text-midnight-navy/60 flex-shrink-0 ml-2">{formatDate(email.date)}</p>
                                        </div>
                                        <p className="font-medium text-midnight-navy/90 truncate mt-0.5 text-sm">{email.subject}</p>
                                        <p className="text-xs text-midnight-navy/70 truncate">{email.snippet}</p>
                                        <EmailTags labelIds={email.labelIds} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
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
        <EmailViewModal email={selectedEmail} isLoading={isModalLoading} onClose={() => setSelectedEmail(null)} />
    </div>
  );
};