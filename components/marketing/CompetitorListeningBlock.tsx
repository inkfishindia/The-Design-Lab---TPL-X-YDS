import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from '../icons/SparklesIcon';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type Competitor = { name: string; };

export const CompetitorListeningBlock: React.FC = () => {
  const [allCompetitors, setAllCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  useEffect(() => {
    try {
      const savedCompetitors = localStorage.getItem('competitorHub_competitors');
      if (savedCompetitors) {
        setAllCompetitors(JSON.parse(savedCompetitors));
      }
    } catch (err) {
      console.error("Failed to load competitors from localStorage", err);
    }
  }, []);

  const handleToggleCompetitor = (name: string) => {
    setSelectedCompetitors(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const fetchPosts = async () => {
    if (selectedCompetitors.length === 0 || isApiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    const prompt = `Using Google Search, find the last 2 social media posts (from platforms like Twitter/X, LinkedIn, or Instagram) for each of the following competitors: ${selectedCompetitors.join(', ')}. For each competitor, provide a brief summary of the posts you find. Format the output clearly for each competitor.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      setResults(response.text);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch competitor posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ApiKeyWarning = () => (
    isApiKeyMissing && (
      <p className="text-xs text-accent-yellow mt-2">API Key missing. Please configure in index.html.</p>
    )
  );

  return (
    <Card className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-text-light">Competitor Listening</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-text-muted block mb-2">Select Competitors to Monitor</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allCompetitors.length > 0 ? allCompetitors.map(c => (
              <button
                key={c.name}
                onClick={() => handleToggleCompetitor(c.name)}
                className={`text-sm p-2 rounded-md transition-colors border ${selectedCompetitors.includes(c.name) ? 'bg-accent-blue text-white border-accent-blue' : 'bg-dark-surface hover:bg-dark-border border-dark-border'}`}
              >
                {c.name}
              </button>
            )) : <p className="text-sm text-text-muted col-span-full">Add competitors in the Strategy &gt; Competitor Hub tab.</p>}
          </div>
        </div>
        <Button onClick={fetchPosts} disabled={isLoading || selectedCompetitors.length === 0 || isApiKeyMissing} variant="creative" className="w-full" leftIcon={<SparklesIcon className="w-5 h-5" />}>
          {isLoading ? 'Fetching Posts...' : 'Fetch Latest Posts'}
        </Button>
        <ApiKeyWarning />
      </div>
      <div className="mt-6 flex-grow">
        {error && <p className="text-sm text-error-red">{error}</p>}
        {results && (
          <div className="space-y-3 text-sm border-t border-dark-border pt-4">
            <h4 className="font-bold text-text-light text-base">Listening Results:</h4>
            <p className="text-text-muted whitespace-pre-wrap leading-relaxed">{results}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
