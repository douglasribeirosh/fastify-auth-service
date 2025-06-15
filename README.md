
# fastify-auth-service

A reusable authentication service for projects using [Fastify](https://fastify.dev/).  
It handles user and client authentication via API keys, supporting a multi-tenant model (domains, clients, users).  
Useful for offloading authentication concerns from projects that don't want to reimplement login flows repeatedly.

> ⚠️ This project is not actively maintained, but reflects best practices from its development time and can still serve as a solid starting point or learning tool.

## 🚀 Features

- Token-based login for users and clients
- Configurable domain → client → user structure
- Built with Fastify and Prisma (currently using SQLite)
- Redis-based token/session tracking
- Full test coverage intended (some tests may fail)
- MIT Licensed

## 📦 Getting Started (Local Setup)

### Prerequisites
- Node.js (version managed via [`volta`](https://volta.sh/), or ensure you match the version in `package.json`)
- [Docker](https://www.docker.com/) (for Redis) or a local Redis instance

### Setup

1. **Start Redis**  
   Run via Docker:
   ```bash
   ./dev-tools/redis/run-redis.sh
   ```
   Or manually:
   ```bash
   docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file:
   ```env
   DEV_INITIAL_DATA=true
   DATABASE_URL="file:./dev.db"
   ```

4. **Prepare the database**  
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the server**  
   ```bash
   npm run dev   # for development with nodemon
   npm run start # for plain start
   ```

## 🧪 Tests

```bash
npm run test
```

> Some tests may currently fail — originally this project had 100% coverage.

## 🧠 Architecture Overview

### Entity Relationships

- **Dev** → owns multiple **Domains**
- **Domain** → has multiple **Clients** and **Users**
- **Client** → belongs to a Domain and logs in with API keys
- **User** → belongs to a Domain and logs in with credentials

### Configuration

Check `src/back/main/config/index.ts` to see available environment variables and their defaults.

## 📡 API Overview

### Health

- `GET /health` – Check server status
- `GET /tag` – Returns `process.env.IMAGE_VERSION` or `latest`

### Routes

#### Domain Management (`/api/domains`)
- `POST /api/domains` – Create
- `GET /api/domains` – List
- `GET /api/domains/:id` – View
- `PATCH /api/domains/:id` – Update
- `DELETE /api/domains/:id` – Delete

#### Client Management (`/api/domains/:domainId/clients`)
- `POST` / `GET` / `GET/:id` / `DELETE`

#### Client Authentication (`/api/auth-client`)
- `POST /login`
- `GET /whoami`

#### User Authentication (`/api/auth-user`)
- `POST /login`
- `POST /logout`
- `POST /register`
- `POST /reset-pass`
- `POST /confirm/:key`
- `GET /whoami`

## ⚠️ Known Gaps / Future Improvements

- Only supports **SQLite** (PostgreSQL planned)
- No Swagger/OpenAPI documentation
- No authorization layer (only authentication)
- Token stored in JSON response; session cookies not yet implemented
- Some test issues to revisit

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

### 👤 Author

Douglas Ribeiro  
[GitHub @douglasribeirosh](https://github.com/douglasribeirosh) • [CV Website](https://douglasribeiro.d-rift.com)
