# To-Do App

A task manager with a **NestJS + PostgreSQL** backend and a **React + Vite** frontend.

```
To-Do/
├── backend/    NestJS REST API (TypeORM, PostgreSQL, JWT auth)
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

## 2. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `backend/.env`:

| Variable             | Example                 | Notes                                  |
|----------------------|-------------------------|----------------------------------------|
| `PORT`               | `3000`                  | API port                               |
| `DATABASE_HOST`      | `localhost`             |                                        |
| `DATABASE_PORT`      | `5432`                  |                                        |
| `DATABASE_USER`      | `postgres`              |                                        |
| `DATABASE_PASSWORD`  | `postgres`              |                                        |
| `DATABASE_NAME`      | `todo`                  |                                        |
| `JWT_ACCESS_SECRET`  | *(random string)*       | Required. Signs access tokens          |
| `JWT_ACCESS_TTL`     | `900`                   | Access token lifetime in seconds (15 min) |
| `JWT_REFRESH_SECRET` | *(random string)*       | Required. Must differ from the access secret |
| `JWT_REFRESH_TTL`    | `604800`                | Refresh token lifetime in seconds (7 days) |
| `FRONTEND_URL`       | `http://localhost:5173` | Allowed CORS origin                    |

Generate each JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`.env` is gitignored. Never commit it.

## 3. Run the backend

Create the tables. `synchronize` is off, so the schema comes from the migrations in `src/migrations/`:

```bash
npm run typeorm -- migration:run
```

Start the API in watch mode:

```bash
npm run start:dev
```

The API runs at **http://localhost:3000**.

### Authentication

Every route requires a signed-in user except `register`, `login`, `refresh` and `logout`. Tokens are sent as **httpOnly cookies**, so clients never handle them directly:

- `access_token`: short-lived (15 min), sent with every request.
- `refresh_token`: long-lived (7 days), sent only to `/auth/*`. It rotates on every refresh. If an old refresh token is used again, all of that user's sessions are signed out.

| Method | URL              | Body                                              | Result |
|--------|------------------|---------------------------------------------------|--------|
| POST   | `/auth/register` | `{ "name": "Ada", "email": "ada@example.com", "password": "secret123" }` | 204, sets cookies |
| POST   | `/auth/login`    | `{ "email": "ada@example.com", "password": "secret123" }` | 204, sets cookies |
| POST   | `/auth/refresh`  | none (uses the refresh cookie)                    | 204, new cookies |
| POST   | `/auth/logout`   | none                                              | 204, clears cookies |
| GET    | `/auth/me`       | none                                              | the signed-in user |

`register` and `login` are rate-limited to 5 requests per minute per IP. Passwords are hashed with argon2 and never returned by the API.

Postman keeps cookies between requests, so call `register` or `login` first and the other requests will be authenticated.

### Todo endpoints

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

Todos are not yet scoped per user: any signed-in user can see all todos. Role-based authorization (`admin` / `operator`) is planned.

The `/users` CRUD endpoints (`GET`, `POST`, `PATCH`, `DELETE` on `/users` and `/users/:id`) also require sign-in.

## 4. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

The frontend calls the backend from `frontend/src/Api.js`. The backend only accepts requests from `FRONTEND_URL` (CORS). If you change either port, update both.

> **Note:** the frontend has no login page yet, so its requests get `401 Unauthorized`. To work with authentication it needs a login screen, and every `fetch` must pass `credentials: 'include'` so the browser sends the cookies.
