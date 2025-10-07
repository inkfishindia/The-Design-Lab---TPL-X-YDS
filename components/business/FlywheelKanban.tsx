
import React, { useMemo } from 'react';
import type { Flywheel, BusinessUnit } from '../../types';
import { Skeleton } from '../ui/Skeleton';
import { Tooltip } from '../ui/Tooltip';
import { InfoIcon } from '../icons/InfoIcon';

const BusinessUnitCard: React.FC<{ unit: BusinessUnit; onClick: (e: React.MouseEvent) => void; isActive: boolean; }> = ({ unit, onClick, isActive }) => (
    <div
        onClick={onClick}
        className={`bg-dark-bg p-3 rounded-md shadow-sm border border-dark-border cursor-pointer transition-all duration-200 ${isActive ? 'ring-2 ring-accent-orange' : 'hover:bg-dark-border/40'}`}
    >
        <p className="font-bold text-sm text-accent-blue">{String(unit.bu_name)}</p>
        <p className="text-xs text-text-muted mt-1">{String(unit.platform_type)}</p>
        <div className="mt-2 text-xs flex justify-between items-center text-text-muted">
            <span>{String(unit.pricing_model)}</span>
            <span className="font-semibold">{String(unit['Customer Type'])}</span>
        </div>
    </div>
);

const formatCurrency = (value: any) => {
    const number = Number(value);
    if (isNaN(number) || value === null) return 'N/A';
    if (number >= 1000000) return `₹${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `₹${(number / 1000).toFixed(0)}K`;
    return `₹${number}`;
};

const FlywheelTooltipContent: React.FC<{ flywheel: Flywheel }> = ({ flywheel }) => (
    <div className="space-y-2 text-xs text-left">
        <h5 className="font-bold text-accent-blue mb-1">{flywheel.flywheel_name} Details</h5>
        <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
            <span className="font-semibold text-text-muted">Target Revenue:</span>
            <span>{formatCurrency(flywheel.target_revenue)}</span>
            <span className="font-semibold text-text-muted">Target Orders:</span>
            <span>{flywheel.target_orders}</span>
            <span className="font-semibold text-text-muted">Customer Type:</span>
            <span>{flywheel['Customer Type']}</span>
            <span className="font-semibold text-text-muted">Order Size:</span>
            <span>{flywheel['Order Size']}</span>
            <span className="font-semibold text-text-muted">Motion:</span>
            <span>{flywheel.Motion}</span>
            <span className="font-semibold text-text-muted">Channel:</span>
            <span>{flywheel.Channel}</span>
            <span className="font-semibold text-text-muted">Notes:</span>
            <span className="break-words">{flywheel.notes}</span>
        </div>
    </div>
);


interface FlywheelKanbanProps {
  flywheels: Flywheel[];
  businessUnits: BusinessUnit[];
  isLoading: boolean;
  onFilterChange: (filter: { type: 'flywheel' | 'businessUnit', id: string, name: string } | null) => void;
  activeFilter: { type: 'flywheel' | 'businessUnit', id: string, name: string } | null;
}

export const FlywheelKanban: React.FC<FlywheelKanbanProps> = ({ flywheels, businessUnits, isLoading, onFilterChange, activeFilter }) => {
    const unitsByFlywheel = useMemo(() => {
        const grouped: { [key: string]: BusinessUnit[] } = {};
        for (const flywheel of flywheels) {
            const flywheelId = String(flywheel.flywheel_id);
            if (flywheelId) {
                grouped[flywheelId] = [];
            }
        }
        for (const unit of businessUnits) {
            const flywheelId = String(unit.primary_flywheel_id);
            if (flywheelId && grouped.hasOwnProperty(flywheelId)) {
                grouped[flywheelId].push(unit);
            }
        }
        return grouped;
    }, [flywheels, businessUnits]);

    if (isLoading) {
        return (
            <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-1 min-w-[250px] bg-dark-bg/50 rounded-lg p-3 space-y-3">
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-px w-full my-2" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-px w-full my-2" />
                        <Skeleton className="h-20 w-full mt-2" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {flywheels.map(flywheel => {
                const flywheelId = String(flywheel.flywheel_id);
                const units = unitsByFlywheel[flywheelId] || [];
                const isFlywheelActive = activeFilter?.type === 'flywheel' && activeFilter.id === flywheelId;

                return (
                    <div 
                        key={flywheelId}
                        className={`flex-1 flex flex-col bg-dark-bg/50 rounded-lg p-3 min-w-[250px] cursor-pointer transition-all duration-200 ${isFlywheelActive ? 'ring-2 ring-accent-orange' : 'hover:ring-1 hover:ring-accent-orange/50'}`}
                        onClick={() => onFilterChange({ type: 'flywheel', id: flywheelId, name: String(flywheel.flywheel_name) })}
                    >
                        <div className="text-center">
                            <div className="font-semibold text-text-light text-base inline-flex items-center gap-2">
                                {flywheel.flywheel_name}
                                <Tooltip content={<FlywheelTooltipContent flywheel={flywheel} />}>
                                    <span className="cursor-pointer">
                                        <InfoIcon className="w-4 h-4 text-text-muted hover:text-text-light transition-colors" />
                                    </span>
                                </Tooltip>
                            </div>
                        </div>
                        
                        <div className="border-t border-b border-dark-border my-3 py-3 text-xs text-text-muted">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-2">
                                <span>Target:</span>
                                <span className="font-semibold text-text-light text-right">{formatCurrency(flywheel.target_revenue)}</span>
                                
                                <span>Customer:</span>
                                <span className="font-semibold text-text-light text-right truncate" title={String(flywheel['Customer Type'])}>{flywheel['Customer Type']}</span>
                                
                                <span>Motion:</span>
                                <span className="font-semibold text-text-light text-right">{flywheel.Motion}</span>
                                
                                <span>Channel:</span>
                                <span className="font-semibold text-text-light text-right">{flywheel.Channel}</span>
                            </div>
                        </div>

                        <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                           {units.length > 0 ? units.map(unit => {
                               const isUnitActive = activeFilter?.type === 'businessUnit' && activeFilter.id === String(unit.bu_id);
                               return (
                                   <BusinessUnitCard 
                                       key={String(unit.bu_id)} 
                                       unit={unit} 
                                       isActive={isUnitActive}
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           onFilterChange({ type: 'businessUnit', id: String(unit.bu_id), name: String(unit.bu_name) });
                                       }}
                                   />
                               );
                           }) : <p className="text-xs text-center text-text-muted/50 p-4">No business units in this flywheel.</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
