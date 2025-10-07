import React from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { BusinessUnit } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';

interface BusinessUnitsListProps {
  isAuthenticated: boolean;
  units: BusinessUnit[];
  headers: string[];
  isLoading: boolean;
  onUnitSelect: (unit: BusinessUnit) => void;
}

const formatCurrency = (value: any) => {
    const number = Number(value);
    if (isNaN(number)) return String(value);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
};

const BusinessUnitCard: React.FC<{ unit: BusinessUnit, onClick: () => void }> = ({ unit, onClick }) => {
    const revenue = Number(unit['current_revenue_monthly'] || 0);
    const target = Number(unit['revenue_target_monthly'] || 0);
    const achievement = target > 0 ? Math.round((revenue / target) * 100) : 0;
    const leadName = unit.lead?.full_name || unit['Responsible_Person'];

    return (
        <Card className="flex flex-col cursor-pointer hover:ring-2 hover:ring-creativity-orange transition-shadow" onClick={onClick}>
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-heritage-blue">{String(unit['Unit_Name'])}</h4>
                <p className="text-sm text-midnight-navy/80 font-semibold">Lead: {String(leadName)}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-midnight-navy/10 text-xs space-y-2">
                <div className="flex justify-between">
                    <span className="text-midnight-navy/70">Revenue (Monthly):</span>
                    <span className="font-semibold">{formatCurrency(revenue)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-midnight-navy/70">Target (Monthly):</span>
                    <span className="font-semibold">{formatCurrency(target)}</span>
                </div>
                 <div className="pt-1">
                    <label className="text-xs font-semibold text-midnight-navy/80">Target Achievement</label>
                    <div className="flex items-center gap-3 mt-1">
                        <ProgressBar progress={achievement} />
                        <span className="text-sm font-semibold">{achievement}%</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export const BusinessUnitsList: React.FC<BusinessUnitsListProps> = ({ isAuthenticated, units, headers, isLoading, onUnitSelect }) => {
    
    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                 <Card key={i} className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-full mt-2" />
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <div>
            <h3 className="text-2xl font-bold font-display text-cream mb-6">Business Units</h3>
            {isLoading && <SkeletonLoader />}
            {!isLoading && units.length === 0 && (
                <Card>
                    <p className="text-center p-8 text-midnight-navy/70">No data found in your 'BUSINESS_UNITS' sheet.</p>
                </Card>
            )}
            {!isLoading && units.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {units.map(unit => (
                        <BusinessUnitCard key={unit.rowIndex} unit={unit} onClick={() => onUnitSelect(unit)} />
                    ))}
                </div>
            )}
        </div>
    );
};
