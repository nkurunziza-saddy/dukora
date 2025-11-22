# Codebase Review

## Executive Summary

The application is a modern Next.js 15 web application using Server Actions, Drizzle ORM, and React Server Components. It follows a generally clean architecture with a separation of concerns between Actions, Business Logic, and Repositories. However, there are some deviations where business logic leaks into repositories, and some UI components contain hardcoded strings. The use of `better-auth` for authentication and `tanstack-query` for client-side data fetching is a strong choice.

## Architecture & Patterns

- **Server Actions**: The project heavily relies on Server Actions for data mutation and fetching, which is the recommended pattern for Next.js App Router.
- **Action Factory**: The `createProtectedAction` helper in `src/server/helpers/action-factory.ts` is an excellent pattern. It standardizes permission checks, error handling, and user session retrieval, reducing boilerplate and ensuring consistency.
- **Repository Pattern**: The project uses a repository pattern (`src/server/repos`), which abstracts database queries. However, the implementation in `transaction-mutation-repo.ts` mixes business logic (tax calculation, notifications) with data access. This violates the Single Responsibility Principle.
- **Business Logic**: There is a dedicated `business-logic` directory, which is good. Validation logic is separated here, but some core business rules (like tax application) are scattered in repositories.

## Security & Data Access

- **Authentication**: `better-auth` is used with a Drizzle adapter. The configuration in `src/lib/auth.ts` looks standard and secure, with social providers configured.
- **Authorization**: Role-based access control (RBAC) is implemented via `Permission` enums and checked within the `createProtectedAction` wrapper. This ensures that every protected action has an explicit permission check.
- **Input Validation**: Zod is used for input validation in both Server Actions and Client Forms (`create-product-form.tsx`). This provides end-to-end type safety and validation.
- **Data Isolation**: Most queries seem to filter by `businessId`, ensuring multi-tenancy isolation. This is critical and appears to be consistently applied in the reviewed files.

## Performance & Scalability

- **Dashboard Data Fetching**: In `src/app/[locale]/(protected)/dashboard/page.tsx`, multiple server actions are called in parallel using `Promise.all`. This is good for performance. However, fetching `getOverviewProducts(6)`, `getSchedulesOverview(6)`, etc., sequentially after the `Promise.all` block introduces a waterfall. These should also be parallelized or moved into the initial `Promise.all` if possible.
- **Database Queries**: Drizzle ORM is efficient, but care must be taken with N+1 queries. The `transaction-mutation-repo.ts` performs multiple queries within a transaction (fetching product, settings, inserting transaction, updating stock, inserting audit log, creating notification). While necessary for atomicity, this is a heavy operation.

## Code Quality & Maintainability

- **Type Safety**: The codebase uses TypeScript extensively with strict typing. Shared schema types from Drizzle are used across the stack.
- **Internationalization**: `next-intl` is used for translations. However, `create-product-form.tsx` has a TODO comment `// TODO: No translation for dialog title/trigger/description`, indicating incomplete i18n coverage.
- **Hardcoded Values**: Some UI components have hardcoded strings or logic that should be dynamic (e.g., currency formatting in `sale-transaction-form.tsx` was just fixed, but others might exist).
- **Linting**: There are some `any` types and unused imports that should be cleaned up.

## Specific Module Reviews

### `src/server/repos/transaction-repo/transaction-mutation-repo.ts`

- **Issue**: This file handles tax calculation, notification creation, and audit logging directly.
- **Recommendation**: Move the orchestration of these steps to a "Service" or "Business Logic" layer. The repository should only be responsible for the atomic database transaction. The tax calculation logic should be injected or called before passing data to the repo, or the repo should call a pure business logic function.

### `src/app/[locale]/(protected)/dashboard/page.tsx`

- **Issue**: Potential request waterfall.
- **Recommendation**: Group all independent data fetching calls into a single `Promise.all` to minimize server response time.

### `src/components/forms/create-product-form.tsx`

- **Issue**: Incomplete translations.
- **Recommendation**: Extract hardcoded strings to the locale files.

## Recommendations

1.  **Refactor Repositories**: Strip business logic (like sending notifications or calculating taxes) out of repositories. Create a Service layer or use the Server Actions as the orchestrator that calls:
    1.  Validation (Business Logic)
    2.  Tax Calculation (Business Logic)
    3.  DB Transaction (Repository)
    4.  Notification (Service/Action)
2.  **Optimize Dashboard**: Parallelize all data fetching in `dashboard/page.tsx`.
3.  **Complete I18n**: Audit components for hardcoded strings and move them to translation files.
4.  **Standardize Error Handling**: Ensure all server actions return a consistent `ServiceResponse` structure (which they seem to do) and that the UI handles these errors gracefully (using `toast` or error boundaries).
