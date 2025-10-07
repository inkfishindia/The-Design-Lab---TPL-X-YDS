



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { TokenResponse, Project, ProjectTask, SheetUser, BusinessUnit, Flywheel, Hub } from '../types';
import { fetchSheetData } from '../services/googleSheetsService';
import { hydrateData } from '../services/dataHydrationService';
import { useToast } from './ui/Toast';

import { FlywheelKanban } from './business/FlywheelKanban';
import { HubsList } from './business/HubsList';
import { BusinessTeamActivityWidget } from './business/BusinessTeamActivityWidget';
import { BusinessProjectsWidget } from './business/BusinessProjectsWidget';
import { BusinessTasksWidget } from './business/BusinessTasksWidget';
import { MetricsPlaceholder } from './business/MetricsPlaceholder';
import { ModuleContainer } from './business/ModuleContainer';
import { VerticalSplitter, HorizontalSplitter } from './ui/Splitter';

import { ProjectDetailModal } from './project-dashboard/ProjectDetailModal';
import { TaskDetailSidebar } from './project-dashboard/TaskDetailSidebar';
import { Button } from './ui/Button';
import { CloseIcon } from './icons/CloseIcon';
import { SheetKey } from '../services/configService';

interface BusinessViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
}

type ActiveFilter = { type: 'flywheel' | 'businessUnit', id: string, name: string } | null;

export const BusinessView: React.FC<BusinessViewProps> = ({ isAuthenticated, token }) => {
    const toast = useToast();

    // Data states
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [people, setPeople] = useState<SheetUser[]>([]);
    const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
    const [flywheels, setFlywheels] = useState<Flywheel[]>([]);
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const accessToken = token?.access_token || null;
            const [projData, taskData, peopleData, hubData, unitData, flywheelData] = await Promise.all([
                fetchSheetData(SheetKey.PROJECTS, accessToken),
                fetchSheetData(SheetKey.TASKS, accessToken),
                fetchSheetData(SheetKey.PEOPLE, accessToken),
                fetchSheetData(SheetKey.HUBS, accessToken),
                fetchSheetData(SheetKey.BUSINESS_UNITS, accessToken),
                fetchSheetData(SheetKey.FLYWHEEL, accessToken),
            ]);

            const allData = {
                [SheetKey.PROJECTS]: projData,
                [SheetKey.TASKS]: taskData,
                [SheetKey.PEOPLE]: peopleData,
                [SheetKey.HUBS]: hubData,
                [SheetKey.BUSINESS_UNITS]: unitData,
                [SheetKey.FLYWHEEL]: flywheelData,
            };

            setProjects(hydrateData(projData, SheetKey.PROJECTS, allData));
            setTasks(hydrateData(taskData, SheetKey.TASKS, allData));
            setPeople(hydrateData(peopleData, SheetKey.PEOPLE, allData));
            setBusinessUnits(hydrateData(unitData, SheetKey.BUSINESS_UNITS, allData));
            setFlywheels(hydrateData(flywheelData, SheetKey.FLYWHEEL, allData));
            setHubs(hydrateData(hubData, SheetKey.HUBS, allData));

        } catch (error) {
            const msg = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Failed to load business data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, [token, toast]);

    useEffect(() => {
        fetchData();
    }, [isAuthenticated, token, fetchData]);

    const handleFilterChange = (filter: { type: 'flywheel' | 'businessUnit', id: string, name: string } | null) => {
        if (filter === null) {
            setActiveFilter(null);
            return;
        }
        setActiveFilter(prev => 
            prev?.type === filter.type && prev?.id === filter.id ? null : filter
        );
    };
    
    const peopleWithUtilization = useMemo(() => {
        const loggedHoursByPerson: { [key: string]: number } = tasks.reduce((acc, task) => {
            const assigneeId = String(task.assignee_User_id);
            const hours = parseFloat(String(task.estimate_hours || 0));
            if (assigneeId && !isNaN(hours)) {
                acc[assigneeId] = (acc[assigneeId] || 0) + hours;
            }
            return acc;
        }, {} as { [key: string]: number });

        return people.map(person => {
            // FIX: Property 'user_id' does not exist on type 'SheetUser'. Changed to 'User_id'.
            const id = String(person.User_id);
            const capacity = parseFloat(String(person.weekly_hours_capacity || 40));
            const logged = loggedHoursByPerson[id] || 0;
            const utilization = capacity > 0 ? Math.round((logged / capacity) * 100) : 0;
            return { ...person, utilization };
        });
    }, [people, tasks]);

    const {
        filteredHubs,
        filteredPeople,
        filteredProjects,
        filteredTasks
    } = useMemo(() => {
        if (!activeFilter) {
            return {
                filteredHubs: hubs,
                filteredPeople: peopleWithUtilization,
                filteredProjects: projects,
                filteredTasks: tasks
            };
        }

        let relevantUnitIds: Set<string>;

        if (activeFilter.type === 'flywheel') {
            relevantUnitIds = new Set(
                businessUnits
                    .filter(bu => String(bu.primary_flywheel_id) === activeFilter.id)
                    .map(bu => String(bu.bu_id))
            );
        } else { // 'businessUnit'
            relevantUnitIds = new Set([activeFilter.id]);
        }

        const filteredProjects = projects.filter(p => relevantUnitIds.has(String(p.business_unit_id)));
        const relevantProjectIds = new Set(filteredProjects.map(p => String(p.project_id)));
        
        const filteredTasks = tasks.filter(t => relevantProjectIds.has(String(t['Project id'])));
        
        const relevantPeopleIds = new Set([
            ...filteredProjects.map(p => String(p.owner_User_id)),
            ...filteredTasks.map(t => String(t.assignee_User_id)),
        ]);
        // FIX: Property 'user_id' does not exist on type 'SheetUser'. Changed to 'User_id'.
        const filteredPeople = peopleWithUtilization.filter(p => relevantPeopleIds.has(String(p.User_id)));
        
        // Hubs are not filtered due to ambiguous data model.
        const filteredHubs = hubs; 

        return { filteredHubs, filteredPeople, filteredProjects, filteredTasks };
    }, [activeFilter, hubs, peopleWithUtilization, projects, tasks, businessUnits]);

    const flywheelsSection = (
        <ModuleContainer title="Flywheels & Business Units">
            <FlywheelKanban 
                flywheels={flywheels} 
                businessUnits={businessUnits} 
                isLoading={isLoading} 
                onFilterChange={handleFilterChange}
                activeFilter={activeFilter}
            />
        </ModuleContainer>
    );

    const hubsSection = (
        <ModuleContainer title="Hubs & Teams">
            <VerticalSplitter storageKey="business-hubs-teams-splitter">
                <HubsList hubs={filteredHubs} isLoading={isLoading} />
                <BusinessTeamActivityWidget people={filteredPeople} isLoading={isLoading} onPersonSelect={() => {}} highlightedPersonId={null} />
            </VerticalSplitter>
        </ModuleContainer>
    );

    const metricsSection = (
        <ModuleContainer title="Metrics">
            <MetricsPlaceholder />
        </ModuleContainer>
    );

    const projectsAndTasksSection = (
        <ModuleContainer title="Projects & Tasks">
            <VerticalSplitter storageKey="business-projects-tasks-splitter">
                <BusinessProjectsWidget 
                    projects={filteredProjects} 
                    tasks={tasks}
                    isLoading={isLoading} 
                    onProjectSelect={setSelectedProject}
                    highlightedProjectId={null}
                />
                <BusinessTasksWidget 
                    title={activeFilter ? "Filtered Tasks" : "All Tasks"}
                    tasks={filteredTasks}
                    isLoading={isLoading}
                    onTaskSelect={setSelectedTask}
                    highlightedTaskId={null}
                />
            </VerticalSplitter>
        </ModuleContainer>
    );


    return (
      <div className="p-6 text-text-light flex flex-col gap-6">
        {activeFilter && (
            <div className="bg-accent-orange/10 border border-accent-orange/50 p-3 rounded-lg flex justify-between items-center flex-shrink-0">
                <p className="text-sm font-semibold text-accent-orange">
                    <span className="font-normal opacity-80">Filtering by {activeFilter.type === 'flywheel' ? 'Flywheel' : 'Business Unit'}: </span>
                    {activeFilter.name}
                </p>
                <Button 
                    variant="secondary" 
                    size="sm" 
                    className="!bg-accent-orange/20 !text-accent-orange/80 hover:!bg-accent-orange/30 hover:!text-accent-orange"
                    onClick={() => setActiveFilter(null)}
                    leftIcon={<CloseIcon className="w-4 h-4" />}
                >
                    Clear Filter
                </Button>
            </div>
        )}
        
        <div className="h-[200vh]">
            <HorizontalSplitter storageKey="business-main-h-splitter-v2-1" initialSize={25}>
                {flywheelsSection}
                <HorizontalSplitter storageKey="business-main-h-splitter-v2-2" initialSize={33}>
                    {hubsSection}
                    <HorizontalSplitter storageKey="business-main-h-splitter-v2-3" initialSize={33}>
                        {metricsSection}
                        {projectsAndTasksSection}
                    </HorizontalSplitter>
                </HorizontalSplitter>
            </HorizontalSplitter>
        </div>
        
        <AnimatePresence>
          {selectedProject && (
            <ProjectDetailModal 
              project={selectedProject}
              tasks={tasks.filter(t => String(t['Project id']) === String(selectedProject.project_id))}
              onClose={() => setSelectedProject(null)}
              onTaskSelect={setSelectedTask}
            />
          )}
          {selectedTask && (
            <TaskDetailSidebar 
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
            />
          )}
        </AnimatePresence>
      </div>
    );
};
