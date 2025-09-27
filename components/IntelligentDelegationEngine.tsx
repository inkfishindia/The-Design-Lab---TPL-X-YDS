import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { logDelegation } from '../services/googleSheetsService';
import type { GoogleUser, TokenResponse } from '../types';
import { SheetIcon } from './icons/SheetIcon';
import { Card } from './ui/Card';
import { Textarea } from './ui/Input';
import { Button } from './ui/Button';

interface IntelligentDelegationEngineProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
}

type DelegationBrief = {
  id: string;
  task: string;
  assignedTo: string;
  context: string;
  successCriteria: string;
  isLogged?: boolean;
  logError?: string;
};

export const IntelligentDelegationEngine: React.FC<IntelligentDelegationEngineProps> = ({ isAuthenticated, token, user }) => {
  const [tasks, setTasks] = useState('');
  const [rules, setRules] = useState('');
  const [briefs, setBriefs] = useState<DelegationBrief[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingBriefId, setLoggingBriefId] = useState<string | null>(null);

  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('delegationEngine_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      
      const savedRules = localStorage.getItem('delegationEngine_rules');
      if (savedRules) setRules(JSON.parse(savedRules));
    } catch (error) {
      console.error("Failed to load Intelligent Delegation Engine data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('delegationEngine_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('delegationEngine_rules', JSON.stringify(rules));
  }, [rules]);

  const delegateTasks = async () => {
    if (!tasks.trim() || isApiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setBriefs(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate delegation briefs for the following tasks based on the provided auto-routing rules. For each task, generate a comprehensive Delegation Brief which includes context, clear success criteria, escalation triggers, and a suggested communication style.
        
        [AUTO-ROUTING RULES & TEAM CONTEXT]
        ${rules || 'No rules provided. Use your best judgment.'}
        
        [TASKS TO DELEGATE]
        ${tasks}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "A list of delegation briefs.",
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING, description: "The original task." },
                assignedTo: { type: Type.STRING, description: "The team member the task is assigned to." },
                context: { type: Type.STRING, description: "Brief context for the task, why it's important." },
                successCriteria: { type: Type.STRING, description: "Clear, measurable success criteria for task completion." },
              },
              required: ['task', 'assignedTo', 'context', 'successCriteria'],
            }
          }
        }
      });
      const jsonStr = response.text.trim();
      const rawBriefs: Omit<DelegationBrief, 'id'>[] = JSON.parse(jsonStr);
      setBriefs(rawBriefs.map((b, i) => ({ ...b, id: `${Date.now()}-${i}` })));
    } catch (e) {
      console.error(e);
      setError('Failed to generate delegation briefs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogBrief = async (briefToLog: DelegationBrief) => {
    if (!isAuthenticated || !token || !user) {
      alert("Please sign in to log delegations to Google Sheets.");
      return;
    }

    if (!window.confirm(`This will add the task for "${briefToLog.assignedTo}" to your connected Google Sheet. Continue?`)) {
      return;
    }

    setLoggingBriefId(briefToLog.id);
    setBriefs(prev => prev?.map(b => b.id === briefToLog.id ? { ...b, logError: undefined } : b) || null);

    try {
      await logDelegation(briefToLog, user, token.access_token);
      setBriefs(prev => prev?.map(b => b.id === briefToLog.id ? { ...b, isLogged: true } : b) || null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setBriefs(prev => prev?.map(b => b.id === briefToLog.id ? { ...b, logError: errorMessage } : b) || null);
    } finally {
      setLoggingBriefId(null);
    }
  };
  
  const ApiKeyWarning = () => {
    if (!isApiKeyMissing) return null;
    return (
      <div className="bg-warning-yellow/10 border border-warning-yellow/20 text-yellow-700 px-4 py-3 rounded-lg mt-4" role="alert">
        <p className="font-bold">API Key Missing</p>
        <p className="text-sm">Please configure your Gemini API Key in <strong>index.html</strong> to use this feature.</p>
      </div>
    );
  };

  return (
    <div>
        <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-cream">Intelligent Delegation Engine</h2>
            <p className="mt-2 text-lg text-cream/70">Pass the mic 🎤 Automate task delegation with comprehensive, context-aware briefs.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card>
                <div className="space-y-6">
                    <Textarea
                        label="Auto-Routing Rules & Team Context"
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        placeholder="e.g., All social media tasks go to Sarah. Technical bugs go to Leo..."
                        rows={4}
                    />
                    <Textarea
                        label="Tasks to Delegate"
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        placeholder="List each task on a new line..."
                        rows={6}
                    />
                    <Button
                        onClick={delegateTasks}
                        disabled={isLoading || !tasks.trim() || isApiKeyMissing}
                        size="lg"
                        className="w-full"
                    >
                        {isLoading ? 'Delegating...' : 'Generate Delegation Briefs'}
                    </Button>
                    <ApiKeyWarning />
                </div>
            </Card>

            <div className="space-y-4">
                {error && <p className="text-sm text-error-red">{error}</p>}
                
                {!briefs && !isLoading && (
                    <Card className="min-h-[300px] flex items-center justify-center">
                        <p className="text-midnight-navy/70">Delegation briefs will appear here.</p>
                    </Card>
                )}

                {briefs && (
                    <>
                        <h3 className="font-bold text-cream text-lg">Delegation Briefs:</h3>
                        {briefs.map((brief) => (
                        <Card key={brief.id} className="border-l-4 border-heritage-blue/50">
                            <p className="font-semibold text-midnight-navy">Task: <span className="font-normal text-midnight-navy/90">{brief.task}</span></p>
                            <p className="font-semibold text-midnight-navy">Assigned To: <span className="font-normal text-heritage-blue">{brief.assignedTo}</span></p>
                            <div className="mt-3 pt-3 border-t border-midnight-navy/10">
                                <p className="font-semibold text-midnight-navy">Context:</p>
                                <p className="text-midnight-navy/80 whitespace-pre-wrap mt-1">{brief.context}</p>
                                <p className="font-semibold text-midnight-navy mt-3">Success Criteria:</p>
                                <p className="text-midnight-navy/80 whitespace-pre-wrap mt-1">{brief.successCriteria}</p>
                            </div>
                             <div className="mt-4 pt-3 border-t border-midnight-navy/10 flex justify-end items-center">
                                {brief.logError && <p className="text-xs text-error-red mr-auto pr-2">{`Log failed: ${brief.logError}`}</p>}
                                {isAuthenticated ? (
                                    <Button
                                      onClick={() => handleLogBrief(brief)}
                                      disabled={loggingBriefId === brief.id || !!brief.isLogged}
                                      variant="secondary"
                                      size="sm"
                                      leftIcon={<SheetIcon className="w-4 h-4" />}
                                    >
                                      {loggingBriefId === brief.id ? 'Logging...' : (brief.isLogged ? 'Logged!' : 'Log to Sheet')}
                                    </Button>
                                ) : (
                                    <p className="text-xs text-cream/60">Sign in to log delegation</p>
                                )}
                            </div>
                        </Card>
                        ))}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};