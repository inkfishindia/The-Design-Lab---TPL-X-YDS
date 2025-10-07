
import React from 'react';
import { motion } from 'framer-motion';
import type { SheetUser, Project, ProjectTask } from '../../types';
import { Button } from '../ui/Button';
import { CloseIcon } from '../icons/CloseIcon';
import { Badge } from '../ui/Badge';

interface PersonDetailSidebarProps {
  person: SheetUser;
  projects: Project[];
  tasks: ProjectTask[];
  onClose: () => void;
  onProjectSelect: (project: Project) => void;
}

const ProjectItem: React.FC<{ project: Project, onClick: () => void }> = ({ project, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-3 bg-midnight-navy/5 rounded-lg hover:bg-midnight-navy/10 transition-colors">
        <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-sm text-midnight-navy">{String(project['Project Name'])}</p>
            <div className="flex-shrink-0">
                <Badge color="blue">{String(project['Status'])}</Badge>
            </div>
        </div>
    </button>
);

const TaskItem: React.FC<{ task: ProjectTask }> = ({ task }) => (
    <div className="p-3 bg-midnight-navy/5 rounded-lg">
        <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-sm text-midnight-navy">{String(task['title'])}</p>
            <div className="flex-shrink-0">
                <Badge color="gray">{String(task['status'])}</Badge>
            </div>
        </div>
        <div className="mt-2 text-xs text-midnight-navy/70">
            Project: {task.project?.['Project Name'] || String(task['Project id'])}
        </div>
    </div>
);


export const PersonDetailSidebar: React.FC<PersonDetailSidebarProps> = ({ person, projects, tasks, onClose, onProjectSelect }) => {
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
                        <h2 className="text-xl font-bold text-heritage-blue truncate" title={String(person['full_name'])}>{String(person['full_name'])}</h2>
                        <p className="text-sm text-midnight-navy/80">{String(person['role_title'])}</p>
                    </div>
                    <Button onClick={onClose} variant="secondary" size="sm" className="!p-2">
                        <CloseIcon className="w-5 h-5" />
                    </Button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="space-y-6">
                         <section>
                            <h3 className="text-base font-semibold text-midnight-navy mb-3">Owned Projects ({projects.length})</h3>
                            {projects.length > 0 ? (
                                <div className="space-y-3">
                                    {projects.map(p => <ProjectItem key={p.rowIndex} project={p} onClick={() => onProjectSelect(p)} />)}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-midnight-navy/70 p-4 bg-midnight-navy/5 rounded-lg">
                                    This person does not own any projects.
                                </p>
                            )}
                        </section>

                        <section>
                            <h3 className="text-base font-semibold text-midnight-navy mb-3">Assigned Tasks ({tasks.length})</h3>
                             {tasks.length > 0 ? (
                                <div className="space-y-3">
                                    {tasks.map(t => <TaskItem key={t.rowIndex} task={t} />)}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-midnight-navy/70 p-4 bg-midnight-navy/5 rounded-lg">
                                    No tasks are currently assigned to this person.
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
