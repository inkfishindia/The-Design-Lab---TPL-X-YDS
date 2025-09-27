import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from '../icons/SparklesIcon';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type CampaignIdea = {
  name: string;
  description: string;
  channels: string[];
};

export const CampaignIdeator: React.FC = () => {
  const [productInfo, setProductInfo] = useState('');
  const [ideas, setIdeas] = useState<CampaignIdea[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  const generateIdeas = async () => {
    if (!productInfo.trim() || isApiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setIdeas(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate 3 innovative marketing campaign ideas for the following product/service: "${productInfo}". For each idea, provide a catchy name, a brief description, and suggest 2-3 key channels for execution.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The creative name of the campaign." },
                description: { type: Type.STRING, description: "A short summary of the campaign concept." },
                channels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested marketing channels (e.g., 'TikTok', 'Email Marketing')." }
              },
              required: ['name', 'description', 'channels'],
            }
          }
        }
      });
      const jsonStr = response.text.trim();
      const newIdeas = JSON.parse(jsonStr) as CampaignIdea[];
      setIdeas(newIdeas);
    } catch (e) {
      console.error(e);
      setError('Failed to generate campaign ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ApiKeyWarning = () => (
    isApiKeyMissing && (
      <p className="text-xs text-warning-yellow mt-2 text-center">API Key missing. Please configure in index.html.</p>
    )
  );

  return (
    <Card>
      <h3 className="text-lg font-semibold text-midnight-navy text-center">Campaign Ideator</h3>
      <div className="mt-4">
        <Textarea
          id="product-info"
          label="Product / Service Description"
          value={productInfo}
          onChange={(e) => setProductInfo(e.target.value)}
          placeholder="e.g., An AI-powered personal assistant app for busy founders..."
          rows={4}
        />
        <Button
          onClick={generateIdeas}
          disabled={isLoading || !productInfo.trim() || isApiKeyMissing}
          className="mt-3 w-full"
          leftIcon={<SparklesIcon className="w-5 h-5" />}
        >
          {isLoading ? 'Generating Ideas...' : 'Generate Campaign Ideas'}
        </Button>
        <ApiKeyWarning />
      </div>

      <div className="mt-6">
        {error && <p className="text-sm text-error-red">{error}</p>}
        {ideas && (
          <div className="space-y-4 border-t border-midnight-navy/10 pt-4">
            {ideas.map((idea, index) => (
              <div key={index} className="p-3 bg-cream rounded-md">
                <h4 className="font-semibold text-midnight-navy">{idea.name}</h4>
                <p className="text-sm text-midnight-navy/90 mt-1">{idea.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {idea.channels.map(channel => (
                    <Badge key={channel}>{channel}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};