# Contalink QA Automation Tests

QA automation project for the Contalink candidate application.

Application under test:

https://candidates-qa.contalink.com/

API under test:

https://candidates-api.contalink.com/

This project includes:

- E2E tests with **Playwright + TypeScript**
- API tests with **Postman + Newman**
- Optional smoke performance test with **k6**
- Page Object Model
- Dynamic test data
- GitHub Actions CI pipeline

---

## Tech Stack

- Playwright
- TypeScript
- Node.js
- Postman
- Newman
- k6
- Page Object Model
- Playwright HTML Report
- GitHub Actions

---

## Project Structure

```text
contalink-e2e-tests/
│
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── api/
│   ├── contalink-api.postman_collection.json
│   └── contalink-api.postman_environment.json
│
├── pages/
│   ├── LoginPage.ts
│   └── InvoicePage.ts
│
├── performance/
│   └── invoices.k6.js
│
├── test-data/
│   └── invoice.data.ts
│
├── tests/
│   ├── login.spec.ts
│   └── invoices.spec.ts
│
├── .env.example
├── .gitignore
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Test Coverage

The current automation suite covers the main user flows of the application through E2E tests, validates the invoice API through Postman/Newman tests, and includes an optional k6 smoke performance test.

---

## E2E Test Coverage

### Authentication

- Successful login with a valid access code
- Logout flow

### Invoice Management

- Create a new invoice
- Search invoice by generated invoice number
- Edit an existing invoice
- Delete an existing invoice

---

## API Test Coverage

API tests are located in:

```text
api/
├── contalink-api.postman_collection.json
└── contalink-api.postman_environment.json
```

The API suite covers the following endpoints and scenarios:

| Scenario | Method | Endpoint | Expected Result |
|---|---:|---|---|
| Create invoice | POST | `/V1/invoices` | `201 Created` |
| Get invoice by ID | GET | `/V1/invoices/:id` | `200 OK` |
| Update invoice | PUT | `/V1/invoices/:id` | `200 OK` |
| Partial update invoice | PATCH | `/V1/invoices/:id` | `200 OK` |
| Delete invoice | DELETE | `/V1/invoices/:id` | `200` or `204` |
| Get deleted invoice | GET | `/V1/invoices/:id` | `404 Not Found` |
| List invoices | GET | `/V1/invoices` | `200 OK`, empty or non-empty list |
| Invalid invoice total | POST | `/V1/invoices` | `400` or `422` |
| Missing authorization | GET | `/V1/invoices` | `401 Unauthorized` |

The collection creates a dynamic invoice first and stores its `invoiceId` and `invoiceNumber` as environment variables. These values are reused by the GET, PUT, PATCH, DELETE, and deleted-invoice validation requests.

---

## Optional Performance Test

A basic k6 smoke performance test is included in:

```text
performance/invoices.k6.js
```

The test targets the read-only endpoint:

```text
GET /V1/invoices
```

Load profile:

```text
20 requests per second for 30 seconds
```

Thresholds:

```text
http_req_failed < 1%
p95 response time < 1000 ms
```

This test is intentionally focused on a read-only endpoint to avoid creating, updating, or deleting data in the shared QA environment.

The performance test is not part of the main CI pipeline because performance results can be affected by network conditions, shared environment load, and external factors. It is provided as an optional manual smoke performance check.

---

## Key Automation Decisions

### Page Object Model

The E2E tests use Page Object Model to separate test logic from UI interaction logic.

Example:

- `LoginPage.ts` contains login-related actions.
- `InvoicePage.ts` contains invoice-related actions such as create, search, edit, and delete.

This keeps test files focused on business flows instead of selectors and implementation details.

---

### Scoped Locators

The application contains repeated fields such as:

- `Número de Factura`
- `Estado`

These fields exist in different sections of the page, such as the invoice form and the search filters.

To avoid ambiguous locators and Playwright strict mode violations, locators are scoped to parent containers:

```ts
this.invoiceForm = page.locator('app-invoice-form');
this.invoiceFilters = page.locator('app-filter-form');
this.invoicesTable = page.locator('.table.table-zebra');
```

Then child elements are located inside the correct parent:

```ts
this.invoiceNumberInput = this.invoiceForm.locator('#invoiceNumber');
this.invoiceNumberFilterInput = this.invoiceFilters.locator('#invoiceName');
```

This approach makes the tests more stable and prevents interacting with the wrong element.

---

### Dynamic Test Data

Invoices are created with dynamic invoice numbers to avoid collisions between test executions.

Example format:

```text
FAC-DVD-<timestamp>-<random-id>
```

This makes each test independent and avoids relying on existing data in the environment.

---

### Row-Level Actions

For edit and delete flows, the test first locates the table row that contains the generated invoice number and then clicks the action button inside that specific row.

This prevents editing or deleting the wrong invoice.

Example concept:

```ts
this.invoicesTable.locator('tbody tr').filter({
  hasText: invoiceNumber,
});
```

---

### API Test Data

The Postman collection also uses dynamic invoice numbers:

```text
API-DVD-{{$timestamp}}
```

This prevents invoice number collisions between API test executions.

The first request creates an invoice and stores response data into Postman environment variables:

```js
pm.environment.set("invoiceId", json.id);
pm.environment.set("invoiceNumber", json.invoiceNumber);
```

Those variables are reused by the following requests:

```text
GET /V1/invoices/{{invoiceId}}
PUT /V1/invoices/{{invoiceId}}
PATCH /V1/invoices/{{invoiceId}}
DELETE /V1/invoices/{{invoiceId}}
```

---

### No Hard Waits

The E2E tests avoid fixed waits such as:

```ts
page.waitForTimeout(3000);
```

Instead, they wait for real UI conditions using Playwright assertions:

```ts
await expect(locator).toBeVisible();
await expect(locator).not.toBeVisible();
```

This improves reliability and reduces flaky behavior.

---

### Environment Variables

The access code is not committed to the repository.

Local execution uses a `.env` file, based on `.env.example`.

Example:

```env
ACCESS_CODE=your_access_code_here
```

For CI execution, the access code is configured as a GitHub Actions secret named:

```text
ACCESS_CODE
```

This avoids exposing credentials in the repository.

---

## Playwright Configuration

The project is configured to run in Chromium.

```ts
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
]
```

The E2E suite runs with one worker:

```ts
workers: 1
```

This was intentional because the tests create, edit, and delete data in a shared QA environment. Running with one worker helps avoid race conditions and false negatives caused by concurrent data changes.

The configuration also includes debugging artifacts:

```ts
trace: 'on-first-retry',
screenshot: 'only-on-failure',
video: 'retain-on-failure',
```

These artifacts help investigate failures when a test does not pass.

---

## Installation

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Create a local `.env` file using `.env.example` as reference:

```bash
cp .env.example .env
```

Then add the access code value:

```env
ACCESS_CODE=your_access_code_here
```

To run the optional performance test locally, install k6 first:

```bash
brew install k6
```

Validate the installation:

```bash
k6 version
```

---

## Running Tests

### TypeScript Check

Run TypeScript validation without generating output:

```bash
npm run typecheck
```

or:

```bash
npx tsc --noEmit
```

---

### Run E2E Tests

Run all Playwright E2E tests:

```bash
npm run test:e2e
```

Or directly:

```bash
npx playwright test
```

Run E2E tests in headed mode:

```bash
npx playwright test --headed
```

Run a specific E2E test file:

```bash
npx playwright test tests/invoices.spec.ts
```

Run tests with Playwright UI mode:

```bash
npx playwright test --ui
```

---

### Run API Tests

Run API tests with Newman:

```bash
ACCESS_CODE='your_access_code_here' npm run test:api
```

The API tests use:

```text
api/contalink-api.postman_collection.json
api/contalink-api.postman_environment.json
```

The access code is passed as an environment variable and is not stored in the exported Postman environment file.

---

### Run Optional Performance Test

Run the k6 smoke performance test:

```bash
ACCESS_CODE='your_access_code_here' npm run test:performance
```

The test executes:

```text
GET /V1/invoices
```

with:

```text
20 requests per second for 30 seconds
```

This performance test is optional and is not included in the main CI pipeline.

---

### Run All Functional Tests

Run E2E and API tests:

```bash
ACCESS_CODE='your_access_code_here' npm test
```

This command does not run the optional performance test.

---

## HTML Report

After running the Playwright tests, open the Playwright HTML report:

```bash
npx playwright show-report
```

The report includes test results, execution time, and failure artifacts when available.

---

## Newman API Test Output

When running API tests with Newman, the output includes:

- Total requests executed
- Total assertions executed
- Failed assertions, if any
- Average response time
- Status code validation per request

The API suite currently includes 9 requests and validates both happy path and edge cases.

---

## k6 Performance Test Output

When running the optional k6 test, the output includes:

- Total HTTP requests
- Request rate
- Failed request rate
- Response time metrics
- p95 response time
- Threshold results

The current smoke performance thresholds are:

```text
http_req_failed rate < 1%
http_req_duration p95 < 1000 ms
```

---

## CI/CD

The project includes a GitHub Actions workflow located at:

```text
.github/workflows/playwright.yml
```

The workflow runs automatically on push and pull requests to `main` or `master`.

It performs the following steps:

- Checkout repository
- Install Node.js
- Install dependencies
- Install Playwright browsers
- Run TypeScript validation
- Run Playwright E2E tests
- Run Postman API tests with Newman
- Upload the Playwright HTML report as an artifact

The pipeline fails with a non-zero exit code if any E2E or API test fails.

The access code is injected in CI through a GitHub Actions secret:

```text
ACCESS_CODE
```

The optional k6 performance test is not included in the automatic CI pipeline to avoid false negatives caused by environment load, network variability, or external conditions.

---

## Test Data

E2E invoice data is generated dynamically in:

```text
test-data/invoice.data.ts
```

API invoice data is generated dynamically in the Postman collection using:

```text
{{$timestamp}}
```

Performance tests use the existing list endpoint and do not create or modify data.

The access code is provided through environment variables and is not stored in test data files or exported Postman files.

---

## Scenarios Implemented

### E2E - Login

```text
should login successfully
should logout successfully
```

### E2E - Invoices

```text
should create a new invoice
should edit an invoice
should delete an invoice
```

### API - Invoices

```text
01 - POST invoice - 201
02 - GET invoice by id - 200
03 - PUT invoice - 200
04 - PATCH invoice - 200
05 - DELETE invoice - 200 or 204
06 - GET deleted invoice - 404
07 - GET invoices - 200
08 - POST invoice invalid total - 400 or 422
09 - GET invoices without authorization - 401
```

### Performance - Invoices

```text
GET /V1/invoices
20 requests per second for 30 seconds
```

---

## Future Improvements

If more time were available, I would add:

- Negative login validation
- Required field validation for invoice creation
- Additional UI filter tests by status and date
- API setup/cleanup strategy for more isolated test data preparation
- Cross-browser execution after stabilizing test data isolation
- Session reuse with Playwright `storageState` if the E2E suite grows and login becomes a bottleneck
- More granular reporting with Allure
- Newman HTML report generation for API tests
- Expand performance coverage with additional k6 scenarios and environment-specific thresholds

---

## Notes

The suite is intentionally focused on the most valuable flows for the product:

- Authentication
- Invoice CRUD through UI
- Invoice CRUD and validation through API
- Basic smoke performance validation for a read-only API endpoint
- CI execution through GitHub Actions

The tests are designed to be independent, use dynamic data, avoid hard waits, and interact with specific UI sections through scoped locators.

The project does not use fixtures or utility folders yet because the current suite is small. If the project grows, shared setup such as authenticated sessions or reusable data builders could be moved into fixtures or utilities.

A basic k6 smoke performance test is included as an optional check. It is intentionally kept outside the mandatory CI pipeline to avoid false negatives caused by shared environment or network variability.