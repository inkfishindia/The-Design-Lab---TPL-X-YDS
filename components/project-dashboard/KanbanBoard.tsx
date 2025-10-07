
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../../types';
import { Badge } from '../ui/Badge';

interface KanbanBoardProps {
  projects: Project[];
  onUpdateProject: (project: Project, newStatus: string) => void;
}

const KanbanColumn: React.FC<{
  status: string;
  projects: Project[];
  onDrop: (project: Project) => void;
}> = ({ status, projects, onDrop }) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        const project = JSON.parse(e.dataTransfer.getData('project'));
        onDrop(project);
      }}
      className={`flex-1 flex flex-col bg-heritage-blue/20 rounded-lg p-3 min-w-[280px] transition-colors ${isOver ? 'bg-heritage-blue/40' : ''}`}
    >
      <h4 className="font-semibold text-cream/90 text-sm mb-3 px-1 capitalize">{status.replace(/_/g, ' ')} ({projects.length})</h4>
      <div className="flex-grow space-y-3 overflow-y-auto">
        {projects.map(project => (
          <KanbanCard key={project.rowIndex} project={project} />
        ))}
      </div>
    </div>
  );
};

const KanbanCard: React.FC<{ project: Project }> = ({ project }) => {
    const projectName = project['Project Name'] || project.project_name || project.name;
    return (
        <motion.div layout>
            <div
                draggable
                onDragStart={(e: React.DragEvent) => {
                    e.dataTransfer.setData('project', JSON.stringify(project));
                }}
                className="bg-cream text-midnight-navy p-3 rounded-md shadow-sm cursor-grab active:cursor-grabbing"
            >
                <p className="font-bold text-heritage-blue text-sm">{String(projectName)}</p>
                <p className="text-xs text-midnight-navy/80 mt-1">Owner: {String(project['owner_User_id_resolved'] || project['owner_User_id'])}</p>
                 <div className="mt-2 text-xs flex justify-between items-center">
                    <span>Confidence: {String(project['confidence_pct'] || 0)}%</span>
                    <Badge color="orange">{String(project['priority'])}</Badge>
                </div>
            </div>
        </motion.div>
    );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projects, onUpdateProject }) => {
  const statuses = React.useMemo(() => {
    const statusSet = new Set(projects.map(p => String(p['Status'] || p['status'])));
    return Array.from(statusSet);
  }, [projects]);

  const projectsByStatus = React.useMemo(() => {
    const grouped: { [key: string]: Project[] } = {};
    statuses.forEach(status => {
      grouped[status] = projects.filter(p => String(p['Status'] || p['status']) === status);
    });
    return grouped;
  }, [projects, statuses]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          projects={projectsByStatus[status]}
          onDrop={(project) => onUpdateProject(project, status)}
        />
      ))}
    </div>
  );
};