
import React, { useState, useEffect } from 'react';
import { Input, Textarea } from './ui/Input';
import { Button } from './ui/Button';

type BrandProfile = {
  id: string;
  name: string;
  voice: string;
  mission: string;
};

const StrategyCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-dark-surface rounded-xl p-6 ${className || ''}`}>
        {children}
    </div>
);

export const BrandHub: React.FC = () => {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [voice, setVoice] = useState('');
  const [mission, setMission] = useState('');

  useEffect(() => {
    try {
      const savedBrands = localStorage.getItem('brandHub_brands');
      if (savedBrands) {
        setBrands(JSON.parse(savedBrands));
      }
      const savedActiveId = localStorage.getItem('brandHub_activeId');
      if (savedActiveId) {
        setActiveBrandId(JSON.parse(savedActiveId));
      }
    } catch (error) {
      console.error("Failed to load brands from localStorage", error);
    }
  }, []);

  const saveBrands = (newBrands: BrandProfile[], newActiveId: string | null) => {
    setBrands(newBrands);
    setActiveBrandId(newActiveId);
    localStorage.setItem('brandHub_brands', JSON.stringify(newBrands));
    localStorage.setItem('brandHub_activeId', JSON.stringify(newActiveId));
  };
  
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newBrand: BrandProfile = { id: Date.now().toString(), name, voice, mission };
    const newBrands = [...brands, newBrand];
    saveBrands(newBrands, activeBrandId || newBrand.id);
    setName('');
    setVoice('');
    setMission('');
  };

  const handleDeleteBrand = (id: string) => {
    const newBrands = brands.filter(b => b.id !== id);
    const newActiveId = activeBrandId === id ? (newBrands.length > 0 ? newBrands[0].id : null) : activeBrandId;
    saveBrands(newBrands, newActiveId);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StrategyCard className="md:col-span-1">
          <form onSubmit={handleAddBrand} className="space-y-4">
            <h3 className="text-lg font-semibold text-text-light">Add New Brand Profile</h3>
            <Input label="Brand Name" id="brand-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Product Lab" />
            <Textarea label="Voice & Tone" id="brand-voice" value={voice} onChange={e => setVoice(e.target.value)} placeholder="e.g., Confident, witty, and helpful..." />
            <Textarea label="Mission & Values" id="brand-mission" value={mission} onChange={e => setMission(e.target.value)} placeholder="e.g., To empower creators..." />
            <Button type="submit" variant="creative" className="w-full">Add Brand</Button>
          </form>
        </StrategyCard>

        <StrategyCard className="md:col-span-2">
           <h3 className="text-lg font-semibold text-text-light mb-4">Your Brand Profiles</h3>
           {brands.length > 0 ? (
             <div className="space-y-3">
               {brands.map(brand => (
                 <div key={brand.id} className={`p-3 rounded-lg flex justify-between items-center transition-all duration-300 ${activeBrandId === brand.id ? 'bg-accent-blue/10 border-accent-blue' : 'bg-dark-bg border-transparent'} border`}>
                   <div className="flex-grow">
                       <p className="font-semibold text-text-light">{brand.name}</p>
                       <p className="text-xs text-text-muted mt-1"><strong>Voice:</strong> {brand.voice.substring(0, 50)}{brand.voice.length > 50 && '...'}</p>
                   </div>
                   <div className="space-x-2 flex-shrink-0 ml-4">
                     <Button onClick={() => saveBrands(brands, brand.id)} disabled={activeBrandId === brand.id} variant={activeBrandId === brand.id ? "primary" : "secondary"} size="sm">
                       {activeBrandId === brand.id ? 'Active' : 'Select'}
                     </Button>
                     <Button onClick={() => handleDeleteBrand(brand.id)} variant="danger" size="sm">Remove</Button>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-8">
                <p className="text-sm text-text-muted">No brand profiles added yet. Use the form to create your first one.</p>
             </div>
           )}
        </StrategyCard>
      </div>
    </div>
  );
};
