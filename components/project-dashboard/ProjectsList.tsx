import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { appendRow, updateRow, deleteRow } from '../../services/googleSheetsService';
import { HYDRATION_MAP, SheetKey } from '../../services/configService';
import type { TokenResponse, Project, BusinessUnit, SheetUser, ProjectTask } from '../../types';
import { useToast } from '../ui/Toast';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PlusIcon } from '../icons/PlusIcon';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { Select } from '../ui/Select';
import { ListIcon } from '../icons/ListIcon';
import { KanbanIcon } from '../icons/KanbanIcon';
import { KanbanBoard } from './KanbanBoard';

interface ProjectsListProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  projects: Project[];
  tasks: ProjectTask[];
  headers: string[];
  people: SheetUser[];
  businessUnits: BusinessUnit[];
  isLoading: boolean;
  onDataChange: () => void;
  onProjectSelect: (project: Project) => void;
}


const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const lowerStatus = String(status || '').toLowerCase();
    let color: 'green' | 'yellow' | 'red' | 'gray' | 'blue' = 'gray';
    if (['on track', 'in_progress', 'active'].includes(lowerStatus)) color = 'blue';
    else if (lowerStatus.includes('at risk')) color = 'yellow';
    else if (lowerStatus.includes('blocked')) color = 'red';
    else if (['done', 'completed'].includes(lowerStatus)) color = 'green';
    
    return <Badge color={color}>{status}</Badge>;
};

const ProjectCard: React.FC<{ 
    project: Project; 
    tasks: ProjectTask[];
    onEdit: (e: React.MouseEvent) => void; 
    onDelete: (e: React.MouseEvent) => void; 
    onClick: () => void;
}> = ({ project, tasks, onEdit, onDelete, onClick }) => {
    const projectTasks = useMemo(() => tasks.filter(t => String(t['Project id']) === String(project.project_id)), [tasks, project]);
    const completedTasks = useMemo(() => projectTasks.filter(t => ['done', 'completed'].includes(String(t.status).toLowerCase())), [projectTasks]);
    const taskProgress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
    const projectName = project['Project Name'] || 'Untitled Project';
    const projectStatus = project.Status || project.status || 'Unknown';
    
    return (
        <Card 
            className="flex flex-col h-full cursor-pointer hover:ring-2 hover:ring-accent-orange transition-shadow !bg-dark-bg"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2 flex-grow">
                <div>
                    <h4 className="font-bold text-lg text-accent-blue pr-4">{String(projectName)}</h4>
                    <p className="text-sm text-text-light/80">
                        <strong>Owner:</strong> {String(project.owner_User_id_resolved || project.owner_User_id || 'N/A')}
                    </p>
                </div>
                <StatusBadge status={String(projectStatus)} />
            </div>

            <div className="space-y-3 text-sm text-text-light/80 mt-2">
                 <div>
                    <label className="text-xs font-semibold text-text-muted">Task Progress ({completedTasks.length}/{projectTasks.length})</label>
                    <ProgressBar progress={taskProgress} />
                </div>
                <div>
                    <div className="flex justify-between items-center font-semibold mb-1">
                        <p>Confidence</p>
                        <p>{project.confidence_pct || 0}%</p>
                    </div>
                    <ProgressBar progress={Number(project.confidence_pct || 0)} />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-border flex justify-end gap-2">
                <Button onClick={onEdit} variant="secondary" size="sm" className="!p-1.5" title="Edit">
                    <EditIcon className="w-4 h-4" />
                </Button>
                <Button onClick={onDelete} variant="danger" size="sm" className="!p-1.5" title="Delete">
                    <TrashIcon className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
};


export const ProjectsList: React.FC<ProjectsListProps> = ({ isAuthenticated, token, projects, tasks, headers, people, businessUnits, isLoading, onDataChange, onProjectSelect }) => {
    const toast = useToast();
    const [view, setView] = useState<'grid' | 'kanban'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
    const [localProjects, setLocalProjects] = useState<Project[]>(projects);

    useEffect(() => {
        setLocalProjects(projects);
    }, [projects]);

    const filteredProjects = useMemo(() => {
        if (selectedUnitId === 'all') {
            return localProjects;
        }
        return localProjects.filter(p => String(p.business_unit_id) === selectedUnitId);
    }, [localProjects, selectedUnitId]);

    const handleOpenModal = (e: React.MouseEvent, project?: Project) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.info("Please sign in to add or edit projects.");
            return;
        }
        if (project) {
            setCurrentProject({ ...project });
        } else {
            const newProject = headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
            setCurrentProject(newProject);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProject(null);
    };
    
    const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentProject(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProject || !token) return;

        setIsSaving(true);
        try {
            if (currentProject.rowIndex) {
                await updateRow(SheetKey.PROJECTS, currentProject.rowIndex, currentProject as Project, token.access_token);
                toast.success("Project updated!");
            } else {
                await appendRow(SheetKey.PROJECTS, currentProject, token.access_token);
                toast.success("Project added!");
            }
            onDataChange();
            handleCloseModal();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Save failed.';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleUpdateProjectStatus = async (project: Project, newStatus: string) => {
        if (!token) return;
        const originalProjects = [...localProjects];
        setLocalProjects(prev => prev.map(p => p.rowIndex === project.rowIndex ? { ...p, 'status': newStatus, 'Status': newStatus } : p));
        try {
            await updateRow(SheetKey.PROJECTS, project.rowIndex, { ...project, 'status': newStatus, 'Status': newStatus }, token.access_token);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Update failed.';
            toast.error(msg);
            setLocalProjects(originalProjects);
        }
    };

    const handleDelete = async (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        if (!token) return;

        const projectName = project['Project Name'] || 'this project';
        if (!window.confirm(`Are you sure you want to delete "${projectName}"?`)) return;

        try {
            await deleteRow(SheetKey.PROJECTS, project.rowIndex, token.access_token);
            toast.success("Project deleted.");
            onDataChange();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Delete failed.';
            toast.error(msg);
        }
    };
    
    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <div className="pt-2">
                        <Skeleton className="h-2 w-full" />
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h3 className="text-2xl font-bold font-display text-text-light">All Projects</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-48">
                         <Select
                            id="bu-filter"
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                            disabled={isLoading || businessUnits.length === 0}
                        >
                            <option value="all">All Units</option>
                            {businessUnits.map(unit => (
                                <option key={String(unit.bu_id)} value={String(unit.bu_id)}>
                                    {String(unit.bu_name)}
                                </option>
                            ))}
                        </Select>
                    </div>
                     <div className="p-1 bg-dark-border/50 rounded-lg flex items-center">
                        <Button onClick={() => setView('grid')} variant={view === 'grid' ? 'primary' : 'secondary'} size="sm" className={`!p-1.5 ${view === 'grid' ? '' : '!bg-transparent !text-text-muted'}`} title="Grid View"><ListIcon className="w-4 h-4" /></Button>
                        <Button onClick={() => setView('kanban')} variant={view === 'kanban' ? 'primary' : 'secondary'} size="sm" className={`!p-1.5 ${view === 'kanban' ? '' : '!bg-transparent !text-text-muted'}`} title="Kanban View"><KanbanIcon className="w-4 h-4" /></Button>
                    </div>
                    <Button onClick={(e) => handleOpenModal(e)} variant="creative" leftIcon={<PlusIcon className="w-5 h-5"/>} disabled={!isAuthenticated}>
                        Add Project
                    </Button>
                </div>
            </div>
            {isLoading && <SkeletonLoader />}
            {!isLoading && projects.length === 0 && <p className="text-center p-8 text-text-muted bg-dark-bg rounded-lg">No projects found. Add one to get started.</p>}
            {!isLoading && projects.length > 0 && filteredProjects.length === 0 && <p className="text-center p-8 text-text-muted bg-dark-bg rounded-lg">No projects found for the selected business unit.</p>}
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {!isLoading && view === 'grid' && filteredProjects.length > 0 && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map(project => (
                                <ProjectCard
                                    key={project.rowIndex}
                                    project={project}
                                    tasks={tasks}
                                    onClick={() => onProjectSelect(project)}
                                    onEdit={(e) => handleOpenModal(e, project)}
                                    onDelete={(e) => handleDelete(e, project)}
                                />
                            ))}
                        </div>
                    )}
                     {!isLoading && view === 'kanban' && filteredProjects.length > 0 && (
                       <KanbanBoard projects={filteredProjects} onUpdateProject={handleUpdateProjectStatus} />
                    )}
                </motion.div>
            </AnimatePresence>

            {currentProject && (
                 <Modal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    title={currentProject.rowIndex ? 'Edit Project' : 'Add New Project'} 
                    size="2xl"
                >
                    <form onSubmit={handleSaveProject} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {headers.filter(h => h !== 'rowIndex').map(header => {
                            const mapping = HYDRATION_MAP.find(m => m.sourceSheet === SheetKey.PROJECTS && m.sourceColumnId === header);
                            if (mapping) {
                                const optionsData = mapping.targetSheet === SheetKey.PEOPLE ? people : businessUnits;
                                return (
                                    <Select
                                        key={header}
                                        label={header.replace(/_/g, ' ')}
                                        name={header}
                                        value={String(currentProject[header] || '')}
                                        onChange={handleModalInputChange}
                                    >
                                        <option value="">-- Select --</option>
                                        {optionsData.map(option => (
                                        <option key={String(option[mapping.targetColumnId])} value={String(option[mapping.targetColumnId])}>
                                            {String(option[mapping.displayColumn])}
                                        </option>
                                        ))}
                                    </Select>
                                )
                            }
                            return (
                                <Input
                                    key={header}
                                    label={header.replace(/_/g, ' ')}
                                    name={header}
                                    value={String(currentProject[header] || '')}
                                    onChange={handleModalInputChange}
                                />
                            );
                        })}
                        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-dark-surface pb-1">
                            <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Project'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};