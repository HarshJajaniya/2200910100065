# URL HTTP Shortener

A simple, fast URL shortener service that converts long URLs into short, shareable links and redirects users to the original URL. This README is intentionally generic and ready-to-drop-into most implementations (Node/Express, Python/Flask, Go, etc.). It includes installation, usage, API examples, deployment tips, and testing instructions.

> **Note:** I didn't inspect your repository (the provided `.git` endpoint couldn't be accessed). This README assumes a typical web service architecture. Replace or adapt the examples (commands, filenames, env vars) to match your actual code.

---

# Table of contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack (Suggested)](#tech-stack-suggested)
4. [Quick Start (Node.js example)](#quick-start-nodejs-example)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)
7. [Data Model](#data-model)
8. [Usage Examples (curl)](#usage-examples-curl)
9. [Docker (optional)](#docker-optional)
10. [Running Tests](#running-tests)
11. [Deployment](#deployment)
12. [Project Structure (suggested)](#project-structure-suggested)
13. [Contributing](#contributing)
14. [License](#license)
15. [Author / Contact](#author--contact)

---

# Project overview

A lightweight HTTP URL shortener:

* Accepts a long URL and returns a short path (e.g. `https://sho.rt/Ab3xK`).
* Redirects short URLs (HTTP 302) to the original long URL.
* Tracks basic analytics (click count, created at).
* Optionally supports custom aliases, expiration, and simple rate-limiting.

Use cases: internal link shortener, study project, class assignment, demo for HTTP services.

---

# Features

* Shorten long URLs (auto-generated token).
* Optional custom alias for a short link.
* Redirect `/:token` to original URL.
* Click tracking (count, last clicked timestamp).
* Link expiration (optional).
* Simple input validation (ensure valid URL).
* Minimal admin or management endpoints (list links, delete).

---

# Tech stack (suggested)

Pick one — adapt to your repo:

* **Backend**: Node.js (Express) | Python (Flask / FastAPI) | Go (net/http)
* **Database**: MongoDB (recommended for quick prototyping) | PostgreSQL | Redis (if you need in-memory)
* **Optional**: Docker for containerization, Nginx for reverse proxy, GitHub Actions for CI

The examples in this README show commands for a Node.js + Express + MongoDB setup. If your repo uses another stack, translate the steps accordingly.

---

# Quick start (Node.js example)

1. Clone repository

```bash
git clone https://github.com/HarshJajaniya/2200910100065.git
cd 2200910100065
```

2. Install dependencies

```bash
# npm
npm install

# or yarn
yarn install
```

3. Create `.env` file (example below) and set your variables.

4. Start the app (development)

```bash
npm run dev
# or
node index.js
```

5. Open `http://localhost:3000` (or the port in your `.env`)

---

# Environment variables

Create a `.env` in project root:

```
PORT=3000
BASE_URL=http://localhost:3000       # used when building short URLs
MONGO_URI=mongodb://localhost:27017/url_shortener
JWT_SECRET=your_jwt_secret           # optional if you implement auth
DEFAULT_DOMAIN=sho.rt                # optional - domain for shortening if different
TOKEN_LENGTH=6                       # default generated token length
```

Adjust variables for your stack (e.g., `DATABASE_URL` for PostgreSQL).

---

# API endpoints

These are typical endpoints — adapt to your implementation.

### `POST /api/shorten`

Create a short URL.

Request JSON:

```json
{
  "url": "https://example.com/very/long/url",
  "customAlias": "myAlias",        // optional
  "expiresAt": "2025-12-31T23:59:59Z" // optional ISO datetime
}
```

Response JSON (201):

```json
{
  "shortUrl": "http://localhost:3000/Ab3xK",
  "token": "Ab3xK",
  "originalUrl": "https://example.com/very/long/url",
  "expiresAt": null
}
```

### `GET /:token`

Redirect to original URL (HTTP 302).

* If token not found → 404.

### `GET /api/links` (optional)

List stored links. (Admin / protected)

### `GET /api/links/:token/analytics` (optional)

Return click count, createdAt, lastClicked.

### `DELETE /api/links/:token`

Delete a short link.

---

# Data model (example - MongoDB)

Collection: `links`

```json
{
  "_id": ObjectId,
  "token": "Ab3xK",
  "originalUrl": "https://example.com/...",
  "createdAt": ISODate,
  "expiresAt": ISODate | null,
  "clicks": 42,
  "createdBy": "userId" // optional
}
```

If using SQL, a similar table with indexed `token` column is appropriate.

---

# Usage examples (curl)

Shorten a URL:

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.wikipedia.org/"}'
```

Shorten with custom alias:

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com", "customAlias":"wiki"}'
# -> http://localhost:3000/wiki
```

Follow redirect (browser or curl):

```bash
curl -I http://localhost:3000/Ab3xK
# should return HTTP/1.1 302 Found and Location header set to original URL
```

Get analytics (if implemented):

```bash
curl http://localhost:3000/api/links/Ab3xK/analytics
```

---

# Docker (optional)

A simple `Dockerfile` example for Node.js:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "index.js"]
```

`docker-compose.yml` (with MongoDB):

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/url_shortener
  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

# Running tests

If your project includes tests, run:

```bash
npm test
# or
yarn test
```

If no tests exist yet, add unit tests for:

* Token generation function (unique, correct length)
* URL validation
* Redirect behavior
* Expiration handling

---

# Deployment suggestions

* Host backend on: Heroku / Render / Vercel (serverless for functions) / DigitalOcean / AWS.
* Use managed MongoDB (MongoDB Atlas) or PostgreSQL (Supabase).
* Configure environment variables in your chosen host.
* Use a custom domain and set `BASE_URL` accordingly.
* Add HTTPS (Let’s Encrypt or platform-managed certificates).
* If high traffic expected, add caching (Redis) for redirect lookups and rate limiting.

---

# Project structure (suggested)

```
.
├── package.json
├── index.js                # app entry
├── src/
│   ├── controllers/
│   │   └── urlController.js
│   ├── routes/
│   │   └── api.js
│   ├── models/
│   │   └── Link.js
│   ├── services/
│   │   └── tokenService.js
│   └── utils/
│       └── validators.js
├── .env
├── README.md
└── tests/
    └── url.test.js
```

If your repo differs, update the README to reflect actual filenames.

---

# Contributing

* Fork the repository and create a branch: `feature/your-feature-name`.
* Make small, focused commits.
* Open a pull request with a clear description of changes.
* Add tests for new functionality.
* Follow existing code style. Optionally include a linter (ESLint) and formatter (Prettier).

---

# Security & Best Practices

* Validate incoming URLs and sanitize inputs.
* Prevent open redirect vulnerabilities (ensure stored `originalUrl` is a valid URL).
* Rate-limit shorten endpoint to protect from abuse.
* For custom aliases, check for collisions and restrict reserved keywords (e.g., `api`, `admin`).
* If storing user data, follow data protection best practices.

---

# Troubleshooting

* `Error: ECONNREFUSED` — check DB connection string and that DB is running.
* `Duplicate key` on token — ensure token generation retries or uses sufficiently-large keyspace.
* Redirect returns 404 — confirm token lookup logic and routing order (redirect route must not be overridden by other routes).

---
