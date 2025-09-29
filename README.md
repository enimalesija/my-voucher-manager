# My Voucher Platform

This is a full-stack voucher campaign manager built for an assignment purpose with **Next.js (frontend)**, **Node.js + Fastify (backend, with TypeScript + Zod)**, and **React Query** for state management. The system allows you to:

* Create campaigns (name, date range, amount, currency, prefix).
* Generate voucher batches (stress-tested up to ~100k codes).
* Export vouchers as CSV (for import elsewhere).
* Delete campaigns (and their vouchers).
* Manage everything via a simple dashboard UI.

---

## Tech Stack

* **Frontend**: Next.js, React Query, CSS
* **Backend**: Node.js, Fastify, TypeScript, Zod (Validation)
* **Database**: In-memory (for assignment) / Railway Postgres (optional)
* **DevOps**: Docker

---

## Features

### Frontend (Next.js + React Query)

* Modern **Next.js 13+ (App Router)** setup
* Campaign management dashboard
* Voucher inspector with pagination + search
* CSV export for vouchers (download)
* React Query for all data fetching (campaigns, vouchers)
* Toast notifications and confirmation modals
* Dark/light theme toggle

### Backend (Node.js, Fastify + TypeScript + Zod)

* REST API endpoints:

  * `GET /campaigns`
  * `POST /campaigns`
  * `DELETE /campaigns/:id`
  * `POST /campaigns/:id/vouchers`
  * `GET /campaigns/:id/vouchers`
  * `GET /campaigns/:id/vouchers.csv`
* Uses in-memory / Railway-hosted database (configurable)
* Healthcheck endpoint at `/health`

### Dockerized

* `docker-compose.yml` runs both frontend + backend together
* Backend exposed at **port 4000**
* Frontend exposed at **port 3000**
* Healthcheck ensures frontend waits until backend is ready

---

## Getting Started (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/yourname/voucher-platform.git
cd voucher-platform
```

### 2. Install dependencies

Frontend:

```bash
cd frontend-next
npm install
```

Backend:

```bash
cd backend
npm install
```

### 3. Run locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend-next
npm run dev
```

Now open: [http://localhost:3000](http://localhost:3000)

---

## Running with Docker

Build and start services:

```bash
docker-compose up --build
```

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:4000](http://localhost:4000)

Stop containers:

```bash
docker-compose down
```

---

## React Query Integration

I migrated from a manual API wrapper to **React Query**:

* `useQuery` → fetch campaigns & vouchers
* `useMutation` → create/delete campaigns, generate vouchers
* Automatic cache invalidation with `queryClient.invalidateQueries`

This makes data always fresh, removes manual syncing, and simplifies the components a lot.

---

## Live Deployment

For convenience, I also deployed the services:

* **Frontend** → [Vercel](https://my-voucher-platform.vercel.app/) (auto-builds from `frontend-next/`)
* **Backend** → [Railway](https://railway.app) (Fastify API on Node)

So the project can be tested live without cloning or running Docker.

---

## Tests

Backend:

```bash
cd backend
npm run test
```

Frontend:

```bash
cd frontend-next
npm run test
```

Covers:

* API happy-path tests (backend)
* Component tests (frontend)
* Stress test for 100k vouchers (runs in ~5s locally)

---

## Things I’d improve with more time

* Storage is **in-memory only** --> data survives only until backend restarts (like a Railway redeploy).
* Would switch to Postgres or Mongo for persistence.
* Add authentication + roles (currently anyone can create/delete).

---

## Credits

Developed by **A. Malesija** for **An Assignment**
