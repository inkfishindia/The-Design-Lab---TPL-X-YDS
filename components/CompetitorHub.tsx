
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DriveIcon } from './icons/DriveIcon';
import type { TokenResponse } from '../types';
import { createDoc } from '../services/googleDriveService';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';

type Socials = { website?: string; twitter?: string; linkedin?: string; };
type Competitor = { name: string; socials: Socials | null; isLoading: boolean; error?: string; };

interface CompetitorHubProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
}

const StrategyCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-dark-surface rounded-xl p-6 ${className || ''}`}>
        {children}
    </div>
);

export const CompetitorHub: React.FC<CompetitorHubProps> = ({ isAuthenticated, token }) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  
  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  useEffect(() => {
    try {
      const savedCompetitors = localStorage.getItem('competitorHub_competitors');
      if (savedCompetitors) {
        const parsed: Competitor[] = JSON.parse(savedCompetitors);
        setCompetitors(parsed.map(c => ({ ...c, isLoading: false, error: undefined })));
      }
    } catch (error) {
      console.error("Failed to load competitors from localStorage", error);
    }
  }, []);

  const updateAndSaveCompetitors = (updater: (prev: Competitor[]) => Competitor[]) => {
    setCompetitors(prev => {
      const newCompetitors = updater(prev);
      localStorage.setItem('competitorHub_competitors', JSON.stringify(newCompetitors));
      return newCompetitors;
    });
  };

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    const competitorName = newCompetitor.trim();
    if (competitorName && !competitors.some(c => c.name.toLowerCase() === competitorName.toLowerCase())) {
      const competitorToAdd: Competitor = { name: competitorName, socials: null, isLoading: false };
      updateAndSaveCompetitors(prev => [...prev, competitorToAdd]);
      handleFindSocials(competitorName);
      setNewCompetitor('');
    }
  };

  const handleDeleteCompetitor = (competitorName: string) => {
    updateAndSaveCompetitors(prev => prev.filter(c => c.name !== competitorName));
  };

  const handleFindSocials = async (competitorName: string) => {
    if (isApiKeyMissing) return;
    setCompetitors(prev => prev.map(c => c.name === competitorName ? { ...c, isLoading: true, error: undefined } : c));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find the official website, X (Twitter), and LinkedIn profiles for the company "${competitorName}". Provide the URLs in the format:\nWebsite: [URL]\nTwitter: [URL]\nLinkedIn: [URL]`,
        config: { tools: [{googleSearch: {}}] },
      });
      
      const text = response.text;
      const parsedSocials: Socials = {
        website: text.match(/Website:\s*(https?:\/\/[^\s]+)/i)?.[1],
        twitter: text.match(/Twitter:\s*(https?:\/\/[^\s]+)/i)?.[1],
        linkedin: text.match(/LinkedIn:\s*(https?:\/\/[^\s]+)/i)?.[1],
      };

      updateAndSaveCompetitors(prev => prev.map(c => c.name === competitorName ? { ...c, socials: parsedSocials, isLoading: false } : c));
    } catch (e) {
      console.error(e);
      updateAndSaveCompetitors(prev => prev.map(c => c.name === competitorName ? { ...c, isLoading: false, error: 'Failed to find profiles.' } : c));
    }
  };

  const formatCompetitorsForDoc = (competitors: Competitor[]): string => {
    let content = `Competitor Research\n\n`;
    competitors.forEach(comp => {
      content += `-------------------------\n`;
      content += `Name: ${comp.name}\n\n`;
      if (comp.socials) {
        content += `Website: ${comp.socials.website || 'Not found'}\n`;
        content += `Twitter/X: ${comp.socials.twitter || 'Not found'}\n`;
        content += `LinkedIn: ${comp.socials.linkedin || 'Not found'}\n`;
      } else {
        content += `(Social profile search pending or failed.)\n`;
      }
      content += `-------------------------\n\n`;
    });
    return content;
  };

  const handleSaveToDrive = async () => {
    if (competitors.length === 0 || !token) return;

    setIsSaving(true);
    const title = `Competitor Research - ${new Date().toLocaleDateString('en-CA')}`;
    const content = formatCompetitorsForDoc(competitors);

    try {
      await createDoc(title, content, token.access_token);
      toast.success("Competitor list saved to Google Drive!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const ApiKeyWarning = () => {
    if (!isApiKeyMissing) return null;
    return (
      <div className="bg-accent-orange/10 border border-accent-orange text-accent-orange px-4 py-3 rounded-lg mt-4" role="alert">
        <p className="font-bold">API Key Missing</p>
        <p className="text-sm">Please configure your Gemini API Key in <strong>index.html</strong> to use this feature.</p>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <StrategyCard>
        <form onSubmit={handleAddCompetitor} className="flex gap-3">
          <div className="flex-grow">
            <Input
                value={newCompetitor}
                onChange={e => setNewCompetitor(e.target.value)}
                placeholder="Add Competitor Name"
            />
          </div>
          <Button type="submit" variant="creative" disabled={isApiKeyMissing || !newCompetitor.trim()}>
            Add
          </Button>
        </form>
        <ApiKeyWarning />
      </StrategyCard>
      
      <div className="mt-8 space-y-4">
        {competitors.length > 0 && (
          <div className="flex justify-end items-center mb-4">
              {isAuthenticated ? (
                <Button
                  onClick={handleSaveToDrive}
                  disabled={isSaving}
                  variant="secondary"
                  size="sm"
                  leftIcon={<DriveIcon className="w-4 h-4" />}
                >
                  {isSaving ? 'Saving...' : 'Save List to Drive'}
                </Button>
              ) : (
                <p className="text-xs text-text-muted">Sign in to save to Google Drive.</p>
              )}
          </div>
        )}
        {competitors.map((comp, i) => (
          <StrategyCard key={i}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-text-light text-base">{comp.name}</h4>
              <Button onClick={() => handleDeleteCompetitor(comp.name)} variant="danger" size="sm">Remove</Button>
            </div>
            
            {comp.isLoading && <p className="text-sm text-text-muted">Finding profiles...</p>}
            {comp.error && <p className="text-sm text-error-red">{comp.error}</p>}
            
            {comp.socials && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 border-t border-dark-border">
                {comp.socials.website ? <a href={comp.socials.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-blue hover:underline">Website</a> : <span className="text-sm text-text-muted/50">Website: N/A</span>}
                {comp.socials.twitter ? <a href={comp.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-blue hover:underline">Twitter/X</a> : <span className="text-sm text-text-muted/50">Twitter/X: N/A</span>}
                {comp.socials.linkedin ? <a href={comp.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-blue hover:underline">LinkedIn</a> : <span className="text-sm text-text-muted/50">LinkedIn: N/A</span>}
              </div>
            )}
          </StrategyCard>
        ))}
        {competitors.length === 0 && (
          <div className="text-center py-10">
            <p className="text-text-muted">Your competitor list is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};
