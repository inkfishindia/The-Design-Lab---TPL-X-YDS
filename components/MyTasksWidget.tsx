import React, { useState, useEffect, useCallback } from 'react';
import type { TokenResponse, Task, TaskList } from '../types';
import { getTasks, createTask, updateTask } from '../services/googleTasksService';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PlusIcon } from './icons/PlusIcon';

interface MyTasksWidgetProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  primaryTaskListId: string | null;
  taskLists: TaskList[];
  onTaskListChange: (id: string | null) => void;
}

export const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ isAuthenticated, token, primaryTaskListId, taskLists, onTaskListChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated || !token || !primaryTaskListId) {
      setTasks([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const taskData = await getTasks(primaryTaskListId, token.access_token);
      setTasks(taskData.items || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not load tasks: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, primaryTaskListId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !token || !primaryTaskListId) return;

    try {
      const createdTask = await createTask(primaryTaskListId, newTaskTitle, token.access_token);
      setTasks(prev => [createdTask, ...prev]);
      setNewTaskTitle('');
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!token || !primaryTaskListId) return;

    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      await updateTask(primaryTaskListId, task.id, newStatus, token.access_token);
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
      // Revert UI on failure
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {isAuthenticated && taskLists.length > 0 && (
          <div className="p-4 border-b border-midnight-navy/10">
              <Select
                  value={primaryTaskListId || ''}
                  onChange={(e) => onTaskListChange(e.target.value)}
                  aria-label="Select Task List"
              >
                  {taskLists.map((list) => (
                      <option key={list.id} value={list.id}>{list.title}</option>
                  ))}
              </Select>
          </div>
      )}

      <div className="flex-grow p-4 overflow-y-auto min-h-[150px]">
        {isAuthenticated ? (
            <>
                {isLoading && <p className="text-sm text-center text-midnight-navy/70">Loading tasks...</p>}
                {error && <p className="text-sm text-center text-error-red">{error}</p>}
                {!isLoading && tasks.length === 0 && !error && (
                    <p className="text-sm text-center text-midnight-navy/60">No tasks in this list.</p>
                )}
                <ul className="space-y-2">
                    {tasks.filter(t => t.status !== 'completed').map(task => (
                        <li key={task.id} className="flex items-center gap-3">
                            <button onClick={() => handleToggleTask(task)}>
                                <CheckCircleIcon className="w-6 h-6 text-midnight-navy/30 hover:text-heritage-blue" />
                            </button>
                            <span className="text-sm">{task.title}</span>
                        </li>
                    ))}
                </ul>
            </>
        ) : (
          <p className="text-sm text-center text-midnight-navy/60 pt-10">Sign in to view your tasks.</p>
        )}
      </div>

      {isAuthenticated && primaryTaskListId && (
        <form onSubmit={handleAddTask} className="p-4 border-t border-midnight-navy/10">
            <div className="relative">
                <Input 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="!pr-10"
                />
                <Button type="submit" size="sm" className="!absolute !right-1.5 !top-1/2 !-translate-y-1/2 !p-1.5" disabled={!newTaskTitle.trim()}>
                    <PlusIcon className="w-5 h-5"/>
                </Button>
            </div>
        </form>
      )}
    </div>
  );
};