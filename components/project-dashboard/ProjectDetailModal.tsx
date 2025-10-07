

import React from 'react';
import type { Project, ProjectTask } from '../../types';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';

interface ProjectDetailModalProps {
  project: Project;
  tasks: ProjectTask[];
  onClose: () => void;
  onTaskSelect: (task: ProjectTask) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const lowerStatus = String(status || '').toLowerCase();
    let color: 'green' | 'blue' | 'gray' | 'red' | 'yellow' = 'gray';

    if (lowerStatus.includes('done')) color = 'green';
    else if (['in progress', 'in_progress'].includes(lowerStatus)) color = 'blue';
    else if (['to do', 'to_do'].includes(lowerStatus)) color = 'gray';
    else if (lowerStatus.includes('blocked')) color = 'red';
    else if (lowerStatus.includes('at risk')) color = 'yellow';
    else if (lowerStatus.includes('on track') || lowerStatus.includes('active') || lowerStatus.includes('planning')) color = 'blue';


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

const TaskItem: React.FC<{ task: ProjectTask, onClick: () => void }> = ({ task, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-3 bg-midnight-navy/5 rounded-lg hover:bg-midnight-navy/10 transition-colors">
        <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-sm text-midnight-navy">{String(task['title'])}</p>
            <div className="flex-shrink-0">
                <StatusBadge status={String(task['status'])} />
            </div>
        </div>
        <div className="mt-2 flex justify-between items-center text-xs">
            <span className="text-midnight-navy/70">Assignee: {String(task['assignee_User_id_resolved'] || task['assignee_User_id'] || 'N/A')}</span>
            <PriorityBadge priority={String(task['priority'])} />
        </div>
    </button>
);

const DetailItem: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-midnight-navy/60 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium text-midnight-navy mt-1">{value || '—'}</div>
    </div>
);


export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, tasks, onClose, onTaskSelect }) => {
    if (!project) return null;
    const projectName = project['Project Name'] || project.project_name || project.name;
    const status = project['Status'] || project.status;
    const budgetPlanned = Number(project.budget_planned || 0);
    const budgetSpent = Number(project.budget_spent || 0);
    const budgetProgress = budgetPlanned > 0 ? (budgetSpent / budgetPlanned) * 100 : 0;

    return (
        <Modal 
            isOpen={!!project} 
            onClose={onClose} 
            title="Project Details"
            size="5xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-h-[75vh] overflow-y-auto p-1">
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <section>
                         <h3 className="text-lg font-semibold text-midnight-navy mb-4">{String(projectName)}</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Owner" value={String(project['owner_User_id_resolved'] || project['owner_User_id'])} />
                            <DetailItem label="Status" value={<StatusBadge status={String(status)} />} />
                            <DetailItem label="Business Unit" value={String(project['business_unit_id_resolved'] || project['business_unit_id'])} />
                            <DetailItem label="Priority" value={String(project['priority'])} />
                            <DetailItem label="Start Date" value={project.start_date ? new Date(project.start_date).toLocaleDateString('en-CA') : 'N/A'} />
                            <DetailItem label="Target End Date" value={project.target_end_date ? new Date(project.target_end_date).toLocaleDateString('en-CA') : 'N/A'} />
                         </div>
                    </section>
                    <section>
                         <h3 className="text-base font-semibold text-midnight-navy mb-3">Objective</h3>
                         <p className="text-sm text-midnight-navy/90 whitespace-pre-wrap">{project.objective}</p>
                    </section>
                    <section>
                         <h3 className="text-base font-semibold text-midnight-navy mb-3">Metrics & Budget</h3>
                         <div className="space-y-4">
                            <DetailItem 
                                label="Confidence" 
                                value={
                                    <div className="flex items-center gap-2">
                                        <ProgressBar progress={Number(project['confidence_pct'] || 0)} />
                                        <span>{project['confidence_pct'] || 0}%</span>
                                    </div>
                                } 
                            />
                             <DetailItem 
                                label="Budget" 
                                value={
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <ProgressBar progress={budgetProgress} />
                                        </div>
                                         <div className="flex justify-between text-xs text-midnight-navy/80">
                                            <span>Spent: ${budgetSpent.toLocaleString()}</span>
                                            <span>Planned: ${budgetPlanned.toLocaleString()}</span>
                                        </div>
                                    </div>
                                } 
                            />
                         </div>
                    </section>
                </div>
                
                {/* Right Column: Tasks */}
                <section>
                    <h3 className="text-base font-semibold text-midnight-navy mb-3">Tasks ({tasks.length})</h3>
                    {tasks.length > 0 ? (
                        <div className="space-y-3">
                            {tasks.map(task => <TaskItem key={task.rowIndex} task={task} onClick={() => onTaskSelect(task)} />)}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-midnight-navy/70 p-4 bg-midnight-navy/5 rounded-lg">
                            No tasks found for this project.
                        </p>
                    )}
                </section>
            </div>
        </Modal>
    );
};