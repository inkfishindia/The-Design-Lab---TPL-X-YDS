import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { TokenResponse, Project, ProjectTask, SheetUser, BusinessUnit, Flywheel, Hub, Platform, Touchpoint, Campaign } from '../types';
import { fetchSheetData } from '../services/googleSheetsService';
import { hydrateData } from '../services/dataHydrationService';
import { useToast } from './ui/Toast';
import { VerticalSplitter } from './ui/Splitter';
import { FilterPanel } from './visual-system-map/FilterPanel';
import { HierarchyView } from './visual-system-map/HierarchyView';
import { DetailPanel } from './visual-system-map/DetailPanel';
import { Button } from './ui/Button';
import type { VsmNode, VsmViewType, FilterSettings } from './visual-system-map/shared';
import { SHEET_REGISTRY, SheetKey } from '../services/configService';

interface VisualSystemMapViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
}

export const VisualSystemMapView: React.FC<VisualSystemMapViewProps> = ({ isAuthenticated, token }) => {
    const toast = useToast();

    // Data states
    const [data, setData] = useState<Record<string, any[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const [activeView, setActiveView] = useState<VsmViewType>('hierarchy');
    const [selectedNode, setSelectedNode] = useState<VsmNode | null>(null);
    const [filters, setFilters] = useState<FilterSettings>({
        flywheel: true,
        businessUnit: true,
        hub: true,
        project: true,
        person: true,
        platform: true,
        campaign: true,
        touchpoint: true,
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const accessToken = token?.access_token || null;
            const sheetKeys = Object.keys(SHEET_REGISTRY) as SheetKey[];
            const promises = sheetKeys.map(key => fetchSheetData(key, accessToken));
            const results = await Promise.all(promises);
            
            const allData = sheetKeys.reduce((acc, key, index) => ({ ...acc, [key]: results[index] }), {} as Record<SheetKey, any[]>);

            // Hydrate data
            const hydratedData = Object.keys(allData).reduce((acc, key) => ({
                ...acc,
                [key]: hydrateData(allData[key as SheetKey], key as SheetKey, allData),
            }), {});

            setData(hydratedData);

        } catch (error) {
            const msg = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Failed to load system map data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, [token, toast]);

    useEffect(() => {
        fetchData();
    }, [isAuthenticated, token, fetchData]);

    return (
      <div className="p-6 text-text-light flex flex-col h-full gap-6">
            <header className="flex-shrink-0 flex items-center justify-between">
                <div />
                <div className="p-1 bg-dark-surface rounded-lg flex items-center gap-1">
                    <Button onClick={() => setActiveView('radial')} variant={activeView === 'radial' ? 'primary' : 'secondary'} size="sm" className={activeView === 'radial' ? '' : '!bg-transparent !text-text-muted'} disabled>Radial</Button>
                    <Button onClick={() => setActiveView('hierarchy')} variant={activeView === 'hierarchy' ? 'primary' : 'secondary'} size="sm" className={activeView === 'hierarchy' ? '' : '!bg-transparent !text-text-muted'}>Hierarchy</Button>
                    <Button onClick={() => setActiveView('funnel')} variant={activeView === 'funnel' ? 'primary' : 'secondary'} size="sm" className={activeView === 'funnel' ? '' : '!bg-transparent !text-text-muted'} disabled>Funnel</Button>
                    <Button onClick={() => setActiveView('network')} variant={activeView === 'network' ? 'primary' : 'secondary'} size="sm" className={activeView === 'network' ? '' : '!bg-transparent !text-text-muted'} disabled>Network</Button>
                </div>
            </header>

            <div className="flex-grow min-h-0">
                 <VerticalSplitter storageKey="vsm-main-splitter" initialSize={75} minSize={50} maxSize={85}>
                    <VerticalSplitter storageKey="vsm-left-splitter" initialSize={25} minSize={15} maxSize={40}>
                        <FilterPanel filters={filters} onFilterChange={setFilters} />
                        <div className="bg-dark-surface rounded-xl border border-dark-border p-4 h-full overflow-auto">
                            {activeView === 'hierarchy' && <HierarchyView data={data} isLoading={isLoading} filters={filters} onNodeSelect={setSelectedNode} selectedNode={selectedNode} />}
                            {(activeView !== 'hierarchy') && <p className="text-center text-text-muted p-8">This view is not yet implemented.</p>}
                        </div>
                    </VerticalSplitter>
                    <DetailPanel node={selectedNode} />
                </VerticalSplitter>
            </div>
      </div>
    );
};
