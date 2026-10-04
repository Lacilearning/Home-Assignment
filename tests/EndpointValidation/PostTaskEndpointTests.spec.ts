import { expect, test } from '@playwright/test';
import {
  newTaskPayload,
  postTaskRequest,
  type Task,
  type TaskRequestPayload,
} from '../../helpers/APIhelpers/taskApiHelper';

type InvalidTaskPayloadCase = {
  name: string;
  payload: TaskRequestPayload;
  httpResponseCode: number;
  errorCode: string;
  errorMessage: string;
};

test('POST /tasks creates a task and returns 201 with the created task', async ({
  request,
}) => {
  const payload = newTaskPayload();
  const response = await postTaskRequest(request, payload);

  expect(response.status()).toBe(201);
  const task = (await response.json()) as Task;
  expect(task).toMatchObject(payload);
  expect(task.id).toBeTruthy();
});

test('POST /tasks rejects an unauthorized request with 401', async ({ request }) => {
  const response = await postTaskRequest(
    request,
    newTaskPayload(),
    'unauthorized',
  );

  expect(response.status()).toBe(401);
});

test('POST /tasks rejects an invalid access token with 401', async ({ request }) => {
  const response = await postTaskRequest(
    request,
    newTaskPayload(),
    'invalid-token',
  );

  expect(response.status()).toBe(401);
});

test('POST /tasks rejects each invalid task input with its expected status', async ({
  request,
}) => {
  for (const invalidCase of invalidTaskPayloadCasesDataprovider()) {
    const response = await postTaskRequest(request, invalidCase.payload);

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
  const validPayload = newTaskPayload(`Invalid POST cases ${Date.now()}`);
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