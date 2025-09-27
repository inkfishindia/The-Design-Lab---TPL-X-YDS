import React, { useState, useEffect } from 'react';

type BrandProfile = {
  id: string;
  name: string;
  voice: string;
  mission: string;
};

interface BusinessContextsProps {
  onContextChange: (context: string) => void;
}

export const BusinessContexts: React.FC<BusinessContextsProps> = ({ onContextChange }) => {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  
  useEffect(() => {
    // Function to load and update brands from localStorage
    const loadBrands = () => {
      try {
        const savedBrands = localStorage.getItem('brandHub_brands');
        const parsedBrands = savedBrands ? JSON.parse(savedBrands) : [];
        setBrands(parsedBrands);

        // Update parent with context string
        const contextString = parsedBrands.map((b: BrandProfile) => 
          `Brand: ${b.name}\nVoice: ${b.voice}\nMission: ${b.mission}`
        ).join('\n\n');
        onContextChange(contextString);

      } catch (error) {
        console.error("Failed to load brands from localStorage", error);
        setBrands([]);
        onContextChange('');
      }
    };

    loadBrands();
    
    // Listen for storage changes to update if BrandHub is modified
    window.addEventListener('storage', loadBrands);
    
    return () => {
      window.removeEventListener('storage', loadBrands);
    };
  }, [onContextChange]);

  const handleRemoveBrand = (id: string) => {
    const newBrands = brands.filter(b => b.id !== id);
    const activeId = localStorage.getItem('brandHub_activeId');
    // Save updated brands list
    localStorage.setItem('brandHub_brands', JSON.stringify(newBrands));
    // If the removed brand was active, clear the active ID
    if (activeId && JSON.parse(activeId) === id) {
       localStorage.removeItem('brandHub_activeId');
    }
    // Manually trigger a storage event to ensure UI consistency
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div>
      <h4 className="text-md font-semibold text-midnight-navy block mb-2">Business Contexts</h4>
      <p className="text-xs text-midnight-navy/70 mb-3">Managed from the Brand Hub. This context helps the AI align with your brand voice.</p>
      <div className="space-y-2">
        {brands.length > 0 ? brands.map(brand => (
          <div key={brand.id} className="flex items-center justify-between bg-heritage-blue/5 p-2 rounded-md">
            <span className="text-sm text-midnight-navy/90">{brand.name}</span>
            <button
              onClick={() => handleRemoveBrand(brand.id)} 
              className="text-xs font-semibold text-error-red hover:underline">
              REMOVE
            </button>
          </div>
        )) : (
            <p className="text-sm text-midnight-navy/60">No business contexts defined. Add brands in the "Brand Hub" tab.</p>
        )}
      </div>
    </div>
  );
};