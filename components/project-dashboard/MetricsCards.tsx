
import React, { useMemo, useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { DragHandleIcon } from '../icons/DragHandleIcon';

const KpiCard: React.FC<{ title: string; value: string | number; isLoading: boolean }> = ({ title, value, isLoading }) => (
    <Card className="text-center !bg-heritage-blue/30 !p-4 relative cursor-grab active:cursor-grabbing h-full flex flex-col justify-center">
        <div className="absolute top-2 right-2 text-cream/40" title="Drag to reorder">
            <DragHandleIcon className="w-5 h-5" />
        </div>
        {isLoading ? (
            <Skeleton className="h-8 w-20 mx-auto" />
        ) : (
            <p className="text-3xl font-bold font-display text-cream">{value}</p>
        )}
        <p className="text-sm text-cream/70 mt-1">{title}</p>
    </Card>
);

interface MetricsCardsProps {
    isLoading: boolean;
    totalProjects: number;
    activeProjectsTitle: string;
    projectsAtRisk: number;
    projectsAtRiskTitle: string;
    openTasksCount: number;
    openTasksTitle: string;
    teamUtilization: string | number;
    utilizationTitle: string;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ 
    isLoading, 
    totalProjects, 
    activeProjectsTitle,
    projectsAtRisk, 
    projectsAtRiskTitle,
    openTasksCount, 
    openTasksTitle, 
    teamUtilization,
    utilizationTitle
}) => {
    
    const kpiData = useMemo(() => ({
        tasks: { title: openTasksTitle, value: openTasksCount },
        risk: { title: projectsAtRiskTitle, value: projectsAtRisk },
        active: { title: activeProjectsTitle, value: totalProjects },
        utilization: { title: utilizationTitle, value: teamUtilization },
    }), [openTasksTitle, openTasksCount, projectsAtRiskTitle, projectsAtRisk, activeProjectsTitle, totalProjects, utilizationTitle, teamUtilization]);

    const [cardOrder, setCardOrder] = useState<string[]>(Object.keys(kpiData));

    useEffect(() => {
        try {
            const savedOrder = localStorage.getItem('projectDashboard_cardOrder');
            if (savedOrder) {
                const parsedOrder = JSON.parse(savedOrder);
                const defaultKeys = Object.keys(kpiData);
                if (Array.isArray(parsedOrder) && parsedOrder.length === defaultKeys.length && parsedOrder.every(key => defaultKeys.includes(key))) {
                    setCardOrder(parsedOrder);
                }
            }
        } catch (e) {
            console.error("Failed to load card order from localStorage", e);
        }
    }, [kpiData]);

    const handleReorder = (newOrder: string[]) => {
        setCardOrder(newOrder);
        try {
            localStorage.setItem('projectDashboard_cardOrder', JSON.stringify(newOrder));
        } catch (e) {
            console.error("Failed to save card order to localStorage", e);
        }
    };

    return (
        <Reorder.Group
            as="div"
            axis="x"
            values={cardOrder}
            onReorder={handleReorder}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
            {cardOrder.map(id => (
                <Reorder.Item key={id} value={id}>
                   <KpiCard
                        title={kpiData[id as keyof typeof kpiData].title}
                        value={isLoading ? '...' : kpiData[id as keyof typeof kpiData].value}
                        isLoading={isLoading}
                    />
                </Reorder.Item>
            ))}
        </Reorder.Group>
    );
};
