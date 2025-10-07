
import React, { useState, useEffect } from 'react';
import { ToggleSwitch } from './ui/ToggleSwitch';
import type { GoogleUser } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';
import { SignOutIcon } from './icons/SignOutIcon';
import { useToast } from './ui/Toast';
import { Button } from './ui/Button';

interface SettingsViewProps {
  user: GoogleUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  setActiveView: (view: any) => void;
}

const navItemsToToggle = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'commandCentre', label: 'Command Centre' },
    { id: 'projectDashboard', label: 'Project Dashboard' },
    { id: 'leadsDashboard', label: 'Leads Dashboard' },
    { id: 'notion', label: 'Notion' },
];

const aiPersonalities = [
    { id: 'default', name: 'Default Assistant', description: 'A friendly and helpful personal assistant.' },
    { id: 'concise', name: 'Concise & Direct', description: 'Provides answers with minimal conversational fluff.' },
    { id: 'creative', name: 'Creative Brainstormer', description: 'Proactively suggests ideas and thinks outside the box.' },
    { id: 'socratic', name: 'Socratic Coach', description: 'Asks clarifying questions to help you think.' },
];

const SectionCard: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
    <div className="bg-dark-surface rounded-xl overflow-hidden">
        <div className="p-6">
            <h2 className="text-xl font-semibold text-text-light">{title}</h2>
            <p className="mt-1 text-sm text-text-muted">{description}</p>
        </div>
        <div className="bg-dark-bg p-6 border-t border-dark-border">
            {children}
        </div>
    </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onSignIn, onSignOut, setActiveView }) => {
  const [navSettings, setNavSettings] = useState<{ [key: string]: boolean }>({});
  const [aiPersonality, setAiPersonality] = useState('default');
  const toast = useToast();

  useEffect(() => {
    try {
      const savedNavSettings = localStorage.getItem('navSettings');
      if (savedNavSettings) {
        setNavSettings(JSON.parse(savedNavSettings));
      } else {
        // Initialize with all true
        const initialSettings = navItemsToToggle.reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
        setNavSettings(initialSettings);
      }

      const savedAiPersonality = localStorage.getItem('aiPersonality');
      if (savedAiPersonality) {
        setAiPersonality(JSON.parse(savedAiPersonality));
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
  }, []);

  const handleNavToggle = (id: string) => {
    const newSettings = { ...navSettings, [id]: !navSettings[id] };
    setNavSettings(newSettings);
    localStorage.setItem('navSettings', JSON.stringify(newSettings));
    // Dispatch a storage event to notify other parts of the app (like App.tsx) immediately
    window.dispatchEvent(new Event('storage'));
  };
  
  const handlePersonalityChange = (id: string) => {
    setAiPersonality(id);
    localStorage.setItem('aiPersonality', JSON.stringify(id));
    toast.info("AI personality updated! The change will take effect on your next new chat.");
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all local application data? This will reset all your custom settings, layouts, and saved text, but will not sign you out.")) {
        // Get all keys
        const keysToRemove = Object.keys(localStorage)
            // Filter out auth tokens
            .filter(key => !key.startsWith('googleAuth'));

        // Remove the keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        toast.success("Local data cleared. Reloading app...");
        
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
       <h1 className="text-3xl font-bold font-display text-text-light mb-8">Settings</h1>
      <div className="space-y-8">
        {/* Profile Section */}
        <SectionCard title="My Profile" description="Manage your account and sign-in status.">
            {user ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <p className="font-semibold text-text-light">{user.name}</p>
                            <p className="text-sm text-text-muted">{user.email}</p>
                        </div>
                    </div>
                    <Button onClick={onSignOut} variant="danger" size="sm" leftIcon={<SignOutIcon className="w-4 h-4" />}>
                        Sign Out
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <p className="text-text-muted mb-4">Sign in with your Google account to connect your data.</p>
                    <Button onClick={onSignIn} variant="primary" size="md" leftIcon={<GoogleIcon className="w-5 h-5" />}>
                        Sign in with Google
                    </Button>
                </div>
            )}
        </SectionCard>
        
        {/* Team Settings Section */}
        <SectionCard title="Team Management" description="Add, remove, or edit team members from your 'PEOPLE & CAPACITY' Google Sheet.">
             <Button onClick={() => setActiveView('teamSettings')}>
                Manage Team
            </Button>
        </SectionCard>


        {/* Navigation Customization Section */}
        <SectionCard title="Customize Navigation" description="Show or hide pages from the main navigation bar to simplify your workspace. (Requires reload)">
            <div className="space-y-4">
                {navItemsToToggle.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                        <label htmlFor={`toggle-${item.id}`} className="font-medium text-text-light">{item.label}</label>
                        <ToggleSwitch
                            id={`toggle-${item.id}`}
                            checked={navSettings[item.id] !== false} // Default to true if undefined
                            onChange={() => handleNavToggle(item.id)}
                        />
                    </div>
                ))}
            </div>
        </SectionCard>

        {/* AI Personality Section */}
        <SectionCard title="AI Assistant Personality" description="Choose the behavior and tone of your AI assistant in the Dashboard chat.">
             <fieldset className="space-y-4">
                <legend className="sr-only">AI Personality</legend>
                {aiPersonalities.map(p => (
                    <label key={p.id} htmlFor={`personality-${p.id}`} className="flex items-center p-3 rounded-lg bg-dark-bg border border-dark-border has-[:checked]:bg-accent-blue/10 has-[:checked]:ring-2 has-[:checked]:ring-accent-blue transition-all cursor-pointer">
                        <input
                            type="radio"
                            id={`personality-${p.id}`}
                            name="ai-personality"
                            value={p.id}
                            checked={aiPersonality === p.id}
                            onChange={() => handlePersonalityChange(p.id)}
                            className="h-4 w-4 border-gray-600 bg-dark-surface text-accent-blue focus:ring-accent-blue"
                        />
                        <span className="ml-3 text-sm">
                            <span className="font-medium text-text-light">{p.name}</span>
                            <span className="block text-text-muted">{p.description}</span>
                        </span>
                    </label>
                ))}
            </fieldset>
        </SectionCard>
        
        {/* Data Management Section */}
        <SectionCard title="Application Data" description="The app saves your settings and unsaved work (like chat history) to your browser's local storage.">
            <div>
                <Button variant="danger" onClick={handleClearData}>
                    Clear All Local Data & Reset App
                </Button>
            </div>
        </SectionCard>

      </div>
    </div>
  );
};
