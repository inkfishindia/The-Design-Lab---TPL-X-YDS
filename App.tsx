import React, { useState, useEffect } from 'react';
// FIX: Import Transition type from framer-motion to correctly type the pageTransition object.
import { motion, AnimatePresence, Transition } from 'framer-motion';

import { Auth } from './components/Auth';
import { DashboardView } from './components/DashboardView';
import { ManagementStrategyView } from './components/ManagementStrategyView';
import { MarketingView } from './components/MarketingView';
import { SettingsView } from './components/SettingsView';
import { DiamondLogo } from './components/icons/DiamondLogo';

import { initGoogleAuth, signIn, signOut } from './services/googleAuthService';
import { logUserSignIn } from './services/googleSheetsService';
import type { GoogleUser, TokenResponse } from './types';
import { WidgetIcons } from './components/WidgetIcons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'strategy' | 'marketing' | 'settings'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [token, setToken] = useState<TokenResponse | null>(null);

  useEffect(() => {
    initGoogleAuth();
  }, []);

  const handleSignIn = () => {
    signIn(async (tokenResponse, profile) => {
      setToken(tokenResponse);
      setUser(profile);
      setIsAuthenticated(true);
      
      try {
        await logUserSignIn(profile, tokenResponse.access_token);
      } catch (logError) {
        console.error("Failed to log user sign-in:", logError);
      }
    });
  };

  const handleSignOut = () => {
    if (token?.access_token) {
      signOut(token.access_token);
    }
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  const NavButton: React.FC<{ viewName: 'dashboard' | 'strategy' | 'marketing' | 'settings', label: string }> = ({ viewName, label }) => (
    <button
      onClick={() => setActiveView(viewName)}
      className="relative px-3 py-1.5 text-sm font-medium text-cream/70 transition-colors hover:text-cream"
    >
      {label}
      {activeView === viewName && (
        <motion.div
          layoutId="active-nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-creativity-orange"
        />
      )}
    </button>
  );

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  // FIX: Explicitly type pageTransition with the Transition type from framer-motion to resolve the type error.
  const pageTransition: Transition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView isAuthenticated={isAuthenticated} token={token} user={user} onSignInRequest={handleSignIn} />;
      case 'strategy':
        return <ManagementStrategyView isAuthenticated={isAuthenticated} token={token} user={user} />;
      case 'marketing':
        return <MarketingView isAuthenticated={isAuthenticated} token={token} user={user} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView isAuthenticated={isAuthenticated} token={token} user={user} onSignInRequest={handleSignIn} />;
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-heritage-blue text-cream">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-cream/10 bg-heritage-blue/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <DiamondLogo className="w-8 h-8 text-cream" />
          <div>
            <h1 className="text-lg font-display font-bold text-cream">The Design Lab</h1>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <NavButton viewName="dashboard" label="Dashboard" />
          <NavButton viewName="strategy" label="Strategy" />
          <NavButton viewName="marketing" label="Marketing" />
          <NavButton viewName="settings" label="Settings" />
        </nav>
        <div className="flex items-center gap-6">
          <WidgetIcons isAuthenticated={isAuthenticated} />
          <Auth user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} />
        </div>
      </header>
      <main className="flex-grow overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="h-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;