
import React from 'react';
import type { ProjectTask } from '../../types';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

const TaskItem: React.FC<{ task: ProjectTask; onClick: () => void; isHighlighted: boolean; }> = ({ task, onClick, isHighlighted }) => (
    <button 
        onClick={onClick} 
        className={`w-full text-left flex justify-between items-center p-3 rounded-lg transition-colors ${isHighlighted ? 'bg-accent-orange/10 ring-1 ring-accent-orange' : 'hover:bg-dark-border/50'}`}
    >
        <div className="flex-grow">
            <p className="font-medium text-text-light text-sm">{String(task['title'])}</p>
            <div className="flex items-center gap-x-4 text-xs text-text-muted mt-1">
                <span>Project: {String(task['Project id_resolved'] || task['Project id'])}</span>
                <span className="border-l border-dark-border pl-4">Owner: {String(task['assignee_User_id_resolved'] || task['assignee_User_id'] || 'Unassigned')}</span>
            </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-accent-orange/20 text-accent-orange rounded-full flex-shrink-0 ml-4">{String(task['priority'])}</span>
    </button>
);

interface TasksSectionProps {
    title: string;
    tasks: ProjectTask[];
    isLoading: boolean;
    onTaskSelect: (task: ProjectTask) => void;
    highlightedTaskId: string | null;
}

export const BusinessTasksWidget: React.FC<TasksSectionProps> = ({ title, tasks, isLoading, onTaskSelect, highlightedTaskId }) => {
    return (
        <Card className="h-full">
             <h3 className="text-lg font-semibold text-text-light mb-4">{title}</h3>
             {isLoading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
             ) : tasks.length > 0 ? (
                <div className="space-y-2">
                    {tasks.map(task => <TaskItem key={task.rowIndex} task={task} onClick={() => onTaskSelect(task)} isHighlighted={String(task.task_id) === highlightedTaskId} />)}
                </div>
             ) : (
                <p className="text-center text-sm text-text-muted py-10">No tasks to display.</p>
             )}
        </Card>
    );
};