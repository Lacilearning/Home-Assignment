import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

export type Task = {
  id: number | string;
  title: string;
  description: string;
  completed: boolean;
  assignee: string;
  status: string;
};

export type TaskPayload = Omit<Task, 'id'>;
export type TaskRequestPayload = Record<string, string | boolean | number>;
export type TaskAuthMode = 'valid' | 'unauthorized' | 'invalid-token';

const apiBaseUrl =
  process.env.TASKS_API_BASE_URL ?? 'http://127.0.0.1:3000';
const invalidAccessToken = 'invalid-playwright-access-token';

export const tasksUrl = new URL('/tasks', apiBaseUrl).toString();

export function taskUrl(id?: Task['id']): string {
  const path = id === undefined ? '/tasks/' : `/tasks/${encodeURIComponent(String(id))}`;
  return new URL(path, apiBaseUrl).toString();
}

function requestOptions(authMode: TaskAuthMode): { headers?: Record<string, string> } {
  if (authMode === 'unauthorized') {
    return {};
  }

  if (authMode === 'invalid-token') {
    return { headers: { Authorization: `Bearer ${invalidAccessToken}` } };
  }

  const accessToken = process.env.TASKS_API_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Set TASKS_API_ACCESS_TOKEN in .env for authenticated task API requests.');
  }

  return { headers: { Authorization: `Bearer ${accessToken}` } };
}

export function newTaskPayload(title = `Playwright task ${Date.now()}`): TaskPayload {
  return {
    title,
    description: 'Created by the Playwright task endpoint tests.',
    completed: false,
    assignee: 'test-user',
    status: 'pending',
  };
}

export function postTaskRequest(
  request: APIRequestContext,
  payload: TaskRequestPayload,
  authMode: TaskAuthMode = 'valid',
): Promise<APIResponse> {
  return request.post(tasksUrl, { data: payload, ...requestOptions(authMode) });
}

export function getTaskRequest(
  request: APIRequestContext,
  id: Task['id'] | undefined,
  authMode: TaskAuthMode = 'valid',
): Promise<APIResponse> {
  return request.get(taskUrl(id), requestOptions(authMode));
}

export function putTaskRequest(
  request: APIRequestContext,
  id: Task['id'] | undefined,
  payload: TaskRequestPayload,
  authMode: TaskAuthMode = 'valid',
): Promise<APIResponse> {
  return request.put(taskUrl(id), {
    data: payload,
    ...requestOptions(authMode),
  });
}

export function deleteTaskRequest(
  request: APIRequestContext,
  id: Task['id'] | undefined,
  authMode: TaskAuthMode = 'valid',
): Promise<APIResponse> {
  return request.delete(taskUrl(id), requestOptions(authMode));
}

export async function createTask(request: APIRequestContext): Promise<Task> {
  const payload = newTaskPayload();
  const response = await postTaskRequest(request, payload);

  expect(response.status()).toBe(201);
  const task = (await response.json()) as Task;
  expect(task).toMatchObject(payload);
  expect(task.id).toBeTruthy();

  return task;
}