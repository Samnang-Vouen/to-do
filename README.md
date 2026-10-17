# To-Do App

A task manager with a **NestJS + PostgreSQL** backend and a **React + Vite** frontend.

```
To-Do/
├── backend/    NestJS REST API (TypeORM, PostgreSQL)
└── frontend/   React app (Vite)
```

## Requirements

- [Node.js](https://nodejs.org/) 20 or newer
- [Docker](https://www.docker.com/) to run PostgreSQL (or a local PostgreSQL 16 install)

## 1. Start the database

Run PostgreSQL in Docker:

```bash
docker run -d --name todo-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=todo \
  -p 5432:5432 \
  postgres:16
```

After the first time, start it again with `docker start todo-db`.

The backend expects these connection settings (see `backend/src/app.module.ts` and `backend/src/data-source.ts`):

| Setting  | Value       |
|----------|-------------|
| Host     | `localhost` |
| Port     | `5432`      |
| User     | `postgres`  |
| Password | `postgres`  |
| Database | `todo`      |

## 2. Run the backend

```bash
cd backend
npm install
```

Create the tables. `synchronize` is off, so the schema comes from the migrations in `src/migrations/`:

```bash
npx typeorm-ts-node-esm migration:run -d src/data-source.ts
```

Start the API in watch mode:

```bash
npm run start:dev
```

The API runs at **http://localhost:3000**.

### API endpoints

| Method | URL           | Body                                          |
|--------|---------------|-----------------------------------------------|
| GET    | `/todos`      | none                                          |
| GET    | `/todos/:id`  | none                                          |
| POST   | `/todos`      | `{ "title": "Buy milk", "category": "Personal", "priority": "high", "dueDate": "2026-10-20" }` |
| PATCH  | `/todos/:id`  | any fields to change, e.g. `{ "status": "done" }` |
| DELETE | `/todos/:id`  | none                                          |

Only `title` is required when creating a todo. Allowed values:

- `category`: `Work`, `Personal`, `Study`, `Health`, `Other`
- `priority`: `low`, `medium`, `high`
- `status`: `todo`, `in-progress`, `done`
- `dueDate`: `YYYY-MM-DD` or `null`

The `/users` endpoints are still in progress.

## 3. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

The frontend calls the backend at `http://localhost:3000` (set in `frontend/src/Api.js`). The backend allows requests only from `http://localhost:5173` (CORS, set in `backend/src/main.ts`). If you change either port, update both files.
