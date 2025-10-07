import React from 'react';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import type { FilterSettings, NodeType } from './shared';

interface FilterPanelProps {
    filters: FilterSettings;
    onFilterChange: (filters: FilterSettings) => void;
}

const filterableLayers: { id: NodeType, label: string }[] = [
    { id: 'flywheel', label: 'Flywheels' },
    { id: 'businessUnit', label: 'Business Units' },
    { id: 'hub', label: 'Hubs' },
    { id: 'platform', label: 'Platforms' },
    { id: 'touchpoint', label: 'Touchpoints' },
    { id: 'campaign', label: 'Campaigns' },
    { id: 'project', label: 'Projects' },
    { id: 'person', label: 'People' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {

    const handleToggle = (id: NodeType) => {
        onFilterChange({ ...filters, [id]: !filters[id] });
    };

    return (
        <div className="bg-dark-surface rounded-xl border border-dark-border p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-text-light mb-4">Layer Filters</h3>
            <div className="space-y-4 overflow-y-auto">
                 {filterableLayers.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                        <label htmlFor={`filter-toggle-${item.id}`} className="font-medium text-text-light capitalize">{item.label}</label>
                        <ToggleSwitch
                            id={`filter-toggle-${item.id}`}
                            checked={filters[item.id] !== false}
                            onChange={() => handleToggle(item.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
