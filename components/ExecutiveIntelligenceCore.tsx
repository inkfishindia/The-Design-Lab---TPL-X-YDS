import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessContexts } from './strategy/BusinessContexts';
import { TeamPermissions } from './strategy/TeamPermissions';
import { logBrainDump } from '../services/googleSheetsService';
import type { GoogleUser, TokenResponse } from '../types';
import { Card } from './ui/Card';
import { Textarea } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

type Briefing = {
  founderCritical: string[];
  delegateQueue: { task: string; assignee: string; }[];
  peakWindow: string;
  overloadAlerts: string[];
  priority: string;
};

interface ExecutiveIntelligenceCoreProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
}

export const ExecutiveIntelligenceCore: React.FC<ExecutiveIntelligenceCoreProps> = ({ isAuthenticated, token, user }) => {
  const [brainDump, setBrainDump] = useState('');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingToSheet, setIsSavingToSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [teamContext, setTeamContext] = useState('');
  const [businessContext, setBusinessContext] = useState('');

  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';
  
  useEffect(() => {
    try {
      const savedBrainDump = localStorage.getItem('execCore_brainDump');
      if (savedBrainDump) setBrainDump(JSON.parse(savedBrainDump));
    } catch (error) {
      console.error("Failed to load brain dump from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('execCore_brainDump', JSON.stringify(brainDump));
  }, [brainDump]);

  const generateBriefing = async () => {
    if (!brainDump.trim() || isApiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setBriefing(null);
    setIsSavingToSheet(false);

    const fullContext = `
      [BUSINESS CONTEXTS]
      ${businessContext || 'No business contexts provided.'}
      
      [TEAM & PERMISSIONS]
      ${teamContext || 'No team context provided.'}
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following "brain dump" and context to generate a structured "Morning Briefing".
        
        ${fullContext}
        
        [BRAIN DUMP]
        ${brainDump}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              founderCritical: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Tasks that require the founder's direct attention."
              },
              delegateQueue: {
                type: Type.ARRAY,
                description: "Tasks suitable for delegation, intelligently assigned to specific team members based on the context.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING, description: "The specific task to be delegated." },
                    assignee: { type: Type.STRING, description: "The suggested team member to delegate to." }
                  },
                  required: ['task', 'assignee'],
                }
              },
              peakWindow: {
                type: Type.STRING,
                description: "The single most important 'deep work' task for the day for the founder."
              },
              overloadAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Potential conflicts, risks, or areas of over-commitment identified from the brain dump."
              },
              priority: {
                type: Type.STRING,
                description: "The overall priority of the brain dump content, can be 'High', 'Medium', or 'Low'."
              }
            },
            required: ['founderCritical', 'delegateQueue', 'peakWindow', 'overloadAlerts', 'priority'],
          }
        }
      });
      const jsonStr = response.text.trim();
      const newBriefing = JSON.parse(jsonStr) as Briefing;
      setBriefing(newBriefing);

      if (isAuthenticated && token && user) {
        setIsSavingToSheet(true);
        try {
          await logBrainDump(brainDump, user, token.access_token, newBriefing.priority);
        } catch (sheetError) {
          console.error("Failed to save to Google Sheets:", sheetError);
          const sheetErrorMessage = sheetError instanceof Error ? sheetError.message : "Unknown error";
          setError(prev => prev ? `${prev} (Sheet Error: ${sheetErrorMessage})` : `Failed to save to Google Sheet: ${sheetErrorMessage}`);
        } finally {
          setIsSavingToSheet(false);
        }
      }

    } catch (e) {
      console.error(e);
      setError('Failed to generate briefing. Please check your API Key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Generating...';
    if (isSavingToSheet) return 'Logging to Sheet...';
    return isAuthenticated ? 'Generate Briefing & Log' : 'Generate Briefing';
  };
  
  const ApiKeyWarning = () => {
    if (!isApiKeyMissing) return null;
    return (
      <div className="bg-warning-yellow/10 border border-warning-yellow/20 text-yellow-700 px-4 py-3 rounded-lg my-4" role="alert">
        <p className="font-bold">API Key Missing</p>
        <p className="text-sm">Please configure your Gemini API Key in <strong>index.html</strong> to use this feature.</p>
      </div>
    );
  };

  const BriefingSection: React.FC<{title: string, color: 'red' | 'blue' | 'yellow' | 'orange', children: React.ReactNode}> = ({title, color, children}) => {
    const colors = {
      red: 'border-error-red/50',
      blue: 'border-heritage-blue/50',
      yellow: 'border-warning-yellow/50',
      orange: 'border-creativity-orange/50'
    }
    return (
      <div className={`p-4 bg-heritage-blue/5 rounded-lg border-l-4 ${colors[color]}`}>
        <h5 className="font-semibold text-midnight-navy/80 mb-2">{title}</h5>
        {children}
      </div>
    )
  }

  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-cream">Executive Intelligence Core</h2>
        <p className="mt-2 text-lg text-cream/70">Your strategic brain extension for clarity and focus.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <Card>
            <h3 className="text-lg font-semibold text-midnight-navy block mb-2">Brain Dump</h3>
            <p className="text-sm text-midnight-navy/70 mb-4">Enter all your tasks, ideas, and notes for the day. The more context, the better.</p>
            <Textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder="- Finalize partnership decision with Acme Corp...&#10;- Strategy review for Product Lab Q3...&#10;- Call with investors at 10am..."
              rows={8}
            />
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-midnight-navy block mb-4">Configuration</h3>
            <div className="space-y-6">
              <BusinessContexts onContextChange={setBusinessContext} />
              <TeamPermissions onTeamChange={setTeamContext} />
            </div>
          </Card>
        </div>

        <div className="space-y-6 sticky top-24">
           <Button
              onClick={generateBriefing}
              disabled={isLoading || isSavingToSheet || !brainDump.trim() || isApiKeyMissing}
              size="lg"
              className="w-full"
            >
              {getButtonText()}
            </Button>
            <ApiKeyWarning />
           <Card className="min-h-[400px]">
              {error && <p className="text-sm text-error-red">{error}</p>}
              {!isLoading && !briefing && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-lg font-semibold text-midnight-navy/80">Your "Morning Brief" will appear here.</p>
                  <p className="mt-1 text-midnight-navy/60">Fill out your brain dump and generate a brief to start.</p>
                </div>
              )}
              {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-midnight-navy/70 animate-pulse">Analyzing your brain dump...</p>
                 </div>
              )}
              {briefing && (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-midnight-navy text-lg">Morning Briefing</h4>
                    <Badge color="blue">{`Priority: ${briefing.priority}`}</Badge>
                  </div>
                   <BriefingSection title="Peak Window" color="orange">
                    <p className="text-midnight-navy">{briefing.peakWindow}</p>
                  </BriefingSection>
                  <BriefingSection title="Founder Critical" color="red">
                    <ul className="list-disc list-inside text-midnight-navy space-y-1">{briefing.founderCritical.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </BriefingSection>
                  <BriefingSection title="Delegate Queue" color="blue">
                    <ul className="list-disc list-inside text-midnight-navy space-y-1">{briefing.delegateQueue.map((item, i) => <li key={i}><strong>{item.assignee}:</strong> {item.task}</li>)}</ul>
                  </BriefingSection>
                   <BriefingSection title="Overload Alerts" color="yellow">
                    <ul className="list-disc list-inside text-midnight-navy space-y-1">{briefing.overloadAlerts.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </BriefingSection>
                </div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
};