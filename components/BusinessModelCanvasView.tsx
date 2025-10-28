import React, { useState, useEffect, useCallback } from 'react';
import type { TokenResponse, BmcSegment, BmcBusinessUnit, BmcFlywheel, RevenueStream, CostStructure, Channel, BmcPlatform, BmcTeamMember, BmcHub, BmcPartner, BmcMetric } from '../types';
import { fetchSheetData } from '../services/googleSheetsService';
import { hydrateData } from '../services/dataHydrationService';
import { useToast } from './ui/Toast';
import { SheetKey } from '../services/configService';
import { Card } from './ui/Card';
import { Skeleton } from './ui/Skeleton';
import { StrategyIcon } from './icons/StrategyIcon'; // Reusing for BMC

// Helper component for displaying data in a table-like format
const BmcTable: React.FC<{ title: string; data: any[]; isLoading: boolean; defaultHeaders: string[]; }> = ({ title, data, isLoading, defaultHeaders }) => {
    const headers = data.length > 0 ? Object.keys(data[0]).filter(h => h !== 'rowIndex' && !h.endsWith('_resolved')) : defaultHeaders;

    const renderValue = (item: any, header: string) => {
        const resolvedValue = item[`${header}_resolved`];
        const rawValue = item[header];
        if (resolvedValue) {
            return <span title={`ID: ${rawValue}`}>{String(resolvedValue)}</span>;
        }
        if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
            return <span className="text-text-muted/50">—</span>;
        }
        return String(rawValue);
    };

    return (
        <Card className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-text-light mb-4">{title}</h3>
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
            ) : data.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-text-light">
                        <thead className="text-xs text-text-muted uppercase bg-dark-bg/50">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} scope="col" className="px-4 py-2 font-semibold">
                                        {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-dark-surface">
                            {data.map((item, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-dark-border last:border-b-0 hover:bg-dark-border/50">
                                    {headers.map((header, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-2 align-top">
                                            {renderValue(item, header)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center p-8 text-text-muted">No {title.toLowerCase()} data found.</p>
            )}
        </Card>
    );
};

interface BusinessModelCanvasViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
}

export const BusinessModelCanvasView: React.FC<BusinessModelCanvasViewProps> = ({ isAuthenticated, token }) => {
    const toast = useToast();

    const [segments, setSegments] = useState<BmcSegment[]>([]);
    const [businessUnits, setBusinessUnits] = useState<BmcBusinessUnit[]>([]);
    const [flywheels, setFlywheels] = useState<BmcFlywheel[]>([]);
    const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
    const [costStructure, setCostStructure] = useState<CostStructure[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [platforms, setPlatforms] = useState<BmcPlatform[]>([]);
    const [team, setTeam] = useState<BmcTeamMember[]>([]);
    const [hubs, setHubs] = useState<BmcHub[]>([]);
    const [partners, setPartners] = useState<BmcPartner[]>([]);
    const [metrics, setMetrics] = useState<BmcMetric[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const accessToken = token?.access_token || null;
            
            const sheetKeysToFetch = [
                SheetKey.BMC_SEGMENTS,
                SheetKey.BMC_BUSINESS_UNITS,
                SheetKey.BMC_FLYWHEELS,
                SheetKey.BMC_REVENUE_STREAMS,
                SheetKey.BMC_COST_STRUCTURE,
                SheetKey.BMC_CHANNELS,
                SheetKey.BMC_PLATFORMS,
                SheetKey.BMC_TEAM,
                SheetKey.BMC_HUBS,
                SheetKey.BMC_PARTNERS,
                SheetKey.BMC_METRICS,
            ];

            const results = await Promise.all(sheetKeysToFetch.map(key => fetchSheetData(key, accessToken)));
            
            const allData: Record<SheetKey, any[]> = sheetKeysToFetch.reduce((acc, key, index) => ({ ...acc, [key]: results[index] }), {} as Record<SheetKey, any[]>);

            // Hydrate data using the new BMC-specific hydration maps
            setSegments(hydrateData(allData[SheetKey.BMC_SEGMENTS], SheetKey.BMC_SEGMENTS, allData));
            setBusinessUnits(hydrateData(allData[SheetKey.BMC_BUSINESS_UNITS], SheetKey.BMC_BUSINESS_UNITS, allData));
            setFlywheels(hydrateData(allData[SheetKey.BMC_FLYWHEELS], SheetKey.BMC_FLYWHEELS, allData));
            setRevenueStreams(hydrateData(allData[SheetKey.BMC_REVENUE_STREAMS], SheetKey.BMC_REVENUE_STREAMS, allData));
            setCostStructure(hydrateData(allData[SheetKey.BMC_COST_STRUCTURE], SheetKey.BMC_COST_STRUCTURE, allData));
            setChannels(hydrateData(allData[SheetKey.BMC_CHANNELS], SheetKey.BMC_CHANNELS, allData));
            setPlatforms(hydrateData(allData[SheetKey.BMC_PLATFORMS], SheetKey.BMC_PLATFORMS, allData));
            setTeam(hydrateData(allData[SheetKey.BMC_TEAM], SheetKey.BMC_TEAM, allData));
            setHubs(hydrateData(allData[SheetKey.BMC_HUBS], SheetKey.BMC_HUBS, allData));
            setPartners(hydrateData(allData[SheetKey.BMC_PARTNERS], SheetKey.BMC_PARTNERS, allData));
            setMetrics(hydrateData(allData[SheetKey.BMC_METRICS], SheetKey.BMC_METRICS, allData));

        } catch (error) {
            const msg = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Failed to load business model canvas data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, [token, toast]);

    useEffect(() => {
        fetchData();
    }, [isAuthenticated, token, fetchData]);

    return (
        <div className="p-6 text-text-light flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-display text-text-light mb-4">Business Model Canvas</h1>
            {!isAuthenticated && (
                <div className="bg-accent-orange/10 border border-accent-orange/50 p-4 rounded-lg text-center">
                    <p className="text-text-light font-semibold">Please sign in to view your Business Model Canvas data.</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <BmcTable 
                    title="Customer Segments" 
                    data={segments} 
                    isLoading={isLoading} 
                    defaultHeaders={['segmentName', 'customerProfile', 'jobsToBeDone', 'keyPainPoints']} 
                />
                <BmcTable 
                    title="Value Propositions (Business Units)" 
                    data={businessUnits} 
                    isLoading={isLoading} 
                    defaultHeaders={['businessUnitName', 'coreOffering', 'pricingModel', 'primaryOwner']} 
                />
                <BmcTable 
                    title="Key Activities (Hubs)" 
                    data={hubs} 
                    isLoading={isLoading} 
                    defaultHeaders={['hubName', 'hubType', 'keyActivities', 'primaryOwner']} 
                />
                <BmcTable 
                    title="Key Resources (Platforms)" 
                    data={platforms} 
                    isLoading={isLoading} 
                    defaultHeaders={['platformName', 'platformType', 'purpose', 'owner', 'status']} 
                />
                <BmcTable 
                    title="Key Partners" 
                    data={partners} 
                    isLoading={isLoading} 
                    defaultHeaders={['partnerName', 'partnerType', 'role', 'riskLevel', 'status']} 
                />
                <BmcTable 
                    title="Channels" 
                    data={channels} 
                    isLoading={isLoading} 
                    defaultHeaders={['channelName', 'channelType', 'motionType', 'platformId_resolved', 'flywheelId_resolved']} 
                />
                <BmcTable 
                    title="Customer Relationships (Flywheels)" 
                    data={flywheels} 
                    isLoading={isLoading} 
                    defaultHeaders={['flywheelName', 'customerStruggleSolved', 'acquisitionModel', 'serviceModel']} 
                />
                <BmcTable 
                    title="Revenue Streams" 
                    data={revenueStreams} 
                    isLoading={isLoading} 
                    defaultHeaders={['revenueStreamId', 'businessUnitId_resolved', 'segmentId_resolved', 'nineMonthRevenue', 'aov']} 
                />
                <BmcTable 
                    title="Cost Structure" 
                    data={costStructure} 
                    isLoading={isLoading} 
                    defaultHeaders={['costCategory', 'costType', 'monthlyAmount', 'owner_resolved']} 
                />
                <BmcTable 
                    title="Team & Roles" 
                    data={team} 
                    isLoading={isLoading} 
                    defaultHeaders={['fullName', 'role', 'primaryHub_resolved', 'keyResponsibility']} 
                />
                <BmcTable 
                    title="Key Metrics" 
                    data={metrics} 
                    isLoading={isLoading} 
                    defaultHeaders={['metricName', 'category', 'currentValue', 'target', 'owner_resolved']} 
                />
            </div>
        </div>
    );
};