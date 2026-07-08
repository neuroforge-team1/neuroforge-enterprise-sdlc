# NeuroForge Nexus

Cloud-native SDLC management platform. This repo is scoped to **Milestone 1 — Project & User Management**.

## Tech Stack
- **Frontend:** React 18 (Vite), Tailwind CSS, `keycloak-js`, Zustand, Axios
- **Backend:** Spring Boot 3, Spring Data JPA, Spring Security (OAuth2 Resource Server)
- **Database:** MySQL 8
- **Identity & Access:** Keycloak (realm roles: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `TESTER`, `DEVOPS_ENGINEER`)
- **Version Control:** Git & GitHub

## Prerequisites
- Java 17+
- Node.js 20+
- Docker & Docker Compose
- Maven (or use the `./mvnw` wrapper if you generate one via `mvn -N wrapper:wrapper` inside `backend/`)

## Getting Started

### 1. Start MySQL + Keycloak
```bash
docker-compose up -d
```
This starts MySQL on `localhost:3306` and Keycloak on `localhost:8081`, auto-importing the realm from `docs/keycloak/neuroforge-nexus-realm.json` (creates roles, the `nexus-backend`/`nexus-frontend` clients, and a default `admin`/`admin123` user — **change this password on first login**).

### 2. Seed the database
```bash
# Get the admin user's Keycloak ID: Keycloak admin console (http://localhost:8081) ->
# neuroforge-nexus realm -> Users -> admin -> copy the "ID" field.
# Replace REPLACE_WITH_KEYCLOAK_ADMIN_SUB in database/seed-data.sql with that ID, then:
mysql -h 127.0.0.1 -uroot -proot neuroforge_nexus < database/seed-data.sql
```

### 3. Run the backend
```bash
cd backend
cp src/main/resources/application.yml src/main/resources/application.yml   # defaults already work with docker-compose
mvn spring-boot:run
```
Runs on `http://localhost:8080`. Swagger UI: `http://localhost:8080/swagger-ui.html`.

### 4. Run the frontend
```bash
cd frontend
cp .env.example .env.development   # already provided with working local defaults
npm install
npm run dev
```
Runs on `http://localhost:5173` and will redirect you to Keycloak's login page on first load.

## Environment Variables
See `backend/src/main/resources/application.yml` (reads from env vars with sensible local defaults) and `frontend/.env.example`. Never commit real secrets — only `.env.example` is tracked.

## Folder Structure
```
neuroforge-nexus/
├── backend/           # Spring Boot API (OAuth2 resource server)
├── frontend/           # React SPA (keycloak-js gated)
├── database/           # SQL schema + seed data
├── docs/
│   ├── architecture/    # Milestone planning docs
│   └── keycloak/         # Realm export for docker-compose auto-import
├── docker-compose.yml   # MySQL + Keycloak for local dev
└── .github/              # PR template
```

## API Documentation
- Swagger UI (live): `http://localhost:8080/swagger-ui.html`
- Postman collection: add yours to `docs/api/` as you build requests (not included by default — export from Postman once your collection is stable).

## Branching & Contribution
- `main` — always demo-ready; protected, no direct pushes
- `develop` — integration branch; all feature branches merge here first
- `feature/<ticket-id>-<short-description>` — one branch per feature
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- Every change goes through a Pull Request with at least one review — see `.github/PULL_REQUEST_TEMPLATE.md`

## Milestone Progress
- [x] Repository scaffolded
- [ ] Keycloak realm imported and admin password rotated
- [ ] Backend running against local MySQL + Keycloak
- [ ] Frontend authenticated end-to-end
- [ ] Demo: login → create project → assign team → view dashboard

See `docs/architecture/milestone-1.md` for the full Milestone 1 spec, checklists, and rationale behind each architectural decision.

## Team
_Add your team roster and role assignments here._

## License
_Add your license here (e.g. proprietary / MIT), or remove this section if not applicable._
