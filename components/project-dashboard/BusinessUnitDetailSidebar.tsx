
import React from 'react';
import { motion } from 'framer-motion';
import type { BusinessUnit, Project } from '../../types';
import { Button } from '../ui/Button';
import { CloseIcon } from '../icons/CloseIcon';
import { Badge } from '../ui/Badge';

interface BusinessUnitDetailSidebarProps {
  unit: BusinessUnit;
  projects: Project[];
  onClose: () => void;
  onProjectSelect: (project: Project) => void;
}

const formatCurrency = (value: any) => {
    const number = Number(value);
    if (isNaN(number)) return String(value);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
};

const ProjectItem: React.FC<{ project: Project, onClick: () => void }> = ({ project, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-3 bg-midnight-navy/5 rounded-lg hover:bg-midnight-navy/10 transition-colors">
        <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-sm text-midnight-navy">{String(project['Project Name'])}</p>
            <div className="flex-shrink-0">
                <Badge color="blue">{String(project['Status'])}</Badge>
            </div>
        </div>
        <div className="mt-2 text-xs text-midnight-navy/70">
            Owner: {String(project['owner_user_id_resolved'] || project['owner_user_id'])}
        </div>
    </button>
);

const DetailItem: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-midnight-navy/60 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium text-midnight-navy mt-1">{value || '—'}</div>
    </div>
);

export const BusinessUnitDetailSidebar: React.FC<BusinessUnitDetailSidebarProps> = ({ unit, projects, onClose, onProjectSelect }) => {
    return (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col"
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-midnight-navy/10">
                    <div className="flex-grow min-w-0">
                        <h2 className="text-xl font-bold text-heritage-blue truncate" title={String(unit['bu_name'])}>{String(unit['bu_name'])}</h2>
                    </div>
                    <Button onClick={onClose} variant="secondary" size="sm" className="!p-2">
                        <CloseIcon className="w-5 h-5" />
                    </Button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-base font-semibold text-midnight-navy mb-3">Unit Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                               <DetailItem label="Platform Type" value={String(unit['platform_type'])} />
                               <DetailItem label="Pricing Model" value={String(unit['pricing_model'])} />
                               <DetailItem label="Avg. Order Value" value={formatCurrency(unit['avg_order_value'])} />
                               <DetailItem label="Target Margin" value={`${(Number(unit['target_margin_pct'] || 0) * 100).toFixed(0)}%`} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-base font-semibold text-midnight-navy mb-3">Projects ({projects.length})</h3>
                            {projects.length > 0 ? (
                                <div className="space-y-3">
                                    {projects.map(p => <ProjectItem key={p.rowIndex} project={p} onClick={() => onProjectSelect(p)} />)}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-midnight-navy/70 p-4 bg-midnight-navy/5 rounded-lg">
                                    No projects found for this business unit.
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};