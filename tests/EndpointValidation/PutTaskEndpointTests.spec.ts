import { expect, test } from '@playwright/test';
import {
  createTask,
  newTaskPayload,
  putTaskRequest,
  type TaskPayload,
  type TaskRequestPayload,
} from '../../helpers/APIhelpers/taskApiHelper';

type InvalidTaskPayloadCase = {
  name: string;
  payload: TaskRequestPayload;
  httpResponseCode: number;
  errorCode: string;
  errorMessage: string;
};

test('PUT /tasks/{id} updates a task and returns 200 with the updated task', async ({
  request,
}) => {
  const createdTask = await createTask(request);
  const updatedPayload: TaskPayload = {
    title: 'Updated Playwright task',
    description: 'Updated by the Playwright task endpoint tests.',
    completed: true,
    assignee: 'updated-test-user',
    status: 'in-progress',
  };
  const response = await putTaskRequest(request, createdTask.id, updatedPayload);

  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    id: createdTask.id,
    ...updatedPayload,
  });
});

test('PUT /tasks/{id} rejects an unauthorized request with 401', async ({
  request,
}) => {
  const response = await putTaskRequest(
    request,
    'existing-task-id',
    newTaskPayload(),
    'unauthorized',
  );

  expect(response.status()).toBe(401);
});

test('PUT /tasks/{id} rejects an invalid access token with 401', async ({
  request,
}) => {
  const response = await putTaskRequest(
    request,
    'existing-task-id',
    newTaskPayload(),
    'invalid-token',
  );

  expect(response.status()).toBe(401);
});

test('PUT /tasks/{id} returns 404 when the task ID is missing', async ({
  request,
}) => {
  const response = await putTaskRequest(
    request,
    undefined,
    newTaskPayload(),
  );

  expect(response.status()).toBe(404);
});

test('PUT /tasks/{id} returns 404 for an ID that does not exist', async ({
  request,
}) => {
  const response = await putTaskRequest(
    request,
    'task-id-that-does-not-exist',
    newTaskPayload(),
  );

  expect(response.status()).toBe(404);
});

test('PUT /tasks/{id} rejects each invalid task input with its expected status', async ({
  request,
}) => {
  const task = await createTask(request);

  for (const invalidCase of invalidTaskPayloadCasesDataprovider()) {
    const response = await putTaskRequest(
      request,
      task.id,
      invalidCase.payload,
    );

    expect(response.status(), invalidCase.name).toBe(invalidCase.httpResponseCode);
    const errorResponse = (await response.json()) as {
      code: string;
      message: string;
    };
    expect(errorResponse.code, invalidCase.name).toBe(invalidCase.errorCode);
    expect(errorResponse.message, invalidCase.name).toBe(invalidCase.errorMessage);
  }
});

function invalidTaskPayloadCasesDataprovider(): InvalidTaskPayloadCase[] {
  const validPayload = newTaskPayload(`Invalid PUT cases ${Date.now()}`);
  const errorCode = 'VALIDATION_ERROR';

  return [
    {
      name: 'empty title',
      payload: { ...validPayload, title: '' },
      httpResponseCode: 400,
      errorCode,
      errorMessage: 'Title is required.',
    },
    {
      name: 'empty description',
      payload: { ...validPayload, description: '' },
      httpResponseCode: 400,
      errorCode,
      errorMessage: 'Description is required.',
    },
    {
      name: 'completed is not a boolean',
      payload: { ...validPayload, completed: 'not-a-boolean' },
      httpResponseCode: 422,
      errorCode,
      errorMessage: 'Completed must be a boolean.',
    },
    {
      name: 'assignee is a number',
      payload: { ...validPayload, assignee: 12345 },
      httpResponseCode: 422,
      errorCode,
      errorMessage: 'Assignee must be a string.',
    },
    {
      name: 'unsupported status',
      payload: { ...validPayload, status: 'not-a-valid-status' },
      httpResponseCode: 422,
      errorCode,
      errorMessage: 'Status is invalid.',
    },
  ];
}