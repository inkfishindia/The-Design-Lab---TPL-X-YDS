

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { GoogleUser, TokenResponse, Lead, Opportunity, Account, LeadActivity, SheetUser } from '../types';
import { fetchSheetData } from '../services/googleSheetsService';
import { hydrateData } from '../services/dataHydrationService';
import { getAnyCache } from '../services/cachingService';
import { useToast } from './ui/Toast';
import { LeadsDashboardHome } from './leads-dashboard/LeadsDashboardHome';
import { LeadsList } from './leads-dashboard/LeadsList';
import { OpportunitiesList } from './leads-dashboard/OpportunitiesList';
import { AccountsList } from './leads-dashboard/AccountsList';
import { LeadDetailSidebar } from './leads-dashboard/LeadDetailSidebar';
import { SheetKey } from '../services/configService';

interface LeadsDashboardViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
  onSignInRequest: () => void;
}

type LeadsView = 'home' | 'partners' | 'opportunities' | 'accounts';

export const LeadsDashboardView: React.FC<LeadsDashboardViewProps> = ({ isAuthenticated, token, user, onSignInRequest }) => {
    const [activeView, setActiveView] = useState<LeadsView>('home');
    const toast = useToast();

    // Data states
    const [leads, setLeads] = useState<Lead[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [activities, setActivities] = useState<LeadActivity[]>([]);
    const [people, setPeople] = useState<SheetUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Detail view states
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // FIX: All lead-related sheets have been removed from the manifest.
            // Set data to empty arrays to prevent errors.
            setLeads([]);
            setOpportunities([]);
            setAccounts([]);
            setActivities([]);
            setPeople([]);

        } catch (error) {
            const msg = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Failed to load leads data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchData();
    }, [isAuthenticated, fetchData]);

    const navItems: { id: LeadsView, label: string }[] = [
        { id: 'home', label: 'Home' },
        { id: 'partners', label: 'Partners' },
        { id: 'opportunities', label: 'Opportunities' },
        { id: 'accounts', label: 'Accounts' },
    ];
    
    // Enrich opportunities with SDR owner from the related lead
    const enrichedOpportunities = useMemo(() => {
        const leadsMap = new Map(leads.map(lead => [String(lead.lead_id), lead]));
        return opportunities.map(opp => {
            const relatedLead = leadsMap.get(String(opp.lead_fk));
            if (relatedLead) {
                return {
                    ...opp,
                    sdr_owner_fk: relatedLead.sdr_owner_fk,
                    sdr_owner_fk_resolved: relatedLead.sdr_owner_fk_resolved,
                };
            }
            return opp;
        });
    }, [opportunities, leads]);


    return (
        <div className="bg-dark-surface min-h-full">
             <div className="p-6">
                <nav className="mb-6 border-b border-dark-border">
                    <ul className="flex items-center gap-4">
                        {navItems.map(item => (
                             <li key={item.id}>
                                <button
                                    onClick={() => setActiveView(item.id)}
                                    className={`py-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
                                        activeView === item.id 
                                        ? 'text-accent-orange border-accent-orange' 
                                        : 'text-text-muted border-transparent hover:text-text-light'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main>
                    {activeView === 'home' && <LeadsDashboardHome isLoading={isLoading} />}
                    {activeView === 'partners' && <LeadsList leads={leads} isLoading={isLoading} onLeadSelect={setSelectedLead} />}
                    {activeView === 'opportunities' && <OpportunitiesList opportunities={enrichedOpportunities} isLoading={isLoading} />}
                    {activeView === 'accounts' && <AccountsList accounts={accounts} isLoading={isLoading} />}
                </main>
            </div>
             <AnimatePresence>
                {selectedLead && (
                    <LeadDetailSidebar 
                        lead={selectedLead} 
                        activities={activities.filter(a => String(a.lead_fk) === String(selectedLead.lead_id))}
                        onClose={() => setSelectedLead(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
