import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from '../icons/SparklesIcon';
import { Card } from '../ui/Card';
import { Textarea, Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type BrandProfile = {
  id: string;
  name: string;
  voice: string;
  mission: string;
};

type PsychologyProfile = {
  personaBasics: { name: string; demographics: string; };
  journeyMapping: string[];
  behavioralTriggers: string[];
  conversionPsychology: string[];
};

interface CustomerPsychologyGeneratorProps {
    onGenerationComplete: (output: string) => void;
}

export const CustomerPsychologyGenerator: React.FC<CustomerPsychologyGeneratorProps> = ({ onGenerationComplete }) => {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [goal, setGoal] = useState('');
  const [profile, setProfile] = useState<PsychologyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  useEffect(() => {
    try {
      const savedBrands = localStorage.getItem('brandHub_brands');
      if (savedBrands) {
        const parsedBrands: BrandProfile[] = JSON.parse(savedBrands);
        setBrands(parsedBrands);
        if (parsedBrands.length > 0) {
          setSelectedBrandId(parsedBrands[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load brands from localStorage", err);
    }
  }, []);

  const generateProfile = async () => {
    const selectedBrand = brands.find(b => b.id === selectedBrandId);
    if (!selectedBrand || !goal.trim() || isApiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setProfile(null);

    const prompt = `
      Based on the brand below and the stated marketing goal, generate a detailed customer psychology profile.
      
      Brand Name: ${selectedBrand.name}
      Brand Voice: ${selectedBrand.voice}
      Brand Mission: ${selectedBrand.mission}
      
      Marketing Goal: ${goal}
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
              personaBasics: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "A representative name for the persona." },
                  demographics: { type: Type.STRING, description: "A brief summary of their key demographics." }
                }
              },
              journeyMapping: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key stages of the customer journey from awareness to purchase."
              },
              behavioralTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Psychological triggers that would motivate this persona to act."
              },
              conversionPsychology: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Tactics to use on landing pages or ads to increase conversion."
              },
            },
          }
        }
      });
      const jsonStr = response.text.trim();
      const newProfile = JSON.parse(jsonStr) as PsychologyProfile;
      setProfile(newProfile);

      const fullOutputText = `Audience: ${newProfile.personaBasics.name}, who is ${newProfile.personaBasics.demographics}. Key triggers are ${newProfile.behavioralTriggers.join(', ')}.`;
      onGenerationComplete(fullOutputText);

    } catch (e) {
      console.error(e);
      setError('Failed to generate profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const ApiKeyWarning = () => (
    isApiKeyMissing && (
      <p className="text-xs text-accent-yellow mt-2">API Key missing. Please configure in index.html.</p>
    )
  );
  
  const Section: React.FC<{title: string, items: string[]}> = ({title, items}) => (
    <div className="pt-2">
      <Badge color="blue">{title}</Badge>
      <ul className="list-disc list-inside text-text-muted mt-1 space-y-1">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    </div>
  );


  return (
    <Card className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-text-light">AI - Customer Psychology Generator</h3>
      <div className="mt-4 space-y-6">
        <Select 
            id="brand-select" 
            label="Brand" 
            value={selectedBrandId} 
            onChange={e => setSelectedBrandId(e.target.value)}
        >
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Textarea id="goal" label="Target or Goal" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g., Increase sign-ups for our new AI tool by 20%..." rows={3} />
        <Button onClick={generateProfile} disabled={isLoading || !goal.trim() || !selectedBrandId || isApiKeyMissing} variant="creative" className="w-full" leftIcon={<SparklesIcon className="w-5 h-5" />}>
          {isLoading ? 'Generating...' : 'Generate Psychology Profile'}
        </Button>
        <ApiKeyWarning />
      </div>

      <div className="mt-6 flex-grow">
        {error && <p className="text-sm text-error-red">{error}</p>}
        {profile && (
          <div className="space-y-3 text-sm border-t border-dark-border pt-4">
            <h4 className="font-bold text-text-light text-base">Persona: {profile.personaBasics.name}</h4>
            <p className="text-text-muted">{profile.personaBasics.demographics}</p>
            
            <Section title="Journey Mapping" items={profile.journeyMapping} />
            <Section title="Behavioral Triggers" items={profile.behavioralTriggers} />
            <Section title="Conversion Psychology" items={profile.conversionPsychology} />
          </div>
        )}
      </div>
    </Card>
  );
};
