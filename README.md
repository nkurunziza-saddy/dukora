# Quantura - Modern Inventory Management

<!-- ![Quantura Banner](https://user-images.githubusercontent.com/12422491/226891931-90a4ea5a-1889-42c9-91d3-a75654a2a241.png) -->

Quantura is a modern, open-source inventory and business management system designed to provide a comprehensive, real-time overview of your operations. Built with a powerful and scalable tech stack, it offers everything from product and warehouse management to detailed financial analytics and role-based user permissions.

## ✨ Core Features

- **Real-time Dashboard**: Get an instant overview of key metrics like sales, expenses, and inventory value.
- **Inventory Management**: Track products, stock levels, and transfers across multiple warehouses.
- **Financial Tracking**: Record all business transactions, including sales, purchases, and operational expenses.
- **Supplier & User Management**: Manage supplier relationships and control user access with a granular, role-based permission system.
- **Powerful Analytics**: Automatically calculate key financial metrics (COGS, Gross Profit, Margins, etc.) on a monthly basis.
- **Auditing**: Every critical action is logged, providing a complete and immutable history of changes.
- **Multi-language Support**: Internationalized UI to support multiple languages (i18n).
- **Scheduling**: Built-in calendar for scheduling tasks and events.
- **Ai Assistant**: Tuned AI Assitant for your business.
- ...

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: PostgreSQL
- **Authentication**: [Better-auth](https://www.better-auth.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

Follow these steps to get a local instance of Quantura up and running.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.17 or later)
- [bun](https://bun.com/) (or your preferred package manager)
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Clone the Repository

```bash
git clone https://github.com/nkurunziza-saddy/quantura.git
cd quantura
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your database credentials and other required values.

```bash
cp .env.example .env
```

Your `.env` file should look like this:

```
DATABASE_URL="postgresql://user:password@host:port/database"
AUTH_SECRET="your-super-secret-auth-secret"
```

### 4. Run Database Migrations

Drizzle Kit is used to manage database schema migrations. Run the following command to apply the existing migrations to your database.

```bash
bunx drizzle-kit push
```

### 5. Run the Development Server

```bash
bun dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

The `src` directory is organized into the following key areas:

- **/app**: Contains all the routes and pages, following the Next.js App Router structure.
- **/components**: Shared React components, with a `ui` subdirectory for the shadcn/ui components.
- **/lib**: Core utilities, including database connection (`db.ts`), authentication (`auth.ts`), and schema definitions.
- **/server**: All server-side logic, clearly separated into:
  - **actions**: Server Actions that handle business logic and are callable from the client.
  - **repos**: The data access layer, responsible for all database queries.
  - **helpers**: Pure, stateless helper functions for tasks like calculations and data transformation.
  - **constants**: Centralized location for constants like permissions and error codes.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
