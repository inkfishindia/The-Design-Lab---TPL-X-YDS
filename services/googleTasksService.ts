import type { Task } from '../types';

const BASE_URL = 'https://www.googleapis.com/tasks/v1';

export const getTaskLists = async (accessToken: string) => {
  const response = await fetch(`${BASE_URL}/users/@me/lists`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch task lists.');
  return await response.json();
};

export const getTasks = async (taskListId: string, accessToken: string) => {
  const response = await fetch(`${BASE_URL}/lists/${taskListId}/tasks`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch tasks.');
  return await response.json();
};

export const createTask = async (taskListId: string, title: string, accessToken: string): Promise<Task> => {
  const response = await fetch(`${BASE_URL}/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to create task.');
  return await response.json();
};

export const updateTask = async (
    taskListId: string, 
    taskId: string, 
    payload: { title?: string; status?: 'needsAction' | 'completed' }, 
    accessToken: string
): Promise<Task> => {
    const response = await fetch(`${BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, id: taskId }),
    });
    if (!response.ok) throw new Error('Failed to update task.');
    return await response.json();
};

export const deleteTask = async (taskListId: string, taskId: string, accessToken: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) throw new Error('Failed to delete task.');
};