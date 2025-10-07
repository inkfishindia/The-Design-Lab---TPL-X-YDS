

import React from 'react';
import { motion } from 'framer-motion';
import type { ProjectTask } from '../../types';
import { Button } from '../ui/Button';
import { CloseIcon } from '../icons/CloseIcon';
import { Badge } from '../ui/Badge';

interface TaskDetailSidebarProps {
  task: ProjectTask;
  onClose: () => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const lowerStatus = String(status || '').toLowerCase();
    let color: 'green' | 'blue' | 'gray' | 'red' = 'gray';
    if (['done', 'completed'].includes(lowerStatus)) color = 'green';
    else if (lowerStatus.includes('in_progress')) color = 'blue';
    else if (lowerStatus.includes('blocked')) color = 'red';
    return <Badge color={color}>{status}</Badge>;
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    const colorMap: { [key: string]: 'red' | 'orange' | 'gray' } = {
        'high': 'red',
        'medium': 'orange',
        'low': 'gray',
    };
    const color = colorMap[String(priority).toLowerCase() as keyof typeof colorMap] || 'gray';
    return <Badge color={color}>{priority}</Badge>;
};

const DetailItem: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-midnight-navy/60 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium text-midnight-navy mt-1">{value || '—'}</div>
    </div>
);

export const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({ task, onClose }) => {
    return (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
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
                        <h2 className="text-xl font-bold text-heritage-blue truncate" title={String(task['title'])}>{String(task['title'])}</h2>
                    </div>
                    <Button onClick={onClose} variant="secondary" size="sm" className="!p-2">
                        <CloseIcon className="w-5 h-5" />
                    </Button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="space-y-6">
                        <section>
                             <h3 className="text-base font-semibold text-midnight-navy mb-3">Task Details</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Project" value={String(task['Project id_resolved'] || task['Project id'])} />
                                <DetailItem label="Assignee" value={String(task['assignee_User_id_resolved'] || task['assignee_User_id'])} />
                                <DetailItem label="Status" value={<StatusBadge status={String(task['status'])} />} />
                                <DetailItem label="Priority" value={<PriorityBadge priority={String(task['priority'])} />} />
                                <DetailItem label="Reporter" value={String(task['reporter_User_id_resolved'] || task['reporter_User_id'])} />
                                <DetailItem 
                                    label="Labels" 
                                    value={
                                        <div className="flex flex-wrap gap-2">
                                            {String(task['labels'] || '').split(',').filter(l => l.trim()).map(label => (
                                                <Badge key={label} color="gray">{label}</Badge>
                                            ))}
                                        </div>
                                    } 
                                />
                                <DetailItem label="Hours Est." value={String(task['estimate_hours'])} />
                             </div>
                        </section>
                         {task['description'] && (
                            <section>
                                <h3 className="text-base font-semibold text-midnight-navy mb-3">Description</h3>
                                <p className="text-sm text-midnight-navy/90 whitespace-pre-wrap leading-relaxed">{String(task['description'])}</p>
                            </section>
                         )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};