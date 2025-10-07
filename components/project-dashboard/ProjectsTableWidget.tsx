
import React from 'react';
import type { Project, ProjectTask } from '../../types';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const lowerStatus = String(status || '').toLowerCase();
    let color: 'green' | 'yellow' | 'red' | 'gray' | 'blue' = 'gray';
    if (['on track', 'in_progress', 'active'].includes(lowerStatus)) color = 'blue';
    else if (lowerStatus.includes('at risk')) color = 'yellow';
    else if (lowerStatus.includes('blocked')) color = 'red';
    else if (['done', 'completed'].includes(lowerStatus)) color = 'green';
    
    return <Badge color={color}>{status}</Badge>;
};

const ProjectItem: React.FC<{ project: Project; openTasksCount: number; onClick: () => void; isHighlighted: boolean; }> = ({ project, openTasksCount, onClick, isHighlighted }) => {
    const projectName = project['Project Name'] || project.project_name || project.name;
    const status = project['Status'] || project['status'];
    return (
        <button onClick={onClick} className={`w-full text-left p-3 grid grid-cols-4 gap-4 items-center rounded-lg transition-colors ${isHighlighted ? 'bg-creativity-orange/10 ring-1 ring-creativity-orange' : 'hover:bg-heritage-blue/10'}`}>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-midnight-navy truncate" title={String(projectName)}>
                    {String(projectName)}
                </span>
                {openTasksCount > 0 && (
                    <span className="flex-shrink-0 text-xs font-bold bg-creativity-orange/20 text-creativity-orange rounded-full px-2 py-0.5" title={`${openTasksCount} open tasks`}>
                        {openTasksCount}
                    </span>
                )}
            </div>
            <div className="truncate" title={String(project['owner_User_id_resolved'] || project['owner_User_id'])}>
                {String(project['owner_User_id_resolved'] || project['owner_User_id'])}
            </div>
            <div>
                <StatusBadge status={String(status)} />
            </div>
            <div>
                <ProgressBar progress={Number(project['confidence_pct'] || 0)} />
            </div>
        </button>
    );
};


interface ProjectsTableWidgetProps {
    projects: Project[];
    tasks: ProjectTask[];
    isLoading: boolean;
    onProjectSelect: (project: Project) => void;
    highlightedProjectId: string | null;
}

export const ProjectsTableWidget: React.FC<ProjectsTableWidgetProps> = ({ projects, tasks, isLoading, onProjectSelect, highlightedProjectId }) => {
    const headers = ["Project Name", "Owner", "Status", "Confidence"];
    const projectsToShow = projects.slice(0, 10);

    const SkeletonLoader = () => (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 items-center p-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-2.5 w-full" />
                </div>
            ))}
        </div>
    );
    
    return (
        <Card className="h-full">
            <h3 className="text-lg font-semibold text-midnight-navy mb-4">Projects Overview</h3>
            {isLoading ? <SkeletonLoader /> : projectsToShow.length > 0 ? (
                <div>
                    {/* Header */}
                    <div className="text-xs font-semibold text-midnight-navy/60 uppercase grid grid-cols-4 gap-4 px-3 pb-2 border-b border-midnight-navy/10">
                        {headers.map(header => (
                            <div key={header}>{header}</div>
                        ))}
                    </div>
                    {/* Body */}
                    <div className="space-y-1 mt-1">
                        {projectsToShow.map(project => {
                            const openTasksCount = tasks.filter(t => 
                                String(t['Project id']) === String(project.project_id) && 
                                !['done', 'completed'].includes(String(t['status']).toLowerCase())
                            ).length;
                            return (
                                <ProjectItem 
                                    key={project.rowIndex}
                                    project={project}
                                    openTasksCount={openTasksCount}
                                    onClick={() => onProjectSelect(project)}
                                    isHighlighted={String(project.project_id) === highlightedProjectId}
                                />
                            );
                        })}
                    </div>
                </div>
            ) : (
                <p className="text-center text-sm text-midnight-navy/70 py-10">No projects to display.</p>
            )}
        </Card>
    );
};