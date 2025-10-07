
import React from 'react';
import { motion } from 'framer-motion';
import type { Lead, LeadActivity } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CloseIcon } from '../icons/CloseIcon';
import { ClockIcon } from '../icons/ClockIcon';

interface LeadDetailSidebarProps {
  lead: Lead;
  activities: LeadActivity[];
  onClose: () => void;
}

const ActivityItem: React.FC<{ activity: LeadActivity }> = ({ activity }) => (
    <div className="relative pl-5">
        <div className="absolute left-0 top-1.5 w-2.5 h-2.5 bg-heritage-blue/50 rounded-full border-2 border-cream"></div>
        <div className="text-xs text-midnight-navy/70 mb-1 flex justify-between">
             <strong>{String(activity['activity_type'])}</strong>
             <span>{new Date(String(activity['activity_timestamp'])).toLocaleString()}</span>
        </div>
        <div className="p-2 bg-midnight-navy/5 rounded-md text-sm">
             <p className="font-semibold text-midnight-navy/80">{String(activity['subject_notes'])}</p>
             <p className="text-xs text-midnight-navy/60 mt-1">Logged by: {String(activity['logged_by_fk_resolved'] || activity['logged_by_fk'])}</p>
        </div>
    </div>
);

const DetailItem: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-midnight-navy/60 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium text-midnight-navy mt-1">{value || '—'}</div>
    </div>
);


export const LeadDetailSidebar: React.FC<LeadDetailSidebarProps> = ({ lead, activities, onClose }) => {
    return (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col"
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-midnight-navy/10">
                    <div className="flex-grow min-w-0">
                        <h2 className="text-xl font-bold text-heritage-blue truncate" title={String(lead['Lead Name'])}>{String(lead['Lead Name'])}</h2>
                    </div>
                    <Button onClick={onClose} variant="secondary" size="sm" className="!p-2">
                        <CloseIcon className="w-5 h-5" />
                    </Button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Lead Details */}
                        <section>
                             <h3 className="text-base font-semibold text-midnight-navy mb-3">Partner Details</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Email" value={<a href={`mailto:${lead['Email']}`} className="text-heritage-blue hover:underline">{String(lead['Email'])}</a>} />
                                <DetailItem label="Phone" value={String(lead['Phone / WhatsApp'])} />
                                <DetailItem label="Status" value={<Badge color="blue">{String(lead['Status'])}</Badge>} />
                                <DetailItem label="SDR Owner" value={String(lead['sdr_owner_fk_resolved'] || lead['sdr_owner_fk'])} />
                                <DetailItem label="Source" value={String(lead['Source'])} />
                             </div>
                        </section>
                        
                        {/* Activity Section */}
                        <section>
                            <h3 className="text-base font-semibold text-midnight-navy mb-3">Activity Feed ({activities.length})</h3>
                            {activities.length > 0 ? (
                                <div className="relative">
                                     <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-heritage-blue/20"></div>
                                     <div className="space-y-4">
                                        {activities.map(act => <ActivityItem key={act.rowIndex} activity={act} />)}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-center text-midnight-navy/70 p-4 bg-midnight-navy/5 rounded-lg">
                                    No activities logged for this lead.
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};