import { expect, test } from '@playwright/test';
import {
  createTask,
  getTaskRequest,
} from '../../helpers/APIhelpers/taskApiHelper';

test('GET /tasks/{id} returns 200 with the requested task', async ({ request }) => {
  const createdTask = await createTask(request);
  const response = await getTaskRequest(request, createdTask.id);

  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject(createdTask);
});

test('GET /tasks/{id} rejects an unauthorized request with 401', async ({
  request,
}) => {
  const response = await getTaskRequest(request, 'existing-task-id', 'unauthorized');

  expect(response.status()).toBe(401);
});

test('GET /tasks/{id} rejects an invalid access token with 401', async ({
  request,
}) => {
  const response = await getTaskRequest(request, 'existing-task-id', 'invalid-token');

  expect(response.status()).toBe(401);
});

test('GET /tasks/{id} returns 404 when the task ID is missing', async ({
  request,
}) => {
  const response = await getTaskRequest(request, undefined);

  expect(response.status()).toBe(404);
});

test('GET /tasks/{id} returns 404 for an ID that does not exist', async ({
  request,
}) => {
  const response = await getTaskRequest(request, 'task-id-that-does-not-exist');

  expect(response.status()).toBe(404);
});