# Quantura

Quantura is a modern, extensible, and minimal inventory management web application built with Next.js (App Router). The project is designed for scalability, maintainability, and developer productivity, leveraging a modular architecture and best practices from the Next.js and TypeScript ecosystems.

## Project Context & Development Philosophy

Quantura aims to provide a robust platform for managing products, warehouses, transactions, analytics, and user permissions, with a focus on:

- **Type safety** and **predictable data flow** using TypeScript and Drizzle ORM.
- **Separation of concerns** between data access, business logic, and presentation.
- **Internationalization** for global usability.
- **Modern UI/UX** using shadcn/ui and Tailwind CSS.
- **Server-first** approach: most logic is handled in server components or server actions, with client components used only when necessary (e.g., for interactivity or forms).
- **Authentication** and **authorization** are handled securely and flexibly.

## Key Architectural Patterns

- **Database Layer**:
  - Located in [`@/src/lib/schema`](src/lib/schema) with models in [`@/src/lib/schema/models`](src/lib/schema/models).
  - Uses Drizzle ORM for type-safe, composable queries and migrations.
- **Internationalization**:
  - Managed in [`@/src/lib/i18n`](src/lib/i18n) using `next-intl` for multi-language support.
- **Server Logic**:
  - All backend logic is in [`@/src/server`](src/server).
  - **Repos** (`@/src/server/repos`):
    - Directly interact with the database.
    - Each repo (e.g., [`supplier-repos.ts`](src/server/repos/supplier-repos.ts)) encapsulates all queries and mutations for a domain.
    - Follows a consistent structure: input validation, query building, error handling, and returning typed results.
  - **Actions** (`@/src/server/actions`):
    - Callable functions that orchestrate business logic, often combining multiple repo calls.
    - Used by API routes and server components.
    - Example: [`supplier-actions.ts`](src/server/actions/supplier-actions.ts).
- **API Layer**:
  - API routes call server actions, providing a thin HTTP interface for client-side data fetching.
  - SWR is used for client-side data fetching and caching.
- **UI Components**:
  - All UI is in [`@/src/components`](src/components).
  - Reusable primitives and layouts are in [`@/src/components/ui`](src/components/ui), based on shadcn/ui.
  - Feature-specific components (tables, navigation, forms, etc.) are organized by domain.
- **Authentication**:
  - Uses `better-auth` for secure authentication.
  - Authorization is enforced in server actions and components.

## Development Workflow

- **Server-first**:
  - Prefer server components and server actions for data fetching and logic.
  - Use client components only for interactive UI (forms, modals, etc.).
- **Extensibility**:
  - Add new features by creating new repos and actions following the established patterns.
  - UI components should be composable and reusable.
- **Testing & Validation**:
  - Use Zod for schema validation.
  - Ensure all data passed between layers is type-safe.
- **Internationalization**:
  - All user-facing strings should be translatable via `next-intl`.

## Example: Adding a New Domain

1. **Define the database schema** in [`@/src/lib/schema/models`](src/lib/schema/models).
2. **Create a repo** in [`@/src/server/repos`](src/server/repos) for all DB operations.
3. **Add server actions** in [`@/src/server/actions`](src/server/actions) to encapsulate business logic.
4. **Expose API routes** if client fetching is needed.
5. **Build UI components** in [`@/src/components`](src/components) and connect them to server actions.
6. **Add translations** in [`@/src/lib/i18n`](src/lib/i18n).

## Internationalization and No Hardcoded UI Strings

- **No hardcoded values for frontend UI:**  
  All user-facing strings in the frontend **must** use translation keys from the message files in `@/src/i18n/messages` (such as `en.json`, `fr.json`, etc.).
- **If a string is missing:**  
  If you need a UI string that does not exist in the messages, **add a new key** to all relevant message files (at least `en.json`) in a consistent, descriptive format.
- **How to use:**  
  Always use the translation hook or component (e.g. `useTranslations()` from `next-intl`) to fetch and display UI text.
- **Benefits:**  
  This ensures full internationalization support, easier localization, and a consistent user experience.

---

## Primary Features

- Authentication & onboarding flows
- Product, warehouse, and category management
- Inventory tracking and analytics
- User roles and permissions
- Supplier management
- Scheduling and audit logs

---

Study the structure of files like [`@/src/server/repos/supplier-repos.ts`](src/server/repos/supplier-repos.ts) and [`@/src/server/actions/supplier-actions.ts`](src/server/actions/supplier-actions.ts) and more to understand the expected patterns for new features.

If you have questions about architecture or best practices, refer to this document or reach out to the maintainers.
