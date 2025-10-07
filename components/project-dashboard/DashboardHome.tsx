

import React, { useMemo } from 'react';
import type { GoogleUser, Project, ProjectTask, SheetUser, BusinessUnit } from '../../types';
import { Button } from '../ui/Button';
import { GoogleIcon } from '../icons/GoogleIcon';

// Core Components
import { MetricsCards } from './MetricsCards';
import { ProjectsTableWidget } from './ProjectsTableWidget';
import { TasksSection } from './TasksSection';
import { TeamActivityWidget } from './TeamActivityWidget';
import { BusinessUnitsWidget } from './BusinessUnitsWidget';
import { CloseIcon } from '../icons/CloseIcon';
import { HorizontalSplitter, VerticalSplitter } from '../ui/Splitter';
import { Spacer } from './Spacer';
import type { ActiveFilter, ViewMode } from '../ProjectDashboardView';

interface DashboardHomeProps {
  isAuthenticated: boolean;
  user: GoogleUser | null;
  onSignInRequest: () => void;
  projects: Project[];
  tasks: ProjectTask[];
  people: SheetUser[];
  businessUnits: BusinessUnit[];
  isLoading: boolean;
  onProjectSelect: (project: Project) => void;
  onTaskSelect: (task: ProjectTask) => void;
  onPersonSelect: (person: SheetUser) => void;
  onUnitSelect: (unit: BusinessUnit) => void;
  activeFilter: ActiveFilter;
  setActiveFilter: (filter: ActiveFilter) => void;
  viewMode: ViewMode;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ isAuthenticated, user, onSignInRequest, projects, tasks, people, businessUnits, isLoading, onProjectSelect, onTaskSelect, onPersonSelect, onUnitSelect, activeFilter, setActiveFilter, viewMode }) => {
    
    const currentUserPerson = useMemo(() => {
        if (user?.email) return people.find(p => String(p['email']).toLowerCase() === user.email.toLowerCase());
        if (!isAuthenticated && people.length > 0) return people[0];
        return null;
    }, [user, people, isAuthenticated]);
    
    const {
        displayProjects,
        displayTasks,
        displayPeople,
        displayBusinessUnits,
        highlightedIds,
        tasksTitle,
        filterDescription
    } = useMemo(() => {
        const highlightedIds: { [key: string]: string | null } = { projectId: null, taskId: null, personId: null, unitId: null };
        let filterDescription: { type: string, name: string } | null = null;
        
        if (!activeFilter) {
            if (viewMode === 'team' && currentUserPerson) {
                const myUserId = String(currentUserPerson['User_id']);
                const myProjects = projects.filter(p => String(p.owner_User_id) === myUserId);
                const myTasks = tasks.filter(t => String(t.assignee_User_id) === myUserId && !['done', 'completed'].includes(String(t.status).toLowerCase()));
                
                const myUnitIds = new Set(myProjects.map(p => String(p.business_unit_id)));
                const myUnits = businessUnits.filter(bu => myUnitIds.has(String(bu['bu_id'])));

                return { 
                    displayProjects: myProjects, 
                    displayTasks: myTasks,
                    displayPeople: [currentUserPerson], 
                    displayBusinessUnits: myUnits,
                    highlightedIds, 
                    tasksTitle: "My Open Tasks",
                    filterDescription 
                };
            }
            // Founder view
            return { 
                displayProjects: projects, 
                displayTasks: tasks.filter(t => !['done', 'completed'].includes(String(t.status).toLowerCase())),
                displayPeople: people, 
                displayBusinessUnits: businessUnits,
                highlightedIds, 
                tasksTitle: "All Open Tasks",
                filterDescription 
            };
        }

        // Apply filters
        switch (activeFilter.type) {
            case 'unit': {
                highlightedIds.unitId = activeFilter.id;
                const unitName = businessUnits.find(u => String(u['bu_id']) === activeFilter.id)?.['bu_name'];
                filterDescription = { type: 'Business Unit', name: unitName || activeFilter.id };

                const filteredProjs = projects.filter(p => String(p.business_unit_id) === highlightedIds.unitId);
                const projIds = new Set(filteredProjs.map(p => String(p.project_id)));
                const filteredTsks = tasks.filter(t => projIds.has(String(t['Project id'])));
                const ownerIds = new Set(filteredProjs.map(p => String(p.owner_User_id)));
                const assigneeIds = new Set(filteredTsks.map(t => String(t.assignee_User_id)));
                const personIds = new Set([...ownerIds, ...assigneeIds]);
                const filteredPpl = people.filter(p => personIds.has(String(p['User_id'])));
                
                return { displayProjects: filteredProjs, displayTasks: filteredTsks.filter(t => !['done', 'completed'].includes(String(t['status']).toLowerCase())), displayPeople: filteredPpl, displayBusinessUnits: businessUnits, highlightedIds, tasksTitle: "Open Tasks in Unit", filterDescription };
            }
            case 'project': {
                highlightedIds.projectId = activeFilter.id;
                const project = projects.find(p => String(p.project_id) === highlightedIds.projectId);
                if (!project) break;
                const projectName = project['Project Name'] || project.project_name || project.name;
                filterDescription = { type: 'Project', name: String(projectName) };
                
                highlightedIds.unitId = String(project.business_unit_id);
                const tasksInProject = tasks.filter(t => String(t['Project id']) === highlightedIds.projectId);
                const ownerId = String(project.owner_User_id);
                highlightedIds.personId = ownerId;
                const assigneeIds = new Set(tasksInProject.map(t => String(t.assignee_User_id)));
                assigneeIds.add(ownerId);
                const peopleInProject = people.filter(p => assigneeIds.has(String(p['User_id'])));
                
                return { displayProjects: projects, displayTasks: tasksInProject, displayPeople: peopleInProject, displayBusinessUnits: businessUnits, highlightedIds, tasksTitle: `Tasks in ${projectName}`, filterDescription };
            }
            case 'task': {
                highlightedIds.taskId = activeFilter.id;
                const task = tasks.find(t => String(t.task_id) === highlightedIds.taskId);
                if (!task) break;
                filterDescription = { type: 'Task', name: String(task['title']) };

                highlightedIds.projectId = String(task['Project id']);
                highlightedIds.personId = String(task.assignee_User_id);
                const parentProject = projects.find(p => String(p.project_id) === highlightedIds.projectId);
                if (parentProject) highlightedIds.unitId = String(parentProject.business_unit_id);
                
                const baseTasks = (viewMode === 'founder' || activeFilter) ? tasks.filter(t => !['done', 'completed'].includes(String(t.status).toLowerCase())) : tasks.filter(t => String(t.assignee_User_id) === String(currentUserPerson?.['User_id']) && !['done', 'completed'].includes(String(t.status).toLowerCase()));
                const baseTitle = (viewMode === 'founder' || activeFilter) ? "All Open Tasks" : "My Open Tasks";

                return { displayProjects: projects, displayTasks: baseTasks, displayPeople: people, displayBusinessUnits: businessUnits, highlightedIds, tasksTitle: baseTitle, filterDescription };
            }
            case 'person': {
                highlightedIds.personId = activeFilter.id;
                const person = people.find(p => String(p['User_id']) === highlightedIds.personId);
                if (!person) break;
                filterDescription = { type: 'Person', name: String(person['full_name']) };

                const projectsForPerson = projects.filter(p => String(p.owner_User_id) === highlightedIds.personId);
                const tasksForPerson = tasks.filter(t => String(t.assignee_User_id) === highlightedIds.personId);
                
                return { displayProjects: projectsForPerson, displayTasks: tasksForPerson, displayPeople: people, displayBusinessUnits: businessUnits, highlightedIds, tasksTitle: `Tasks for ${person['full_name']}`, filterDescription };
            }
        }
        // Fallback
        return { displayProjects: projects, displayTasks: tasks.filter(t => !['done', 'completed'].includes(String(t.status).toLowerCase())), displayPeople: people, displayBusinessUnits: businessUnits, highlightedIds, tasksTitle: "All Open Tasks", filterDescription };
    }, [activeFilter, projects, tasks, people, businessUnits, viewMode, currentUserPerson]);

    const metrics = useMemo(() => {
        const isPersonalView = !activeFilter && viewMode === 'team';
        const isFilteredView = !!activeFilter;

        let projectsForMetrics: Project[] = projects;
        let tasksForMetrics: ProjectTask[] = tasks;
        let peopleForMetrics: SheetUser[] = people;

        if (isPersonalView && currentUserPerson) {
            const myUserId = String(currentUserPerson['User_id']);
            projectsForMetrics = projects.filter(p => String(p.owner_User_id) === myUserId);
            tasksForMetrics = tasks.filter(t => String(t.assignee_User_id) === myUserId);
            peopleForMetrics = [currentUserPerson];
        } else if (isFilteredView) {
            projectsForMetrics = displayProjects;
            tasksForMetrics = displayTasks; // displayTasks is already filtered by status
            peopleForMetrics = displayPeople;
        }
        
        // Titles
        const activeProjectsTitle = isPersonalView ? 'My Active Projects' : isFilteredView ? 'Active Projects (Filtered)' : 'Active Projects';
        const projectsAtRiskTitle = isPersonalView ? 'My Projects at Risk' : isFilteredView ? 'Projects at Risk (Filtered)' : 'Projects at Risk';
        const utilizationTitle = isPersonalView ? 'My Utilization' : isFilteredView ? 'Utilization (Filtered)' : 'Team Utilization';
        const openTasksTitle = isPersonalView ? 'My Open Tasks' : isFilteredView ? 'Open Tasks (Filtered)' : 'Open Tasks';

        // Values
        const totalProjects = projectsForMetrics.length;
        const projectsAtRisk = projectsForMetrics.filter(p => String(p['Status']).toLowerCase() === 'at risk').length;
        
        const openTasksForMetrics = isFilteredView 
            ? tasksForMetrics // Already filtered by status
            : tasksForMetrics.filter(t => !['done', 'completed'].includes(String(t.status).toLowerCase()));
        
        const openTasksCount = openTasksForMetrics.length;

        const totalCapacity = peopleForMetrics.reduce((sum, p) => sum + parseFloat(String(p?.['weekly_hours_capacity'] || 0)), 0);
        const totalLogged = tasksForMetrics.reduce((sum, t) => sum + parseFloat(String(t['estimate_hours'] || 0)), 0);
        const teamUtilization = totalCapacity === 0 ? '0%' : `${Math.round((totalLogged / totalCapacity) * 100)}%`;

        return {
            totalProjects, activeProjectsTitle,
            projectsAtRisk, projectsAtRiskTitle,
            openTasksCount, openTasksTitle,
            teamUtilization, utilizationTitle,
        };
    }, [activeFilter, viewMode, projects, tasks, people, currentUserPerson, displayProjects, displayTasks, displayPeople]);


    const peopleWithUtilization = useMemo(() => {
        const loggedHoursByPerson: { [key: string]: number } = displayTasks.reduce((acc, task) => {
            const assigneeId = String(task['assignee_User_id']);
            const hours = parseFloat(String(task['estimate_hours'] || 0));
            if (assigneeId && !isNaN(hours)) {
                acc[assigneeId] = (acc[assigneeId] || 0) + hours;
            }
            return acc;
        }, {} as { [key: string]: number });

        return displayPeople.map(person => {
            const id = String(person['User_id']);
            const capacity = parseFloat(String(person['weekly_hours_capacity'] || 40));
            const logged = loggedHoursByPerson[id] || 0;
            const utilization = capacity > 0 ? Math.round((logged / capacity) * 100) : 0;
            return { ...person, utilization };
        });
    }, [displayPeople, displayTasks]);

    const projectsAndTasksRow = (
        <VerticalSplitter storageKey="pd-home-v2-projects-tasks-v-splitter">
            <ProjectsTableWidget
                projects={displayProjects}
                tasks={tasks}
                isLoading={isLoading}
                onProjectSelect={onProjectSelect}
                highlightedProjectId={highlightedIds.projectId}
            />
            <TasksSection
                title={tasksTitle}
                tasks={displayTasks}
                isLoading={isLoading}
                onTaskSelect={onTaskSelect}
                highlightedTaskId={highlightedIds.taskId}
            />
        </VerticalSplitter>
    );

    const teamActivityRow = (
        <TeamActivityWidget
            people={peopleWithUtilization}
            isLoading={isLoading}
            onPersonSelect={onPersonSelect}
            highlightedPersonId={highlightedIds.personId}
        />
    );


    return (
        <div>
            {!isAuthenticated && (
                <div className="mb-6 text-center bg-heritage-blue/20 p-4 rounded-lg border border-heritage-blue/50">
                    <p className="text-cream/80 text-sm">You are currently viewing mock data. <Button onClick={onSignInRequest} variant="creative" size="sm" className="ml-2 !py-0.5">Sign In</Button> to connect your own Google Sheets.</p>
                </div>
            )}
            
            {activeFilter && filterDescription && (
                 <div className="mb-6 flex items-center justify-between gap-2 p-2 px-4 bg-creativity-orange/10 rounded-lg">
                    <p className="text-sm font-semibold text-creativity-orange">
                        <span className="font-normal text-creativity-orange/80 mr-1">Filtering by {filterDescription.type}:</span>
                        {filterDescription.name}
                    </p>
                    <Button 
                        onClick={() => setActiveFilter(null)} 
                        variant="secondary"
                        size="sm"
                        className="!bg-creativity-orange/20 !text-creativity-orange/80 hover:!bg-creativity-orange/30 hover:!text-creativity-orange"
                        leftIcon={<CloseIcon className="w-4 h-4" />}
                    >
                        Clear Filter
                    </Button>
                </div>
            )}

            <div className="mb-6">
                 <MetricsCards
                    isLoading={isLoading}
                    totalProjects={metrics.totalProjects}
                    activeProjectsTitle={metrics.activeProjectsTitle}
                    projectsAtRisk={metrics.projectsAtRisk}
                    projectsAtRiskTitle={metrics.projectsAtRiskTitle}
                    openTasksCount={metrics.openTasksCount}
                    openTasksTitle={metrics.openTasksTitle}
                    teamUtilization={metrics.teamUtilization}
                    utilizationTitle={metrics.utilizationTitle}
                />
            </div>
            
            <Spacer />

            <div className="mb-6">
                <BusinessUnitsWidget
                    units={displayBusinessUnits}
                    isLoading={isLoading}
                    onUnitSelect={onUnitSelect}
                    highlightedUnitId={highlightedIds.unitId}
                />
            </div>

            <div style={{ height: '120vh' }}>
                <HorizontalSplitter storageKey="pd-home-v2-main-h-splitter">
                    {projectsAndTasksRow}
                    {teamActivityRow}
                </HorizontalSplitter>
            </div>
        </div>
    );
};