

import React from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { Account } from '../../types';

interface AccountsListProps {
  accounts: Account[];
  isLoading: boolean;
}

const AccountCard: React.FC<{ account: Account }> = ({ account }) => {
    return (
        <Card>
            <h4 className="font-bold text-lg text-heritage-blue">{String(account['company_name'])}</h4>
            <a href={String(account['website'])} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{String(account['website'])}</a>
            <div className="mt-3 pt-3 border-t border-midnight-navy/10 text-xs text-midnight-navy/80 space-y-1">
                <p><strong>AE:</strong> {String(account['account_executive_fk_resolved'] || account['account_executive_fk'])}</p>
                <p><strong>Vertical:</strong> {String(account['vertical_niche'])}</p>
                <p><strong>Platform:</strong> {String(account['platform_tech'])}</p>
            </div>
        </Card>
    );
};

export const AccountsList: React.FC<AccountsListProps> = ({ accounts, isLoading }) => {
    
    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-2 border-t border-midnight-navy/10">
                         <Skeleton className="h-3 w-full" />
                         <Skeleton className="h-3 w-full mt-2" />
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <div>
            <h3 className="text-2xl font-bold font-display text-cream mb-6">All Accounts</h3>
            {isLoading && <SkeletonLoader />}
            {!isLoading && accounts.length === 0 && (
                <Card>
                    <p className="text-center p-8 text-midnight-navy/70">No accounts found.</p>
                </Card>
            )}
            {!isLoading && accounts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map(account => (
                        <AccountCard key={account.rowIndex} account={account} />
                    ))}
                </div>
            )}
        </div>
    );
};
