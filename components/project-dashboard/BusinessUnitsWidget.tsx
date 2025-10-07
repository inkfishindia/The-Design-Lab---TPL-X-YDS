
import React from 'react';
import type { BusinessUnit } from '../../types';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { Tooltip } from '../ui/Tooltip';

const formatCurrency = (value: any) => {
    const number = Number(value);
    if (isNaN(number) || value === null) return 'N/A';
    if (number >= 1000000) return `₹${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `₹${(number / 1000).toFixed(0)}K`;
    return `₹${number}`;
};

const BusinessUnitTooltipContent: React.FC<{ unit: BusinessUnit }> = ({ unit }) => (
    <div className="space-y-2 text-xs">
        <h5 className="font-bold text-accent-blue mb-1">{unit.bu_name} Details</h5>
        <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
            <span className="font-semibold text-text-muted">Platform:</span>
            <span className="break-words">{unit.platform_type}</span>
            <span className="font-semibold text-text-muted">Interface:</span>
            <span className="break-words">{unit.interface}</span>
            <span className="font-semibold text-text-muted">Pricing Model:</span>
            <span className="break-words">{unit.pricing_model}</span>
            <span className="font-semibold text-text-muted">Sales Motion:</span>
            <span className="break-words">{unit['Sales Motion']}</span>
            <span className="font-semibold text-text-muted">Support Type:</span>
            <span className="break-words">{unit['Support Type']}</span>
            <span className="font-semibold text-text-muted">Tech Build:</span>
            <span className="break-words">{unit['Tech Build']}</span>
        </div>
    </div>
);

const BusinessUnitCard: React.FC<{ unit: BusinessUnit, onClick: () => void; isActive: boolean; className?: string; }> = ({ unit, onClick, isActive, className }) => {
    const avgOrderValue = Number(unit['avg_order_value'] || 0);
    const targetMargin = Number(unit['target_margin_pct'] || 0);

    return (
        <button 
            onClick={onClick}
            className={`bg-heritage-blue/20 rounded-lg p-4 w-full text-left transition-all duration-200 ${isActive ? 'ring-2 ring-creativity-orange' : 'hover:bg-heritage-blue/30'} ${className || ''}`}
        >
             <h4 className="font-bold text-cream text-base truncate" title={String(unit['bu_name'])}>{String(unit['bu_name'])}</h4>
            <div className="mt-3 pt-3 border-t border-cream/20 text-xs space-y-2 text-cream">
                <div className="flex justify-between">
                    <span className="text-cream/70">Avg. Order Value:</span>
                    <span className="font-semibold">{formatCurrency(avgOrderValue)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-cream/70">Target Margin:</span>
                    <span className="font-semibold">{(targetMargin * 100).toFixed(0)}%</span>
                </div>
            </div>
        </button>
    );
};

interface BusinessUnitsWidgetProps {
    units: BusinessUnit[];
    isLoading: boolean;
    onUnitSelect: (unit: BusinessUnit) => void;
    highlightedUnitId: string | null;
}

export const BusinessUnitsWidget: React.FC<BusinessUnitsWidgetProps> = ({ units, isLoading, onUnitSelect, highlightedUnitId }) => {
    
    const SkeletonLoader = () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full !bg-cream/10" />
            ))}
        </div>
    );

    return (
        <div>
            <h3 className="text-lg font-semibold text-cream mb-4">Business Units</h3>
            {isLoading ? <SkeletonLoader /> : units.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {units.map(unit => (
                        <Tooltip key={unit.rowIndex} content={<BusinessUnitTooltipContent unit={unit} />}>
                            <BusinessUnitCard 
                                unit={unit} 
                                onClick={() => onUnitSelect(unit)}
                                isActive={String(unit['bu_id']) === highlightedUnitId}
                            />
                        </Tooltip>
                    ))}
                </div>
            ) : (
                <div className="bg-heritage-blue/20 p-8 text-center rounded-lg">
                    <p className="text-cream/70">No business units found.</p>
                </div>
            )}
        </div>
    );
};
