# Contalink E2E Tests

End-to-end test automation project for the Contalink QA candidate application.

Application under test:

https://candidates-qa.contalink.com/

This project uses **Playwright** with **TypeScript** and follows a **Page Object Model** approach to keep tests readable, maintainable, and scalable.

---

## Tech Stack

- Playwright
- TypeScript
- Node.js
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
├── pages/
│   ├── LoginPage.ts
│   └── InvoicePage.ts
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

The current E2E suite covers the main user flows of the application.

### Authentication

- Successful login with a valid access code
- Logout flow

### Invoice Management

- Create a new invoice
- Search invoice by generated invoice number
- Edit an existing invoice
- Delete an existing invoice

---

## Key Automation Decisions

### Page Object Model

The project uses Page Object Model to separate test logic from UI interaction logic.

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

### No Hard Waits

The tests avoid fixed waits such as:

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

The suite runs with one worker:

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

---

## Running Tests

Run all tests:

```bash
npx playwright test
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

Run a specific test file:

```bash
npx playwright test tests/invoices.spec.ts
```

Run tests with Playwright UI mode:

```bash
npx playwright test --ui
```

---

## HTML Report

After running the tests, open the Playwright HTML report:

```bash
npx playwright show-report
```

The report includes test results, execution time, and failure artifacts when available.

---

## Type Checking

Run TypeScript validation without generating output:

```bash
npx tsc --noEmit
```

This helps detect TypeScript errors before execution.

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
- Run Playwright tests
- Upload the Playwright HTML report as an artifact

The pipeline fails with a non-zero exit code if any test fails.

---

## Test Data

Invoice data is generated dynamically in:

```text
test-data/invoice.data.ts
```

The access code is provided through environment variables and is not stored in test data files.

---

## Scenarios Implemented

### Login

```text
should login successfully
should logout successfully
```

### Invoices

```text
should create a new invoice
should edit an invoice
should delete an invoice
```

---

## Future Improvements

If more time were available, I would add:

- Negative login validation
- Required field validation for invoice creation
- Additional filter tests by status and date
- API setup/cleanup for faster and more isolated test data preparation
- Cross-browser execution after stabilizing test data isolation
- Session reuse with Playwright `storageState` if the suite grows and login becomes a bottleneck
- More granular reporting with Allure

---

## Notes

The suite is intentionally focused on the most valuable E2E flows for the product: authentication and invoice CRUD operations.

The tests are designed to be independent, use dynamic data, avoid hard waits, and interact with specific UI sections through scoped locators.

The project does not use fixtures or utility folders yet because the current suite is small. If the project grows, shared setup such as authenticated sessions or reusable data builders could be moved into fixtures or utilities.