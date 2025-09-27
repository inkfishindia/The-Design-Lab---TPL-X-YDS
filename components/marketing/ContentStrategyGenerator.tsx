import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from '../icons/SparklesIcon';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type ContentStrategy = {
  socialPosting: string[];
  editorialCalendar: string[];
  multiChannelStrategy: string;
  brandStorytelling: string;
};

interface ContentStrategyGeneratorProps {
    initialAudience: string;
}

export const ContentStrategyGenerator: React.FC<ContentStrategyGeneratorProps> = ({ initialAudience }) => {
  const [brief, setBrief] = useState('');
  const [audience, setAudience] = useState('');
  const [strategy, setStrategy] = useState<ContentStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  useEffect(() => {
    if(initialAudience) {
        setAudience(initialAudience);
    }
  }, [initialAudience]);

  const generateStrategy = async () => {
    if (!brief.trim() || !audience.trim() || isApiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setStrategy(null);

    const prompt = `
      Create a comprehensive content strategy based on the following:
      
      Campaign Brief: ${brief}
      
      Target Audience: ${audience}
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              socialPosting: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 specific social media post ideas tailored to the audience."
              },
              editorialCalendar: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Themes or topics for a month-long editorial calendar (e.g., Week 1: Teaser, Week 2: Deep Dive)."
              },
              multiChannelStrategy: {
                type: Type.STRING,
                description: "A brief plan on how to leverage different channels (e.g., Blog, Instagram, Newsletter)."
              },
              brandStorytelling: {
                type: Type.STRING,
                description: "A core narrative or story angle to use throughout the campaign."
              },
            },
          }
        }
      });
      const jsonStr = response.text.trim();
      const newStrategy = JSON.parse(jsonStr) as ContentStrategy;
      setStrategy(newStrategy);
    } catch (e) {
      console.error(e);
      setError('Failed to generate strategy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const ApiKeyWarning = () => (
    isApiKeyMissing && (
      <p className="text-xs text-warning-yellow mt-2">API Key missing. Please configure in index.html.</p>
    )
  );
  
  const Section: React.FC<{title: string, content: string | string[]}> = ({title, content}) => (
     <div className="pt-2">
        <Badge color="orange">{title}</Badge>
        {Array.isArray(content) ? (
            <ul className="list-disc list-inside text-midnight-navy/90 mt-1 space-y-1">{content.map((item, i) => <li key={i}>{item}</li>)}</ul>
        ) : (
            <p className={`text-midnight-navy/90 mt-1 ${title === 'Brand Storytelling' ? 'italic' : ''}`}>{content}</p>
        )}
     </div>
  );

  return (
    <Card>
      <h3 className="text-lg font-semibold text-midnight-navy">AI - Content Strategy Generator</h3>
      <div className="mt-4 space-y-4">
        <Textarea id="brief" label="Campaign or Idea Brief" value={brief} onChange={e => setBrief(e.target.value)} placeholder="e.g., Launching our new summer collection..." rows={3} />
        <Textarea id="audience" label="Target Audience" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g., Tech-savvy founders, aged 25-40..." rows={3} />
        <Button onClick={generateStrategy} disabled={isLoading || !brief.trim() || !audience.trim() || isApiKeyMissing} className="w-full" leftIcon={<SparklesIcon className="w-5 h-5" />}>
          {isLoading ? 'Generating...' : 'Generate Content Strategy'}
        </Button>
        <ApiKeyWarning />
      </div>

      <div className="mt-6">
        {error && <p className="text-sm text-error-red">{error}</p>}
        {strategy && (
          <div className="space-y-3 text-sm border-t border-midnight-navy/10 pt-4">
            <h4 className="font-bold text-midnight-navy text-base">Generated Strategy</h4>
            <Section title="Social Posting Ideas" content={strategy.socialPosting} />
            <Section title="Editorial Calendar" content={strategy.editorialCalendar} />
            <Section title="Multi-channel Strategy" content={strategy.multiChannelStrategy} />
            <Section title="Brand Storytelling" content={strategy.brandStorytelling} />
          </div>
        )}
      </div>
    </Card>
  );
};