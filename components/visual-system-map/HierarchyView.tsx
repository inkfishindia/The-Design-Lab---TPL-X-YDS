import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VsmNode, NodeType, FilterSettings } from './shared';
import { Skeleton } from '../ui/Skeleton';
import { ChevronDoubleRightIcon } from '../icons/ChevronDoubleRightIcon';
import { SheetKey } from '../../services/configService';

interface HierarchyViewProps {
    data: Record<string, any[]>;
    isLoading: boolean;
    filters: FilterSettings;
    selectedNode: VsmNode | null;
    onNodeSelect: (node: VsmNode | null) => void;
}

const TreeNode: React.FC<{ 
    node: VsmNode,
    depth: number,
    onSelect: (node: VsmNode) => void,
    selectedNode: VsmNode | null,
    filters: FilterSettings
}> = ({ node, depth, onSelect, selectedNode, filters }) => {
    const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
    const isVisible = filters[node.type] !== false;
    const isSelected = selectedNode?.id === node.id;

    if (!isVisible) return null;

    const hasVisibleChildren = node.children?.some(child => filters[child.type] !== false) ?? false;

    return (
        <div style={{ paddingLeft: `${depth * 20}px` }}>
            <div 
                onClick={() => onSelect(node)}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-accent-blue/20' : 'hover:bg-dark-border/50'}`}
            >
                {hasVisibleChildren && (
                    <motion.button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        className="p-1 rounded-full hover:bg-dark-border"
                    >
                        <ChevronDoubleRightIcon className="w-3 h-3" />
                    </motion.button>
                )}
                {!hasVisibleChildren && <div className="w-5 h-5" /> /* Spacer */}
                <span className="text-sm font-medium truncate">{node.label}</span>
                <span className="text-xs text-text-muted/60 capitalize ml-auto">[{node.type}]</span>
            </div>
             <AnimatePresence>
                {isExpanded && hasVisibleChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {node.children?.map(child => (
                            <TreeNode 
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                onSelect={onSelect}
                                selectedNode={selectedNode}
                                filters={filters}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const HierarchyView: React.FC<HierarchyViewProps> = ({ data, isLoading, filters, selectedNode, onNodeSelect }) => {
    
    const hierarchy = useMemo((): VsmNode => {
        const flywheels = data[SheetKey.FLYWHEEL] || [];
        const businessUnits = data[SheetKey.BUSINESS_UNITS] || [];
        const projects = data[SheetKey.PROJECTS] || [];
        const people = data[SheetKey.PEOPLE] || [];
        const hubs = data[SheetKey.HUBS] || [];

        const peopleByHub: Record<string, VsmNode[]> = (people).reduce((acc, p) => {
            const hubId = String(p.hub_id);
            if (!acc[hubId]) acc[hubId] = [];
            acc[hubId].push({ id: `person-${p.User_id}`, label: p.full_name, type: 'person', data: p });
            return acc;
        }, {} as Record<string, VsmNode[]>);

        const hubsNodes = hubs.map((h): VsmNode => ({
            id: `hub-${h.function_id}`,
            label: h.function_name,
            type: 'hub',
            data: h,
            children: peopleByHub[String(h.function_id)] || []
        }));

        const projectNodes: Record<string, VsmNode[]> = (projects).reduce((acc, p) => {
            const buId = String(p.business_unit_id);
            if (!acc[buId]) acc[buId] = [];
            acc[buId].push({ id: `proj-${p.project_id}`, label: p['Project Name'], type: 'project', data: p });
            return acc;
        }, {} as Record<string, VsmNode[]>);

        const buNodes: Record<string, VsmNode[]> = (businessUnits).reduce((acc, bu) => {
            const fwId = String(bu.primary_flywheel_id);
            if (!acc[fwId]) acc[fwId] = [];
            acc[fwId].push({ id: `bu-${bu.bu_id}`, label: bu.bu_name, type: 'businessUnit', data: bu, children: projectNodes[String(bu.bu_id)] || [] });
            return acc;
        }, {} as Record<string, VsmNode[]>);

        const flywheelNodes = flywheels.map((fw): VsmNode => ({
            id: `fw-${fw.flywheel_id}`,
            label: fw.flywheel_name,
            type: 'flywheel',
            data: fw,
            children: buNodes[String(fw.flywheel_id)] || [],
        }));

        return {
            id: 'brand-root',
            label: 'YDS Brand',
            type: 'brand',
            data: { name: 'Your Design System' },
            children: [...flywheelNodes, ...hubsNodes]
        };

    }, [data]);

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" style={{ width: `${Math.random() * 50 + 50}%` }}/>
                ))}
            </div>
        );
    }
    
    return (
        <div>
            <TreeNode node={hierarchy} depth={0} onSelect={onNodeSelect} selectedNode={selectedNode} filters={filters} />
        </div>
    );
};