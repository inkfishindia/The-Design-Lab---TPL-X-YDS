
import React, { useState, useEffect, useCallback } from 'react';
import type { TokenResponse, TaskList, Task } from '../types';
import { getTasks, createTask, updateTask, deleteTask } from '../services/googleTasksService';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useToast } from './ui/Toast';
import { Skeleton } from './ui/Skeleton';

interface MyTasksWidgetProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  primaryTaskListId: string | null;
  taskLists: TaskList[];
  onTaskListChange: (id: string | null) => void;
}

export const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({
  isAuthenticated,
  token,
  primaryTaskListId,
  taskLists,
  onTaskListChange,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<{ id: string; title: string } | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isAuthenticated || !token || !primaryTaskListId) {
        setTasks([]);
        return;
      }

      setIsLoading(true);
      try {
        const tasksData = await getTasks(primaryTaskListId, token.access_token);
        setTasks(tasksData.items || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        toast.error(`Could not load tasks: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [isAuthenticated, token, primaryTaskListId, toast]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !token || !primaryTaskListId) return;

    setIsAdding(true);
    try {
      const newTask = await createTask(primaryTaskListId, newTaskTitle, token.access_token);
      setTasks(prev => [newTask, ...prev]);
      setNewTaskTitle('');
      toast.success("Task added!");
    } catch (err) {
      toast.error('Failed to add task.');
      console.error('Failed to add task', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!token || !primaryTaskListId) return;

    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    const originalTasks = tasks;
    
    // Optimistically update UI
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      await updateTask(primaryTaskListId, task.id, { status: newStatus }, token.access_token);
    } catch (err) {
      console.error('Failed to update task', err);
      toast.error('Failed to update task.');
      // Revert on error
      setTasks(originalTasks);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTask({ id: task.id, title: task.title });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };
  
  const handleUpdateTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token || !primaryTaskListId || !editingTask) return;
      
      const originalTasks = tasks;
      const updatedTitle = editingTask.title.trim();

      if (!updatedTitle) {
          toast.error("Task title cannot be empty.");
          return;
      }
      
      const taskIdToUpdate = editingTask.id;
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskIdToUpdate ? { ...t, title: updatedTitle } : t));
      setEditingTask(null); 

      try {
          await updateTask(primaryTaskListId, taskIdToUpdate, { title: updatedTitle }, token.access_token);
          toast.success("Task updated!");
      } catch (err) {
          console.error('Failed to update task', err);
          toast.error('Failed to update task.');
          setTasks(originalTasks); // Revert
      }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token || !primaryTaskListId || !window.confirm("Are you sure you want to delete this task?")) return;
    
    const originalTasks = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId)); // Optimistic update

    try {
      await deleteTask(primaryTaskListId, taskId, token.access_token);
      toast.success("Task deleted.");
    } catch (err) {
      console.error('Failed to delete task', err);
      toast.error('Failed to delete task.');
      setTasks(originalTasks); // Revert on error
    }
  };
  
  const SkeletonLoader = () => (
    <ul className="space-y-3 p-4">
        {[...Array(4)].map((_, i) => (
            <li key={i} className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-5 flex-grow" />
            </li>
        ))}
    </ul>
  );

  return (
    <div className="flex flex-col h-full bg-cream text-midnight-navy">
      <div className="p-4 border-b border-midnight-navy/10">
        {isAuthenticated && taskLists.length > 0 ? (
          <Select
            id="task-list-select"
            label="Task list:"
            value={primaryTaskListId || ''}
            onChange={(e) => onTaskListChange(e.target.value)}
          >
            {taskLists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </Select>
        ) : (
          <p className="text-sm text-center text-midnight-navy/70 py-2">Sign in to manage tasks.</p>
        )}
      </div>

      <div className="flex-grow overflow-y-auto">
        {isLoading && <SkeletonLoader />}
        {!isLoading && tasks.length === 0 && isAuthenticated && (
            <p className="text-sm text-center text-midnight-navy/60 pt-8 px-4">No tasks here. Add one below!</p>
        )}
        {!isLoading && (
            <ul className="space-y-2 p-4">
                {tasks.map(task => (
                    <li key={task.id} className="group flex items-center gap-3 p-1 rounded-md hover:bg-midnight-navy/5">
                        <button onClick={() => handleToggleTask(task)} title={`Mark as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}>
                            <CheckCircleIcon 
                                completed={task.status === 'completed'}
                                className={`w-6 h-6 transition-colors ${
                                    task.status === 'completed'
                                    ? 'text-success-green'
                                    : 'text-midnight-navy/40 hover:text-midnight-navy'
                                }`}
                            />
                        </button>
                        {editingTask?.id === task.id ? (
                            <form onSubmit={handleUpdateTask} className="flex-grow flex items-center gap-2">
                                <Input
                                    value={editingTask.title}
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    autoFocus
                                    className="!py-1 text-sm"
                                />
                                <Button type="submit" size="sm" variant="primary" className="!px-2 !text-xs">Save</Button>
                                <Button type="button" onClick={handleCancelEdit} size="sm" variant="secondary" className="!px-2 !text-xs">Cancel</Button>
                            </form>
                        ) : (
                          <>
                            <span className={`flex-grow text-sm cursor-pointer ${task.status === 'completed' ? 'line-through text-midnight-navy/60' : ''}`} onDoubleClick={() => handleStartEdit(task)}>
                                {task.title}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button onClick={() => handleStartEdit(task)} variant="secondary" size="sm" className="!p-1.5" title="Edit task">
                                    <EditIcon className="w-4 h-4" />
                                </Button>
                                <Button onClick={() => handleDeleteTask(task.id)} variant="danger" size="sm" className="!p-1.5" title="Delete task">
                                    <TrashIcon className="w-4 h-4" />
                                </Button>
                            </div>
                          </>
                        )}
                    </li>
                ))}
            </ul>
        )}
      </div>

      {isAuthenticated && primaryTaskListId && (
        <form onSubmit={handleAddTask} className="p-4 border-t border-midnight-navy/10 flex-shrink-0 flex gap-2">
          <div className="flex-grow">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              disabled={isAdding}
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="!px-3" disabled={isAdding || !newTaskTitle.trim()}>
            <PlusIcon className="w-5 h-5" />
          </Button>
        </form>
      )}
    </div>
  );
};