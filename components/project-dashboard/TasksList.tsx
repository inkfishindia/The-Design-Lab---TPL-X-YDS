import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import type { TokenResponse, ProjectTask, Project, SheetUser } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ListIcon } from '../icons/ListIcon';
import { KanbanIcon } from '../icons/KanbanIcon';
import { TasksKanbanBoard } from './TasksKanbanBoard';
import { useToast } from '../ui/Toast';
import { appendRow, updateRow, deleteRow } from '../../services/googleSheetsService';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { Select } from '../ui/Select';
import { HYDRATION_MAP, SheetKey } from '../../services/configService';

interface TasksListProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  tasks: ProjectTask[];
  projects: Project[];
  people: SheetUser[];
  headers: string[];
  isLoading: boolean;
  onDataChange: () => void;
  onTaskSelect: (task: ProjectTask) => void;
}

type SortConfig = {
    key: string;
    direction: 'ascending' | 'descending';
};

const useSortableData = (items: ProjectTask[], config: SortConfig | null = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: { [key: string]: 'green' | 'blue' | 'gray' | 'red' } = {
        'done': 'green',
        'completed': 'green',
        'in_progress': 'blue',
        'to_do': 'gray',
        'blocked': 'red',
    };
    const lowerStatus = String(status).toLowerCase();
    const color = colorMap[lowerStatus] || 'gray';
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

export const TasksList: React.FC<TasksListProps> = ({ isAuthenticated, token, tasks, projects, people, headers, isLoading, onDataChange, onTaskSelect }) => {
    const [localTasks, setLocalTasks] = useState(tasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<Partial<ProjectTask> | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        if (selectedProjectId === 'all') {
            return localTasks;
        }
        return localTasks.filter(t => String(t['Project id']) === selectedProjectId);
    }, [localTasks, selectedProjectId]);


    const { items: sortedTasks, requestSort, sortConfig } = useSortableData(filteredTasks);
    const [view, setView] = useState<'table' | 'kanban'>('table');
    const toast = useToast();
    
    const [editingCell, setEditingCell] = useState<{ rowIndex: number; header: string } | null>(null);
    const [editContent, setEditContent] = useState<string | number>('');
    const [isSaving, setIsSaving] = useState(false);

    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };
    
    const editableHeaders = useMemo(() => ['title', 'status', 'priority', 'estimate_hours'], []);
    const headerOptions: { [key: string]: string[] } = useMemo(() => ({
        status: ['to_do', 'in_progress', 'blocked', 'done', 'completed'],
        priority: ['High', 'Medium', 'Low'],
    }), []);

    const handleStartEditing = (task: ProjectTask, header: string) => {
        if (!isAuthenticated || !editableHeaders.includes(header) || isSaving) return;
        setEditingCell({ rowIndex: task.rowIndex, header });
        setEditContent(task[header] || '');
    };

    const handleCancelEditing = () => {
        setEditingCell(null);
        setEditContent('');
    };

    const handleSaveEditing = async () => {
        if (!editingCell || isSaving || !token) return;
        
        const originalTask = sortedTasks.find(t => t.rowIndex === editingCell.rowIndex);
        if (!originalTask || originalTask[editingCell.header] === editContent) {
            handleCancelEditing();
            return;
        }

        setIsSaving(true);
        const updatedTask = { ...originalTask, [editingCell.header]: editContent };
        
        const originalTasks = [...localTasks];
        setLocalTasks(prev => prev.map(t => t.rowIndex === originalTask.rowIndex ? updatedTask : t));
        handleCancelEditing();

        try {
            await updateRow(SheetKey.TASKS, originalTask.rowIndex, updatedTask, token.access_token);
        } catch(err) {
            const msg = err instanceof Error ? err.message : 'Update failed.';
            toast.error(msg);
            setLocalTasks(originalTasks);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleUpdateTaskStatus = async (task: ProjectTask, newStatus: string) => {
        if (!token) return;
        const originalTasks = [...localTasks];
        const updatedTask = { ...task, 'status': newStatus };
        setLocalTasks(prev => prev.map(t => t.rowIndex === task.rowIndex ? updatedTask : t));

        try {
            await updateRow(SheetKey.TASKS, task.rowIndex, updatedTask, token.access_token);
        } catch(err) {
            const msg = err instanceof Error ? err.message : 'Update failed.';
            toast.error(msg);
            setLocalTasks(originalTasks);
        }
    }
    
    const handleOpenModal = (task?: ProjectTask) => {
        if (!isAuthenticated) {
            toast.info("Please sign in to add or edit tasks.");
            return;
        }
        if (task) {
            setCurrentTask({ ...task });
        } else {
            const newTask = headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
            setCurrentTask(newTask);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTask(null);
    };
    
    const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentTask(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTask || !token) return;

        setIsSaving(true);
        try {
            if (currentTask.rowIndex) {
                await updateRow(SheetKey.TASKS, currentTask.rowIndex, currentTask as ProjectTask, token.access_token);
                toast.success("Task updated!");
            } else {
                await appendRow(SheetKey.TASKS, currentTask, token.access_token);
                toast.success("Task added!");
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
    
    const handleDeleteTask = async (task: ProjectTask) => {
        if (!token) return;
        const taskTitle = task.title || 'this task';
        if (!window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) return;

        try {
            await deleteRow(SheetKey.TASKS, task.rowIndex, token.access_token);
            toast.success("Task deleted.");
            onDataChange();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Delete failed.';
            toast.error(msg);
        }
    };
    
    const renderCellContent = (task: ProjectTask, header: string) => {
        if (editingCell?.rowIndex === task.rowIndex && editingCell?.header === header) {
             if (header in headerOptions) {
                return <Select value={String(editContent)} onChange={(e) => setEditContent(e.target.value)} onBlur={handleSaveEditing} onKeyDown={(e) => { if (e.key === 'Escape') handleCancelEditing() }} autoFocus>{headerOptions[header].map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}</Select>;
            }
            return <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} onBlur={handleSaveEditing} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditing(); if (e.key === 'Escape') handleCancelEditing(); }} autoFocus />;
        }

        const resolvedValue = task[`${header}_resolved`];
        const value = task[header];
        const content = resolvedValue ? <span title={`ID: ${value}`}>{String(resolvedValue)}</span> : value === null || value === undefined || String(value).trim() === '' ? <span className="text-text-muted/50">—</span> : header.toLowerCase().includes('status') ? <StatusBadge status={String(value)} /> : header.toLowerCase().includes('priority') ? <PriorityBadge priority={String(value)} /> : String(value);
        return <span className={`block p-2 -m-2 rounded-md transition-colors ${editableHeaders.includes(header) ? 'group-hover:bg-dark-border/50 cursor-pointer' : ''}`}>{content}</span>;
    };


    const SkeletonLoader = () => (
        <Card className="overflow-x-auto">
            <table className="min-w-full">
                <thead><tr>{[...Array(5)].map((_, i) => <th key={i} className="p-3"><Skeleton className="h-5 w-full" /></th>)}</tr></thead>
                <tbody>{[...Array(10)].map((_, i) => (<tr key={i} className="border-t border-dark-border">{[...Array(5)].map((_, j) => <td key={j} className="p-3"><Skeleton className="h-6 w-full" /></td>)}</tr>))}</tbody>
            </table>
        </Card>
    );

    return (
        <div>
             <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-2xl font-bold font-display text-text-light">All Tasks</h3>
                    <p className="text-sm text-text-muted mt-1">Double-click a cell to edit. Click a row to see details.</p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="w-48">
                         <Select id="project-filter" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} disabled={isLoading || projects.length === 0}>
                            <option value="all">All Projects</option>
                            {projects.map(p => <option key={String(p.project_id)} value={String(p.project_id)}>{String(p['Project Name'])}</option>)}
                        </Select>
                    </div>
                    <div className="p-1 bg-dark-border/50 rounded-lg flex items-center">
                        <Button onClick={() => setView('table')} variant={view === 'table' ? 'primary' : 'secondary'} size="sm" className={`!p-1.5 ${view === 'table' ? '' : '!bg-transparent !text-text-muted'}`} title="Table View"><ListIcon className="w-4 h-4" /></Button>
                        <Button onClick={() => setView('kanban')} variant={view === 'kanban' ? 'primary' : 'secondary'} size="sm" className={`!p-1.5 ${view === 'kanban' ? '' : '!bg-transparent !text-text-muted'}`} title="Kanban View"><KanbanIcon className="w-4 h-4" /></Button>
                    </div>
                     <Button onClick={() => handleOpenModal()} variant="creative" leftIcon={<PlusIcon className="w-5 h-5"/>} disabled={!isAuthenticated}>Add Task</Button>
                </div>
            </div>
            {isLoading && <SkeletonLoader />}
            {!isLoading && sortedTasks.length === 0 && <Card><p className="text-center p-8 text-text-muted">No tasks found.</p></Card>}
            <AnimatePresence mode="wait">
                <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {!isLoading && view === 'table' && sortedTasks.length > 0 && (
                         <Card className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="border-b border-dark-border">
                                    <tr>
                                        {headers.map(header => (<th key={header} className="p-3 font-semibold text-text-light capitalize"><button onClick={() => requestSort(header)} className="flex items-center gap-2">{header.replace(/_/g, ' ')}<span className="opacity-50">{getSortIndicator(header)}</span></button></th>))}
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTasks.map(task => (
                                        <tr key={task.rowIndex} className="border-t border-dark-border hover:bg-dark-border/20">
                                            {headers.map(header => ( <td key={header} className="p-3 text-text-light/90 align-middle has-[:focus]:p-1 group" onDoubleClick={() => handleStartEditing(task, header)} onClick={() => onTaskSelect(task)}>{renderCellContent(task, header)}</td>))}
                                            <td className="p-3 text-right">
                                                <Button onClick={() => handleDeleteTask(task)} variant="danger" size="sm" className="!p-1.5" title="Delete Task" disabled={!isAuthenticated}><TrashIcon className="w-4 h-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )}
                    {!isLoading && view === 'kanban' && sortedTasks.length > 0 && (
                        <TasksKanbanBoard tasks={sortedTasks} onUpdateTask={handleUpdateTaskStatus} onTaskSelect={onTaskSelect} />
                    )}
                </motion.div>
            </AnimatePresence>

            {currentTask && (
                 <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentTask.rowIndex ? 'Edit Task' : 'Add New Task'} size="2xl">
                    <form onSubmit={handleSaveTask} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {headers.filter(h => h !== 'rowIndex').map(header => {
                            const mapping = HYDRATION_MAP.find(m => m.sourceSheet === SheetKey.TASKS && m.sourceColumnId === header);
                            if (mapping) {
                                const optionsData = mapping.targetSheet === SheetKey.PEOPLE ? people : projects;
                                return <Select key={header} label={header.replace(/_/g, ' ')} name={header} value={String(currentTask[header] || '')} onChange={handleModalInputChange}>{optionsData.map(option => (<option key={String(option[mapping.targetColumnId])} value={String(option[mapping.targetColumnId])}>{String(option[mapping.displayColumn])}</option>))}</Select>
                            }
                             if (header === 'description') return <Textarea key={header} label="Description" name="description" value={String(currentTask.description || '')} onChange={handleModalInputChange} rows={4} />;
                            return <Input key={header} label={header.replace(/_/g, ' ')} name={header} value={String(currentTask[header] || '')} onChange={handleModalInputChange} />;
                        })}
                        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-dark-surface pb-1">
                            <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Task'}</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};
