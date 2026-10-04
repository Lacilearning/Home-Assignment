import { expect, test } from '@playwright/test';
import {
  createTask,
  deleteTaskRequest,
  getTaskRequest,
} from '../../helpers/APIhelpers/taskApiHelper';

test('DELETE /tasks/{id} deletes a task and returns 204', async ({ request }) => {
  const createdTask = await createTask(request);
  const response = await deleteTaskRequest(request, createdTask.id);

  expect(response.status()).toBe(204);
  const getDeletedTaskResponse = await getTaskRequest(request, createdTask.id);
  expect(getDeletedTaskResponse.status()).toBe(404);
});

test('DELETE /tasks/{id} rejects an unauthorized request with 401', async ({
  request,
}) => {
  const response = await deleteTaskRequest(
    request,
    'existing-task-id',
    'unauthorized',
  );

  expect(response.status()).toBe(401);
});

test('DELETE /tasks/{id} rejects an invalid access token with 401', async ({
  request,
}) => {
  const response = await deleteTaskRequest(
    request,
    'existing-task-id',
    'invalid-token',
  );

  expect(response.status()).toBe(401);
});

test('DELETE /tasks/{id} returns 404 when the task ID is missing', async ({
  request,
}) => {
  const response = await deleteTaskRequest(request, undefined);

  expect(response.status()).toBe(404);
});

test('DELETE /tasks/{id} returns 404 for an ID that does not exist', async ({
  request,
}) => {
  const response = await deleteTaskRequest(request, 'task-id-that-does-not-exist');

  expect(response.status()).toBe(404);
});