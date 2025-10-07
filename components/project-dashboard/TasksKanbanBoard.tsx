
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ProjectTask } from '../../types';
import { Badge } from '../ui/Badge';

interface TasksKanbanBoardProps {
  tasks: ProjectTask[];
  onUpdateTask: (task: ProjectTask, newStatus: string) => void;
  onTaskSelect: (task: ProjectTask) => void;
}

const KanbanColumn: React.FC<{
  status: string;
  tasks: ProjectTask[];
  onDrop: (task: ProjectTask) => void;
}> = ({ status, tasks, onDrop }) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        const task = JSON.parse(e.dataTransfer.getData('task'));
        onDrop(task);
      }}
      className={`flex-1 flex flex-col bg-heritage-blue/20 rounded-lg p-3 min-w-[280px] transition-colors ${isOver ? 'bg-heritage-blue/40' : ''}`}
    >
      <h4 className="font-semibold text-cream/90 text-sm mb-3 px-1 capitalize">{status.replace(/_/g, ' ')} ({tasks.length})</h4>
      <div className="flex-grow space-y-3 overflow-y-auto">
        {tasks.map(task => (
          <KanbanCard key={task.rowIndex} task={task} />
        ))}
      </div>
    </div>
  );
};

const KanbanCard: React.FC<{ task: ProjectTask }> = ({ task }) => {
    return (
        <motion.div
            layout
        >
            <div
                draggable
                onDragStart={(e: React.DragEvent) => { e.dataTransfer.setData('task', JSON.stringify(task)); }}
                className="bg-cream text-midnight-navy p-3 rounded-md shadow-sm cursor-grab active:cursor-grabbing"
            >
                <p className="font-bold text-sm text-heritage-blue">{String(task['title'])}</p>
                <p className="text-xs text-midnight-navy/70 mt-1">Project: {String(task['Project id_resolved'] || task['Project id'])}</p>
                <p className="text-xs text-midnight-navy/70 mt-1">Assignee: {String(task['assignee_User_id_resolved'] || task['assignee_User_id'])}</p>
                <div className="mt-2">
                     <Badge color={String(task['priority']).toLowerCase() === 'high' ? 'red' : String(task['priority']).toLowerCase() === 'medium' ? 'orange' : 'gray'}>
                        {String(task['priority'])}
                    </Badge>
                </div>
            </div>
        </motion.div>
    );
};

export const TasksKanbanBoard: React.FC<TasksKanbanBoardProps> = ({ tasks, onUpdateTask, onTaskSelect }) => {
  const statuses = useMemo(() => {
    // Define a standard order for columns
    const standardStatuses = ['to_do', 'in_progress', 'blocked', 'done', 'completed'];
    const taskStatuses = new Set(tasks.map(t => String(t['status']).toLowerCase()));
    return standardStatuses.filter(s => taskStatuses.has(s));
  }, [tasks]);

  const tasksByStatus = useMemo(() => {
    const grouped: { [key: string]: ProjectTask[] } = {};
    statuses.forEach(status => {
      grouped[status] = tasks.filter(t => String(t['status']).toLowerCase() === status);
    });
    return grouped;
  }, [tasks, statuses]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus[status]}
          onDrop={(task) => onUpdateTask(task, status)}
        />
      ))}
    </div>
  );
};