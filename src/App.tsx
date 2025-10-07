



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { TeamSettingsView } from './components/TeamSettingsView';
import { NotionView } from './components/NotionView';
import { CommandCentreView } from './components/CommandCentreView';
import { ProjectDashboardView } from './components/ProjectDashboardView';
import { LeadsDashboardView } from './components/LeadsDashboardView';
import { Sidebar } from './components/Sidebar';
import { ProfileMenu } from './components/ProfileMenu';
import { ToastProvider, useToast } from './components/ui/Toast';
import { clearSheetCache } from './services/cachingService';

import { initGoogleAuth, signIn, signOut } from './services/googleAuthService';
import type { GoogleUser, TokenResponse } from './types';

import { DashboardIcon } from './components/icons/DashboardIcon';
import { ProjectIcon } from './components/icons/ProjectIcon';
import { ReportsIcon } from './components/icons/ReportsIcon';
import { BusinessUnitIcon } from './components/icons/BusinessUnitIcon';
import { MarketingIcon } from './components/icons/MarketingIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { LeadsIcon } from './components/icons/LeadsIcon';
import { NotionIcon } from './components/icons/NotionIcon';
import { BrainIcon } from './components/icons/BrainIcon';
import { CommandCentreIcon } from './components/icons/CommandCentreIcon';

import { BusinessView } from './components/BusinessView';
import { MarketingView } from './components/MarketingView';
import { CustomersView } from './components/CustomersView';
import { ReportsView } from './components/ReportsView';
import { StrategyView } from './components/StrategyView';
import { Button } from './components/ui/Button';
import { GoogleIcon } from './components/icons/GoogleIcon';

type NavItem = { 
    viewName: 'dashboard' | 'business' | 'projects' | 'marketing' | 'partners' | 'customers' | 'reports' | 'notion' | 'strategy' | 'commandCentre' | 'settings' | 'teamSettings',
    label: string,
    // FIX: Changed icon type to be a ReactElement that accepts a className prop, ensuring type safety with React.cloneElement.
    icon: React.ReactElement<{ className?: string }>
};

const allNavItems: NavItem[] = [
    { viewName: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { viewName: 'commandCentre', label: 'Command Centre', icon: <CommandCentreIcon className="w-6 h-6" />},
    { viewName: 'business', label: 'Business', icon: <BusinessUnitIcon className="w-6 h-6" /> },
    { viewName: 'projects', label: 'Projects', icon: <ProjectIcon className="w-6 h-6" /> },
    { viewName: 'strategy', label: 'Strategy', icon: <BrainIcon className="w-6 h-6" /> },
    { viewName: 'marketing', label: 'Marketing', icon: <MarketingIcon className="w-6 h-6" /> },
    { viewName: 'partners', label: 'Partners', icon: <UsersIcon className="w-6 h-6" /> },
    { viewName: 'customers', label: 'Customers', icon: <LeadsIcon className="w-6 h-6" /> },
    { viewName: 'reports', label: 'Reports', icon: <ReportsIcon className="w-6 h-6" /> },
    { viewName: 'notion', label: 'Notion', icon: <NotionIcon className="w-6 h-6" /> },
];

type ViewName = NavItem['viewName'];

// Helper function to get initial state from localStorage
const getInitialAuthState = () => {
    try {
        const storedTokenStr = localStorage.getItem('googleAuthToken');
        const storedUserStr = localStorage.getItem('googleAuthUser');
        const storedExpiryStr = localStorage.getItem('googleAuthExpiry');

        if (storedTokenStr && storedUserStr && storedExpiryStr) {
            const expiryTime = JSON.parse(storedExpiryStr);
            if (Date.now() < expiryTime) {
                return {
                    isAuthenticated: true,
                    token: JSON.parse(storedTokenStr) as TokenResponse,
                    user: JSON.parse(storedUserStr) as GoogleUser,
                    initialView: 'dashboard' as ViewName,
                };
            } else {
                // Token expired, clear it
                localStorage.removeItem('googleAuthToken');
                localStorage.removeItem('googleAuthUser');
                localStorage.removeItem('googleAuthExpiry');
            }
        }
    } catch (error) {
        console.error("Failed to load auth state from localStorage", error);
        // On error, clear potentially corrupted data
        localStorage.removeItem('googleAuthToken');
        localStorage.removeItem('googleAuthUser');
        localStorage.removeItem('googleAuthExpiry');
    }

    // Default state for logged-out user
    return {
        isAuthenticated: false,
        token: null,
        user: null,
        initialView: 'dashboard' as ViewName,
    };
};

const AppContent: React.FC = () => {
    const { initialView, ...initialAuthState } = getInitialAuthState();
  
    const [activeView, setActiveView] = useState<ViewName>(initialView);
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState.isAuthenticated);
    const [user, setUser] = useState<GoogleUser | null>(initialAuthState.user);
    const [token, setToken] = useState<TokenResponse | null>(initialAuthState.token);
    const toast = useToast();
    
    useEffect(() => {
        initGoogleAuth();
    }, []);
    
    useEffect(() => {
        if (isAuthenticated) {
            toast.success("Signed in successfully!");
        }
    }, [isAuthenticated, toast]);


    const handleSignIn = useCallback((tokenResponse: TokenResponse, profile: GoogleUser) => {
        clearSheetCache(); // Clear stale mock data
        setToken(tokenResponse);
        setUser(profile);
        setIsAuthenticated(true);
        setActiveView('dashboard');

        try {
            const expiryTime = Date.now() + (tokenResponse.expires_in * 1000);
            localStorage.setItem('googleAuthToken', JSON.stringify(tokenResponse));
            localStorage.setItem('googleAuthUser', JSON.stringify(profile));
            localStorage.setItem('googleAuthExpiry', JSON.stringify(expiryTime));
        } catch (storageError) {
            console.error("Failed to save auth state to localStorage:", storageError);
        }
    }, []);

    const handleSignOut = useCallback(() => {
        if (token?.access_token) {
        signOut(token.access_token);
        }
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setActiveView('dashboard');
        clearSheetCache(); // Clear live data

        try {
        localStorage.removeItem('googleAuthToken');
        localStorage.removeItem('googleAuthUser');
        localStorage.removeItem('googleAuthExpiry');
        } catch (storageError) {
        console.error("Failed to clear auth state from localStorage:", storageError);
        }
    }, [token]);

    const handleNavigateToSettings = useCallback(() => {
        setActiveView('settings');
    }, []);

    const handleSignInRequest = useCallback(() => {
        signIn(handleSignIn);
    }, [handleSignIn]);


    const views = useMemo(() => ({
        dashboard: <DashboardView isAuthenticated={isAuthenticated} token={token} user={user} onSignInRequest={handleSignInRequest} />,
        commandCentre: <CommandCentreView isAuthenticated={isAuthenticated} token={token} user={user} onSignInRequest={handleSignInRequest} />,
        business: <BusinessView isAuthenticated={isAuthenticated} token={token} />,
        projects: <ProjectDashboardView isAuthenticated={isAuthenticated} token={token} user={user} onSignInRequest={handleSignInRequest} />,
        strategy: <StrategyView isAuthenticated={isAuthenticated} token={token} />,
        marketing: <MarketingView isAuthenticated={isAuthenticated} token={token} user={user} />,
        partners: <LeadsDashboardView isAuthenticated={isAuthenticated} token={token} user={user} onSignInRequest={handleSignInRequest} />,
        customers: <CustomersView />,
        reports: <ReportsView />,
        notion: <NotionView />,
        settings: <SettingsView user={user} onSignIn={handleSignInRequest} onSignOut={handleSignOut} setActiveView={setActiveView} />,
        teamSettings: <TeamSettingsView isAuthenticated={isAuthenticated} token={token} onSignInRequest={handleSignInRequest} setActiveView={setActiveView} />,
    }), [isAuthenticated, token, user, handleSignInRequest, handleSignOut]);


    const isSettingsView = activeView === 'settings' || activeView === 'teamSettings';


    return (
        <div className="flex h-screen font-sans bg-dark-bg text-text-light">
            <Sidebar 
                activeView={activeView}
                setActiveView={setActiveView}
                navItems={allNavItems}
            />
            <div className="flex-grow flex flex-col overflow-hidden">
                {!isSettingsView && (
                    <header className="flex-shrink-0 flex items-center justify-between h-[72px] border-b border-dark-border px-6">
                        <div />
                        <div className="flex items-center gap-4">
                            {!user && (
                                <Button onClick={handleSignInRequest} variant="primary" size="md" leftIcon={<GoogleIcon className="w-5 h-5" />}>
                                    Sign in with Google
                                </Button>
                            )}
                            <ProfileMenu 
                                user={user} 
                                onSignOut={handleSignOut} 
                                onNavigateToSettings={handleNavigateToSettings} 
                            />
                        </div>
                    </header>
                )}
                 <main className="flex-grow overflow-y-auto">
                    {Object.keys(views).map((viewName) => (
                        <div
                            key={viewName}
                            style={{ display: activeView === viewName ? 'block' : 'none' }}
                            className="w-full h-full"
                        >
                            {views[viewName as ViewName]}
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);

export default App;