import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { GoogleUser, TokenResponse, Project, ProjectTask, SheetUser, BusinessUnit } from '../../types';
import { fetchSheetData } from '../../services/googleSheetsService';
import { hydrateData } from '../../services/dataHydrationService';
import { getAnyCache } from '../../services/cachingService';
import { useToast } from './ui/Toast';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { SheetKey } from '../../services/configService';

// Sub-view components
import { DashboardHome } from './project-dashboard/DashboardHome';
import { ProjectsList } from './project-dashboard/ProjectsList';
import { TasksList } from './project-dashboard/TasksList';
import { PeopleDirectory } from './project-dashboard/PeopleDirectory';

// Detail Sidebars
import { ProjectDetailModal } from './project-dashboard/ProjectDetailModal';
import { TaskDetailSidebar } from './project-dashboard/TaskDetailSidebar';
import { PersonDetailSidebar } from './project-dashboard/PersonDetailSidebar';
import { BusinessUnitDetailSidebar } from './project-dashboard/BusinessUnitDetailSidebar';

interface ProjectDashboardViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
  onSignInRequest: () => void;
}

type ProjectView = 'home' | 'projects' | 'tasks' | 'people';
export type ActiveFilter = { type: 'unit', id: string } | { type: 'project', id: string } | { type: 'task', id: string } | { type: 'person', id: string } | null;
export type ViewMode = 'founder' | 'team';

export const ProjectDashboardView: React.FC<ProjectDashboardViewProps> = ({ isAuthenticated, token, user, onSignInRequest }) => {
    const [activeView, setActiveView] = useState<ProjectView>('home');
    const toast = useToast();
    
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        try {
            const saved = localStorage.getItem('projectViewMode');
            return saved === 'team' ? 'team' : 'founder';
        } catch {
            return 'founder';
        }
    });

    useEffect(() => {
        localStorage.setItem('projectViewMode', viewMode);
    }, [viewMode]);

    // Data states
    const [projects, setProjects] = useState<Project[]>(() => getAnyCache(`sheet_data_${SheetKey.PROJECTS}`) || []);
    const [tasks, setTasks] = useState<ProjectTask[]>(() => getAnyCache(`sheet_data_${SheetKey.TASKS}`) || []);
    const [people, setPeople] = useState<SheetUser[]>(() => getAnyCache(`sheet_data_${SheetKey.PEOPLE}`) || []);
    const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>(() => getAnyCache(`sheet_data_${SheetKey.BUSINESS_UNITS}`) || []);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filter State
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);

    // Detail view states
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<SheetUser | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const accessToken = token?.access_token || null;
            const [projData, taskData, peopleData, unitData, flywheelData] = await Promise.all([
                fetchSheetData(SheetKey.PROJECTS, accessToken),
                fetchSheetData(SheetKey.TASKS, accessToken),
                fetchSheetData(SheetKey.PEOPLE, accessToken),
                fetchSheetData(SheetKey.BUSINESS_UNITS, accessToken),
                fetchSheetData(SheetKey.FLYWHEEL, accessToken),
            ]);

            const allData = {
                [SheetKey.PROJECTS]: projData,
                [SheetKey.TASKS]: taskData,
                [SheetKey.PEOPLE]: peopleData,
                [SheetKey.BUSINESS_UNITS]: unitData,
                [SheetKey.FLYWHEEL]: flywheelData,
            };

            const hydratedProjects = hydrateData(projData, SheetKey.PROJECTS, allData);
            const hydratedTasks = hydrateData(taskData, SheetKey.TASKS, allData);
            const hydratedPeople = hydrateData(peopleData, SheetKey.PEOPLE, allData);
            const hydratedUnits = hydrateData(unitData, SheetKey.BUSINESS_UNITS, allData);
            
            setProjects(hydratedProjects);
            setTasks(hydratedTasks);
            setPeople(hydratedPeople);
            setBusinessUnits(hydratedUnits);

        } catch (error) {
            const msg = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Failed to load project data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, [token, toast]);

    useEffect(() => {
        fetchData();
    }, [isAuthenticated, token, toast]);
    
    useEffect(() => {
        // Clear the filter if we navigate away from the home view
        if (activeView !== 'home') {
            setActiveFilter(null);
        }
    }, [activeView]);

    const handleDataChange = () => {
        // This function can be called by child components after a data modification
        // to trigger a re-fetch of all data.
        fetchData();
    };
    
    const closeAllDetails = () => {
        setSelectedProject(null);
        setSelectedTask(null);
        setSelectedPerson(null);
        setSelectedUnit(null);
    };

    const handleProjectSelect = (project: Project) => {
        if(activeView === 'home') {
            setActiveFilter({ type: 'project', id: String(project.project_id) });
        } else {
            setSelectedTask(null);
            setSelectedPerson(null);
            setSelectedUnit(null);
            setSelectedProject(project);
        }
    }
    const handleTaskSelect = (task: ProjectTask) => {
         if(activeView === 'home') {
            setActiveFilter({ type: 'task', id: String(task.task_id) });
        } else {
            setSelectedTask(task);
        }
    }
    const handlePersonSelect = (person: SheetUser) => {
        if(activeView === 'home') {
            setActiveFilter({ type: 'person', id: String(person.user_id) });
        } else {
            closeAllDetails();
            setSelectedPerson(person);
        }
    }
    const handleUnitSelect = (unit: BusinessUnit) => {
        if(activeView !== 'home') {
            closeAllDetails();
            setSelectedUnit(unit);
        } else {
            // In home view, unit selection is a filter
            const unitId = String(unit.bu_id);
            if (activeFilter?.type === 'unit' && activeFilter.id === unitId) {
                setActiveFilter(null);
            } else {
                setActiveFilter({ type: 'unit', id: unitId });
            }
        }
    }

    const navItems: { id: ProjectView, label: string }[] = [
        { id: 'home', label: 'Home' },
        { id: 'projects', label: 'Projects' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'people', label: 'People' },
    ];

    return (
        <div className="bg-dark-surface min-h-full">
            <div className="p-6">
                <nav className="mb-6 border-b border-dark-border flex justify-between items-center flex-wrap gap-y-4">
                    <ul className="flex items-center gap-4">
                        {navItems.map(item => (
                             <li key={item.id}>
                                <button
                                    onClick={() => setActiveView(item.id)}
                                    className={`py-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
                                        activeView === item.id 
                                        ? 'text-accent-orange border-accent-orange' 
                                        : 'text-text-muted border-transparent hover:text-text-light'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {activeView === 'home' && (
                        <div className="flex items-center gap-2" role="radiogroup" aria-label="Dashboard View Mode">
                             <label onClick={() => setViewMode('team')} className={`text-sm font-semibold transition-colors cursor-pointer ${viewMode === 'team' ? 'text-text-light' : 'text-text-muted'}`}>Team</label>
                            <ToggleSwitch
                                id="view-mode-toggle"
                                checked={viewMode === 'founder'}
                                onChange={() => setViewMode(vm => vm === 'founder' ? 'team' : 'founder')}
                            />
                             <label onClick={() => setViewMode('founder')} className={`text-sm font-semibold transition-colors cursor-pointer ${viewMode === 'founder' ? 'text-text-light' : 'text-text-muted'}`}>Founder</label>
                        </div>
                    )}
                </nav>

                <main>
                    {activeView === 'home' && <DashboardHome 
                        isAuthenticated={isAuthenticated} 
                        user={user} 
                        onSignInRequest={onSignInRequest} 
                        projects={projects} 
                        tasks={tasks} 
                        people={people} 
                        businessUnits={businessUnits} 
                        isLoading={isLoading}
                        onProjectSelect={handleProjectSelect}
                        onTaskSelect={handleTaskSelect}
                        onPersonSelect={handlePersonSelect}
                        onUnitSelect={handleUnitSelect}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        viewMode={viewMode}
                         />}
                    {activeView === 'projects' && <ProjectsList isAuthenticated={isAuthenticated} token={token} projects={projects} tasks={tasks} headers={projects.length > 0 ? Object.keys(projects[0]) : []} people={people} businessUnits={businessUnits} isLoading={isLoading} onDataChange={handleDataChange} onProjectSelect={handleProjectSelect} />}
                    {activeView === 'tasks' && <TasksList isAuthenticated={isAuthenticated} token={token} tasks={tasks} projects={projects} people={people} headers={tasks.length > 0 ? Object.keys(tasks[0]) : []} isLoading={isLoading} onDataChange={handleDataChange} onTaskSelect={handleTaskSelect} />}
                    {activeView === 'people' && <PeopleDirectory isAuthenticated={isAuthenticated} people={people} headers={people.length > 0 ? Object.keys(people[0]) : []} isLoading={isLoading} onPersonSelect={handlePersonSelect} />}
                </main>
            </div>
            
             <AnimatePresence>
                {selectedProject && <ProjectDetailModal 
                    project={selectedProject} 
                    tasks={tasks.filter(t => String(t['Project id']) === String(selectedProject.project_id))} 
                    onClose={() => { setSelectedProject(null); setSelectedTask(null); }}
                    onTaskSelect={handleTaskSelect}
                />}
                {selectedTask && <TaskDetailSidebar task={selectedTask} onClose={() => setSelectedTask(null)} />}
                {selectedPerson && <PersonDetailSidebar person={selectedPerson} projects={projects.filter(p => String(p.owner_User_id) === String(selectedPerson.user_id))} tasks={tasks.filter(t => String(t.assignee_User_id) === String(selectedPerson.user_id))} onClose={() => setSelectedPerson(null)} onProjectSelect={handleProjectSelect} />}
                {selectedUnit && <BusinessUnitDetailSidebar unit={selectedUnit} projects={projects.filter(p => String(p.business_unit_id) === String(selectedUnit.bu_id))} onClose={() => setSelectedUnit(null)} onProjectSelect={handleProjectSelect} />}
            </AnimatePresence>
        </div>
    );
};
