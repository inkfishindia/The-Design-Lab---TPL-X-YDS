import React from 'react';
import type { VsmNode } from './shared';

interface DetailPanelProps {
    node: VsmNode | null;
}

const DetailItem: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-text-muted/80 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium text-text-light mt-1">{value || '—'}</div>
    </div>
);

const renderNodeDetails = (node: VsmNode) => {
    switch(node.type) {
        case 'brand':
            return <DetailItem label="Name" value={node.data.name} />;
        case 'flywheel':
            return (
                <div className="space-y-3">
                    <DetailItem label="Target Revenue" value={node.data.target_revenue} />
                    <DetailItem label="Customer Type" value={node.data['Customer Type']} />
                    <DetailItem label="Motion" value={node.data.Motion} />
                    <DetailItem label="Channel" value={node.data.Channel} />
                    <DetailItem label="Notes" value={node.data.notes} />
                </div>
            );
        case 'businessUnit':
             return (
                <div className="space-y-3">
                    <DetailItem label="Platform Type" value={node.data.platform_type} />
                    <DetailItem label="Pricing Model" value={node.data.pricing_model} />
                    <DetailItem label="Sales Motion" value={node.data['Sales Motion']} />
                    <DetailItem label="Avg. Order Value" value={node.data.avg_order_value} />
                </div>
            );
        case 'project':
            return (
                <div className="space-y-3">
                    <DetailItem label="Owner" value={node.data.owner_user_id_resolved || node.data.owner_user_id} />
                    <DetailItem label="Status" value={node.data.Status} />
                    <DetailItem label="Priority" value={node.data.priority} />
                    <DetailItem label="Confidence" value={`${node.data.confidence_pct || 0}%`} />
                </div>
            );
        default:
            return <p className="text-sm text-text-muted">No details available for this node type.</p>
    }
};


export const DetailPanel: React.FC<DetailPanelProps> = ({ node }) => {
    return (
        <div className="bg-dark-surface rounded-xl border border-dark-border p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-text-light mb-4 flex-shrink-0">Details</h3>
            <div className="flex-grow overflow-y-auto pr-2">
                {node ? (
                    <div className="space-y-4">
                        <h4 className="text-xl font-bold text-accent-blue">{node.label}</h4>
                        <p className="text-xs uppercase font-semibold bg-dark-border/50 text-text-muted px-2 py-1 rounded inline-block">{node.type}</p>
                        <div className="border-t border-dark-border pt-4">
                            {renderNodeDetails(node)}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-text-muted">Select a node to see its details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
