# Home assignment

This repostory contains the Playwright tests for the home assignment and the manual testing scenarios with but report.

- Task 1 - Manual testing - in TestCasesAndBugReport.docx
- Task 2 - frontend testing (Aldi US account login page tests.) - the test file is in featureTests folder, the setup steps are in this readme file under 'How did I set up the test suit' - the short description of what the tests are doing is in this readme under 'What is checked in the tests'
- Task 3 - API testing - endpoint validatons of task endpoints. (does not run against an existing API, only examle code.) - the test files are in EndpointValidation folder
- Answers to bonus questions - in TestCasesAndBugReport.docx

## Requirements

- Node.js 18 or newer (Node.js 20 or newer is recommended)
- npm

## Setup

### How did I set up the test suit

1. Created and entered a project folder.

   mkdir aldi-login-e2e
   cd aldi-login-e2e
   

2. Initialized an npm project:

   npm init -y

   This creates `package.json`, the project manifest where dependencies and commands are recorded.

3. Installed the test and TypeScript dependencies:

   npm install --save-dev @playwright/test@1.56.1 @types/node dotenv typescript

   npm adds the packages to `package.json` and creates `package-lock.json` to lock their resolved versions.

4. Added the project scripts to `package.json`:

   npm pkg set \
     "scripts.test:e2e=playwright test" \
     "scripts.test:e2e:headed=playwright test --headed" \
     "scripts.test:e2e:ui=playwright test --ui" \
     "scripts.test:e2e:list=playwright test --list" \
     "scripts.typecheck=tsc --noEmit"

   These commands provide normal, headed, UI, and discovery runs, plus TypeScript checking.

5. Download Playwright's Chromium browser:

   npx playwright install chromium

6. Create the source folders:

   mkdir -p pageObjects testData/login tests/featureTests \
     tests/EndpointValidation helpers/APIhelpers

7. Create the configuration and source files in VS Code. 
   The following files hold the configurations, environment variables, gitignore list and test implementations of tests, helpers, page objects, test data (create them):

   
   touch playwright.config.ts tsconfig.json .gitignore .env.example
   touch pageObjects/login.page.ts pageObjects/storefront.page.ts
   touch testData/login/invalidEmailAddresses.ts
   touch tests/featureTests/login.spec.ts
   touch helpers/APIhelpers/taskApiHelper.ts
   touch tests/EndpointValidation/PostTaskEndpointTests.spec.ts
   touch tests/EndpointValidation/GetTaskEndpintTests.spec.ts
   touch tests/EndpointValidation/PutTaskEndpointTests.spec.ts
   touch tests/EndpointValidation/DeleteTaskEndpointTests.spec.ts
   
   The configuration files and folders serve these purposes:

   - `playwright.config.ts` configures test discovery, the Aldi account base URL, browser settings, and reporting.
   - `tsconfig.json` enables strict TypeScript checking for configuration, page objects, test data, and tests.
   - `pageObjects/` keeps Aldi login and storefront selectors/actions separate from test scenarios.
   - `testData/login/` stores invalid email inputs and the email used for the password-mismatch scenario.
   - `tests/featureTests/` contains browser-based login and form-validation tests.
   - `helpers/APIhelpers/` contains task API URL, payload, authentication, and request helpers.
   - `tests/EndpointValidation/` contains separate POST, GET, PUT, and DELETE API specs.
   - `.gitignore` prevents local dependencies, reports, test results, and `.env` from being committed.
   - `.env.example` documents environment variables without containing real credentials.

8. Create and fill in the local environment file:

   cp .env.example .env
 
   Set an authorized Aldi test email, valid password, and deliberately invalid password in `.env`. Login tests submit credentials to Aldi production when those values are present. .env is not commited as contains credentials




### Set up when you cloned this repository

If you cloned this repository, install the dependencies and browser, then prepare `.env`:

npm install
npx playwright install chromium
cp .env.example .env

Edit `.env` with authorized test credentials as described above. `.env` is excluded from Git.

## Run the tests

List the tests without accessing Aldi:

npm run test:e2e:list


Run the suite:

npm run test:e2e


The valid-login and invalid-credential tests are skipped when their required environment values are missing. When configured, they submit real login attempts to Aldi production. The suite uses one worker and no retries to avoid repeated production submissions.

Optional interactive or headed runs:

npm run test:e2e:ui
npm run test:e2e:headed


## What is checked in the tests

- **Successful login:** opens login from the Aldi storefront, submits `ALDI_EMAIL` and `ALDI_PASSWORD`, then checks the storefront URL and visible Account Menu button.
- **Invalid password:** submits `ALDI_EMAIL` and `ALDI_INVALID_PASSWORD`, then checks that an error message is shown. Also checks if a password reset link and a registration link is present. 

- **Frontend side input field validations (empty e-mail field, empty password field, unvalid e-mail address formats)

The tests use accessible labels and button names. Login selectors and actions live in `pageObjects/login.page.ts`; storefront navigation and selectors live in `pageObjects/storefront.page.ts`.

## Task API Tests

`tests/EndpointValidation/` contains separate Playwright API specs for each task-management endpoint. The assumed task shape is `{ "id": string | number, "title": string, "description": string, "completed": boolean, "assignee": string, "status": string }`. Example payloads use `assignee: "test-user"` and `status: "pending"`; 

Set `TASKS_API_BASE_URL` and `TASKS_API_ACCESS_TOKEN` in `.env` for the API origin and valid bearer token. The examples assume `POST /tasks` returns `201` and the created task, `GET /tasks/{id}` returns `200` and the task, `PUT /tasks/{id}` returns `200` and the updated task, and `DELETE /tasks/{id}` returns `204` with no body. A follow-up GET after deletion is expected to return `404`.

Each endpoint spec also includes unauthorized and invalid-bearer-token checks, expected to return `401`. GET, PUT, and DELETE include missing-ID and unknown-ID cases, expected to return `404`. POST has no task ID in its route, so those ID-specific cases do not apply. 

The POST and PUT specs each loop through five invalid payloads: empty title, empty description, non-boolean `completed`, numeric assignee, and unsupported status. Their data providers expect `400` for empty title/description and `422` for invalid types/status, with a JSON `{ "code", "message" }` body using `VALIDATION_ERROR` and a field-specific message. These are assumptions to adjust to the real API contract.


