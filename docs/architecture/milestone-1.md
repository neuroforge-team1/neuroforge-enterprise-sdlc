# NeuroForge Nexus — Milestone 1 Engineering Guide
### Project & User Management Module
**Stack:** React (frontend) · Spring Boot (backend) · MySQL (database) · Git/GitHub (VCS)

This document is written as a real-world team playbook for Milestone 1 (Weeks 1–2). It assumes you are starting completely from scratch — empty GitHub org, no code, no database.

---

## 1. Project Planning

### 1.1 What Milestone 1 Actually Delivers
Based on the SDLC platform concept, Milestone 1 = **Project & User Management**. In a from-scratch build with a small team, scope it realistically:

**In scope for Milestone 1:**
- User registration & login — **Keycloak-based IAM** (not custom JWT — see Section 4.14)
- Role-Based Access Control (RBAC) — roles: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `TESTER`, `DEVOPS_ENGINEER`
- Project CRUD (create/read/update/delete projects)
- Team management — assign users to projects/teams
- Basic Sprint entity (creation only — full Kanban board comes in Milestone 2)
- Milestone tracking (simple due-date + status field on a project)
- Dashboard screen showing counts (active projects, users, teams)

**Explicitly out of scope (deferred to later milestones):**
- Kanban board / drag-drop task management (M2)
- CI/CD pipeline integration (M3)
- Monitoring dashboards, Prometheus/Grafana (M4)
- Kafka event streaming (introduced M2+)

### 1.2 Deliverables Checklist (high level)
| Deliverable | Owner | Format |
|---|---|---|
| GitHub repo with structure & branch protection | Tech Lead | Repo |
| Keycloak realm + roles + client config | Backend/DevOps | Realm export `.json` |
| ER diagram + SQL schema | Backend | `.sql` + diagram image |
| REST API for Users, Projects, Teams (secured via Keycloak) | Backend | Spring Boot app |
| React UI: Login, Register, Dashboard, Projects, Team Management | Frontend | React app |
| Postman collection | Backend | `.json` export |
| README + setup guide | Everyone | Markdown |
| Demo (working end-to-end flow) | Everyone | Live walkthrough |

---

## 2. Repository Structure

### 2.1 Repo Strategy: Monorepo vs Multi-repo
For a small team (2–6 people) starting out, a **monorepo** is easier to manage (single PR for full-stack features, one issue tracker, one CI pipeline later). Use multi-repo only if teams are large/independent.

```
neuroforge-nexus/
├── backend/                  # Spring Boot application
├── frontend/                 # React application
├── docs/                     # Architecture docs, ER diagrams, API docs
│   ├── architecture/
│   ├── api/
│   └── er-diagram.png
├── database/
│   ├── schema.sql
│   ├── seed-data.sql
│   └── migrations/
├── .github/
│   ├── workflows/             # CI (build/test) — can be added M1 or M3
│   └── PULL_REQUEST_TEMPLATE.md
├── .gitignore
├── README.md
└── LICENSE
```

### 2.2 Branch Strategy — GitFlow-lite (recommended for M1)
```
main        → always production-ready / demo-ready
develop     → integration branch, all features merge here first
feature/*   → one branch per feature (e.g. feature/user-auth)
bugfix/*    → bug fixes
release/*   → optional, used when preparing a milestone tag
hotfix/*    → urgent prod fixes (rare in M1)
```

Rules:
- No one commits directly to `main` or `develop`.
- Every feature branch is merged via Pull Request, not direct push.
- `main` is protected: require PR review + passing checks before merge.
- Tag milestone completion: `git tag -a v0.1.0-m1 -m "Milestone 1 complete"`.

### 2.3 README.md — Required Sections
```markdown
# NeuroForge Nexus

## Overview
## Tech Stack
## Prerequisites (Java 21, Node 20, MySQL 8, etc.)
## Getting Started
  - Backend setup
  - Frontend setup
  - Database setup
## Environment Variables
## Folder Structure
## API Documentation (link to /docs/api)
## Branching & Contribution Guide
## Milestone Progress
## Team
## License
```

---

## 3. Frontend (React)

### 3.1 Project Setup
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom axios zustand keycloak-js  # or redux-toolkit
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Vite is preferred over CRA (deprecated) — faster builds, modern tooling.

### 3.2 Folder Structure
```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/           # Reusable, dumb UI components
│   │   ├── common/           # Button, Input, Modal, Loader
│   │   ├── layout/           # Navbar, Sidebar, Footer
│   │   └── project/          # ProjectCard, ProjectForm
│   ├── pages/                # Route-level components
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectDetails.jsx
│   │   └── TeamManagement.jsx
│   │       # No Login.jsx/Register.jsx — Keycloak hosts the login/registration UI;
│   │       # the app redirects there and back (see 3.4/3.5).
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── config/
│   │   └── keycloak.js        # Keycloak adapter instance
│   ├── services/             # API calls (Axios instances)
│   │   ├── api.js            # axios instance + interceptors
│   │   ├── projectService.js
│   │   └── userService.js
│   ├── store/                 # State management (Zustand/Redux)
│   │   ├── authStore.js
│   │   └── projectStore.js
│   ├── hooks/                 # Custom hooks (useAuth, useFetch)
│   ├── utils/                 # Helpers, formatters, constants
│   ├── context/                # AuthContext (if using Context API)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.development
├── .env.production
├── package.json
└── vite.config.js
```

### 3.3 Pages & Components (Milestone 1)
| Page | Purpose |
|---|---|
| `Dashboard.jsx` | Cards: active projects, users, teams |
| `Projects.jsx` | List + create/edit/delete projects |
| `ProjectDetails.jsx` | Single project view, assigned team, milestone due date |
| `TeamManagement.jsx` | Assign/remove users to a project |

There's no in-app `Login.jsx`/`Register.jsx` to build — Keycloak provides its own hosted login/registration screens (themeable later if a branded look is required). The React app's job is just to trigger the redirect and handle the returning token.

### 3.4 Keycloak Adapter Setup
```js
// config/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,        // e.g. http://localhost:8081
  realm: 'neuroforge-nexus',
  clientId: 'nexus-frontend',                    // public client, PKCE enabled
});

export default keycloak;
```
```jsx
// main.jsx — initialize before rendering the app
keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256' }).then((authenticated) => {
  if (authenticated) {
    useAuthStore.getState().setAuth(keycloak.tokenParsed, keycloak.token);
    createRoot(document.getElementById('root')).render(<App />);
  }
});
```

### 3.5 Routing
```jsx
// routes/AppRoutes.jsx
<Routes>
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/projects/:id" element={<ProjectDetails />} />
    <Route path="/teams" element={<TeamManagement />} />
  </Route>
</Routes>
```
`ProtectedRoute` simply checks `keycloak.authenticated` (set during `main.jsx` init) — there's no separate `/login` route since `keycloak.init({ onLoad: 'login-required' })` already forces a redirect to Keycloak before the app ever renders.

### 3.6 State Management
For M1 scope, **Zustand** (lightweight) or React Context is enough — Redux Toolkit is justified only once state complexity grows (M2+ with Kanban, real-time Kafka events).

```js
// store/authStore.js
import { create } from 'zustand';
export const useAuthStore = create((set) => ({
  user: null,          // decoded token claims (name, email, realm_access.roles)
  token: null,          // Keycloak-issued access token, kept in memory only
  setAuth: (user, token) => set({ user, token }),
  logout: () => keycloak.logout(),
}));
```
Note: the token is **not** written to `localStorage` — `keycloak-js` manages refresh internally, and keeping the token in memory only reduces XSS exposure. Call `keycloak.updateToken(30)` before requests to auto-refresh if close to expiry.

### 3.7 API Integration
```js
// services/api.js
import axios from 'axios';
import keycloak from '../config/keycloak';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
api.interceptors.request.use(async (config) => {
  await keycloak.updateToken(30);   // refresh if expiring within 30s
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});
export default api;
```

### 3.8 Environment Variables
```
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=http://localhost:8081

# .env.production
VITE_API_BASE_URL=https://api.neuroforge-nexus.com/api
VITE_KEYCLOAK_URL=https://auth.neuroforge-nexus.com
```
Never commit `.env` files with secrets — only commit `.env.example`. The frontend Keycloak client is **public** (no secret), so there's nothing sensitive in these values beyond the URLs themselves.

### 3.9 Frontend Best Practices
- Keep components small and single-purpose; separate "presentational" vs "container" components.
- Co-locate simple styles; use Tailwind utility classes over ad-hoc CSS.
- Validate forms client-side (e.g. `react-hook-form` + `yup`/`zod`) but never trust client validation alone.
- Centralize all API calls in `services/`, never call `axios` directly inside components.
- Use `.env` for config, never hardcode URLs.
- Never store tokens in `localStorage`/`sessionStorage` — let `keycloak-js` hold them in memory and handle silent refresh.

### 3.10 Frontend Milestone 1 Tasks
- [ ] Vite + Tailwind project bootstrapped
- [ ] `keycloak-js` adapter configured, app gated behind `login-required`
- [ ] Access token attached to all API requests, auto-refreshed
- [ ] Protected routing implemented (role-aware — e.g. hide admin-only nav items based on `realm_access.roles`)
- [ ] Dashboard with live counts from API
- [ ] Project list/create/edit/delete UI
- [ ] Team assignment UI

---

## 4. Backend (Spring Boot)

### 4.1 Project Setup
Use **Spring Initializr** (start.spring.io):
- Project: Maven
- Language: Java (17 or 21 LTS)
- Spring Boot: latest stable 3.x
- Dependencies: Spring Web, Spring Data JPA, MySQL Driver, Spring Security, Validation, Lombok, Spring Boot DevTools

```bash
mvn spring-boot:run
```

### 4.2 Package Structure (Layered Architecture)
```
backend/
├── src/main/java/com/neuroforge/nexus/
│   ├── config/                # SecurityConfig, CorsConfig, SwaggerConfig
│   ├── controller/            # REST controllers
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── ProjectController.java
│   │   └── TeamController.java
│   ├── service/                # Business logic (interfaces + impl)
│   │   ├── UserService.java
│   │   ├── impl/UserServiceImpl.java
│   │   ├── ProjectService.java
│   │   └── impl/ProjectServiceImpl.java
│   ├── repository/             # Spring Data JPA interfaces
│   │   ├── UserRepository.java
│   │   ├── ProjectRepository.java
│   │   └── TeamRepository.java
│   ├── entity/                 # JPA entities
│   │   ├── User.java
│   │   ├── Project.java
│   │   ├── Team.java
│   │   └── Role.java
│   ├── dto/
│   │   ├── request/            # UserRegisterRequest, ProjectCreateRequest
│   │   └── response/           # UserResponse, ProjectResponse, ApiResponse
│   ├── mapper/                 # Entity <-> DTO conversion (MapStruct or manual)
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── BadRequestException.java
│   ├── security/
│   │   ├── SecurityConfig.java          # OAuth2 resource server config
│   │   └── KeycloakRoleConverter.java   # Maps realm_access.roles → Spring authorities
│   └── NexusApplication.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
└── pom.xml
```

### 4.3 Layered Architecture Flow
```
Controller  →  Service  →  Repository  →  Database
   ↑              ↑
  DTOs        Business Logic
```
- **Controller**: only handles HTTP — no business logic. Receives DTOs, calls service, returns DTOs.
- **Service**: contains business rules, transactions, orchestration.
- **Repository**: pure data access (Spring Data JPA `interface extends JpaRepository`).
- **Entity**: maps to DB tables — never returned directly to the frontend (always through a DTO).

### 4.4 DTOs (example)
```java
public record ProjectCreateRequest(
    @NotBlank String name,
    String description,
    LocalDate milestoneDueDate
) {}

public record ProjectResponse(
    UUID id, String name, String status,
    LocalDate milestoneDueDate, int teamSize
) {}
```

### 4.5 Entities (example)
```java
@Entity
@Table(name = "projects")
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status; // ACTIVE, COMPLETED, ON_HOLD

    private LocalDate milestoneDueDate;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<TeamMember> teamMembers;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 4.6 Repositories
```java
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByStatus(ProjectStatus status);
    List<Project> findByCreatedById(UUID userId);
}
```

### 4.7 Services
```java
public interface ProjectService {
    ProjectResponse createProject(ProjectCreateRequest request, UUID currentUserId);
    List<ProjectResponse> getAllProjects();
    ProjectResponse getProjectById(UUID id);
    ProjectResponse updateProject(UUID id, ProjectUpdateRequest request);
    void deleteProject(UUID id);
}
```
Service implementations own `@Transactional` boundaries and throw domain exceptions (`ResourceNotFoundException`) rather than returning nulls.

### 4.8 Controllers
```java
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectCreateRequest req,
                                                   @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(req, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody ProjectUpdateRequest req) {
        return ResponseEntity.ok(projectService.updateProject(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 4.9 Exception Handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError(404, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        return ResponseEntity.status(500).body(new ApiError(500, "Internal server error"));
    }
}
```

### 4.10 Validation
Use `jakarta.validation` annotations (`@NotBlank`, `@Email`, `@Size`, `@Past`, `@Future`) directly on request DTOs, enforced with `@Valid` in controllers.

### 4.11 Configuration (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/neuroforge_nexus
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate    # use Flyway/Liquibase for schema changes, not auto-update in shared envs
    show-sql: true
  profiles:
    active: dev
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${KEYCLOAK_ISSUER_URI}   # e.g. http://localhost:8081/realms/neuroforge-nexus

server:
  port: 8080
```

### 4.12 Environment Variables
```
DB_USERNAME=root
DB_PASSWORD=yourpassword
KEYCLOAK_ISSUER_URI=http://localhost:8081/realms/neuroforge-nexus
KEYCLOAK_CLIENT_ID=nexus-backend
KEYCLOAK_CLIENT_SECRET=your-confidential-client-secret
```
Never commit real secrets — use `.env` locally (with `spring-dotenv` or OS env vars) and a secrets manager in production later.

### 4.13 Logging
- Use SLF4J (`private static final Logger log = LoggerFactory.getLogger(Class.class);`).
- Log at service layer for business events (`log.info("Project {} created by {}", ...)`).
- Never log passwords, tokens, or PII.

### 4.14 Security — Keycloak IAM (Milestone 1 scope)
Per the platform spec, IAM is handled by **Keycloak**, not a hand-rolled JWT/UserDetailsService setup. This changes the shape of Section 4.2 slightly:

**What changes vs. a custom-JWT approach:**
- Remove `JwtUtil.java`, `JwtAuthFilter.java`, `UserDetailsServiceImpl.java` from `security/` — Keycloak issues and signs the tokens; Spring just **validates** them.
- The backend becomes an **OAuth2 Resource Server**, not an identity provider. Add dependency:
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
  </dependency>
  ```
- Password storage/hashing (`BCryptPasswordEncoder`, `password_hash` column) is **no longer the backend's job** — Keycloak owns credentials entirely.

**Keycloak setup (Milestone 1 tasks):**
1. Run Keycloak locally (see `docker-compose.yml` update in Section 11) or use a hosted dev instance.
2. Create a realm: `neuroforge-nexus`.
3. Create realm roles: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `TESTER`, `DEVOPS_ENGINEER`.
4. Create a **confidential client** for the backend (`nexus-backend`) and a **public client** for the frontend (`nexus-frontend`, with PKCE enabled, no client secret).
5. Enable **self-registration** on the realm (or build a registration endpoint via Keycloak's Admin REST API if a custom-branded signup form is required).
6. Export the realm config to `docs/keycloak/neuroforge-nexus-realm.json` so teammates can import it identically.

**Spring Security config (resource server, validates Keycloak-issued JWTs):**
```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakRoleConverter())));
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter keycloakRoleConverter() {
        var authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var realmAccess = (Map<String, Object>) jwt.getClaims().getOrDefault("realm_access", Map.of());
            var roles = (List<String>) realmAccess.getOrDefault("roles", List.of());
            return roles.stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .collect(Collectors.toList());
        });
        return converter;
    }
}
```
Endpoints then use standard Spring role checks, unchanged in usage: `@PreAuthorize("hasRole('ADMIN')")`, `@PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")`.

**CORS**: allow the React dev origin (`http://localhost:5173`) and the Keycloak origin during local dev.

**Local `users` table**: still exists, but as an **app-profile mirror**, not a credential store — it links to Keycloak's user via `keycloak_id` (the token's `sub` claim) and stores app-specific data (team memberships, display preferences). See updated schema in Section 5.4.

### 4.15 Backend Milestone 1 Tasks
- [ ] Spring Boot project bootstrapped, connects to MySQL
- [ ] User entity + registration/login endpoints + JWT issuing
- [ ] Spring Security filter chain + role-based authorization
- [ ] Project CRUD endpoints
- [ ] Team assignment endpoints
- [ ] Global exception handler
- [ ] Input validation on all request DTOs
- [ ] Postman collection covering all endpoints

---

## 5. Database (MySQL)

### 5.1 Design Principles
- One table per core entity, 3NF normalization for M1 (denormalize later only if performance demands it).
- Use `snake_case` for table/column names, `UUID` (CHAR(36)) or `BIGINT AUTO_INCREMENT` for PKs — pick one convention and use it everywhere (UUID recommended if you'll eventually go distributed/microservices).

### 5.2 Core Entities (Milestone 1)
`users` (Keycloak profile mirror), `user_roles_cache` (optional local role cache), `projects`, `teams`, `team_members` (join table), `milestones` (optional — can be a field on `projects` for M1). Roles themselves are defined and enforced in **Keycloak**, not owned by MySQL.

### 5.3 ER Diagram (textual)
```
Keycloak (external IAM) ──issues tokens with realm roles──► Spring Security

users ───< team_members >─── teams
  │                              │
  │                              └──< projects (team_id FK)
  └─< projects (created_by FK)

users ──< user_roles_cache   (local read cache only; source of truth = Keycloak)
```

### 5.4 SQL Schema
```sql
-- Keycloak owns credentials AND role assignment (realm roles: ADMIN, PROJECT_MANAGER,
-- DEVELOPER, TESTER, DEVOPS_ENGINEER). This table is a local PROFILE MIRROR, keyed off
-- the Keycloak subject ("sub" claim), used for joins with projects/teams and for any
-- app-specific profile fields Keycloak doesn't store.
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,             -- same as Keycloak's user "sub" (not app-generated)
    keycloak_id CHAR(36) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional local cache of a user's primary role, kept in sync via Keycloak webhook/event
-- listener or refreshed on login. Useful for fast SQL filtering (e.g. "list all DEVOPS_ENGINEER
-- users") without calling the Keycloak Admin API on every request. Source of truth remains Keycloak.
CREATE TABLE user_roles_cache (
    user_id CHAR(36) NOT NULL,
    role_name VARCHAR(50) NOT NULL,    -- ADMIN, PROJECT_MANAGER, DEVELOPER, TESTER, DEVOPS_ENGINEER
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE teams (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    team_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status ENUM('ACTIVE','ON_HOLD','COMPLETED') DEFAULT 'ACTIVE',
    milestone_due_date DATE,
    team_id CHAR(36),
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 5.5 Naming Conventions
- Tables: plural, `snake_case` (`projects`, `team_members`).
- Columns: `snake_case`, foreign keys named `<referenced_table_singular>_id` (`team_id`, `created_by`... where role is clearer than raw FK name, name it semantically).
- Indexes: `idx_<table>_<column>`; Foreign keys: `fk_<table>_<ref_table>`.

### 5.6 Seed Data
The default `ADMIN` user is created **in Keycloak** (via the imported realm JSON or the Keycloak admin console), not via SQL. `database/seed-data.sql` should insert the matching `users` row (same `keycloak_id`) so the profile mirror is populated on first run.

---

## 6. API Design

### 6.1 REST Endpoints (Milestone 1)
Registration and login are **not** application endpoints anymore — they're handled entirely by Keycloak:
- Login: frontend redirects to Keycloak's `/realms/neuroforge-nexus/protocol/openid-connect/auth`, or embeds Keycloak's login form.
- Token issuance: `POST {KEYCLOAK_ISSUER_URI}/protocol/openid-connect/token`
- Registration: Keycloak's self-registration page (realm setting), or an internal tool calls Keycloak's Admin REST API to create users (typical for `ADMIN`-invited signup flows).

Application endpoints only deal with domain data, secured by the Keycloak-issued token:

| Method | Endpoint | Description | Auth (Keycloak realm role) |
|---|---|---|---|
| GET | `/api/users/me` | Current user profile (synced from token claims) | Authenticated |
| GET | `/api/users` | List all users | PROJECT_MANAGER / ADMIN |
| GET | `/api/projects` | List projects | Authenticated |
| POST | `/api/projects` | Create project | PROJECT_MANAGER / ADMIN |
| GET | `/api/projects/{id}` | Project details | Authenticated |
| PUT | `/api/projects/{id}` | Update project | PROJECT_MANAGER / ADMIN |
| DELETE | `/api/projects/{id}` | Delete project | ADMIN |
| POST | `/api/teams` | Create team | PROJECT_MANAGER / ADMIN |
| POST | `/api/teams/{id}/members` | Add member to team | PROJECT_MANAGER / ADMIN |
| GET | `/api/deployments/health` *(stub for M1, real impl in M3/M4)* | Placeholder DevOps-visibility endpoint | DEVOPS_ENGINEER / ADMIN |

### 6.2 Request/Response Format
Consistent envelope for errors:
```json
{ "status": 404, "message": "Project not found", "timestamp": "2026-07-05T10:00:00Z" }
```
Success responses return the resource DTO directly (or a paginated wrapper for lists).

### 6.3 HTTP Status Codes
- `200 OK` — successful GET/PUT
- `201 Created` — successful POST
- `204 No Content` — successful DELETE
- `400 Bad Request` — validation errors
- `401 Unauthorized` — missing/invalid token
- `403 Forbidden` — authenticated but not authorized
- `404 Not Found` — resource doesn't exist
- `500 Internal Server Error` — unhandled exception

### 6.4 API Documentation
Add `springdoc-openapi-starter-webmvc-ui` dependency → auto-generates Swagger UI at `/swagger-ui.html`. This becomes your living API doc; also export a Postman collection into `docs/api/`.

### 6.5 Testing with Postman
- One Postman collection per module (`Projects`, `Teams`, `Users`), plus a single **"Get Token" request** hitting Keycloak directly:
  ```
  POST {{keycloakBaseUrl}}/realms/neuroforge-nexus/protocol/openid-connect/token
  Content-Type: application/x-www-form-urlencoded
  Body: grant_type=password&client_id=nexus-frontend&username={{username}}&password={{password}}
  ```
  (Use the `password` grant only for local/dev testing convenience — the real frontend uses the Authorization Code + PKCE flow, not the password grant.)
- Use a Postman environment with variables: `{{baseUrl}}`, `{{keycloakBaseUrl}}`, `{{token}}`.
- A test script on the "Get Token" request extracts `access_token` from the response into `{{token}}`; every other request reuses it as a Bearer token.

---

## 7. Git & GitHub Workflow

### 7.1 Branch Naming
```
feature/<ticket-id>-<short-description>   e.g. feature/NF-12-user-login
bugfix/<ticket-id>-<short-description>
chore/<short-description>                 e.g. chore/update-readme
```

### 7.2 Commit Message Convention (Conventional Commits)
```
feat: add project creation endpoint
fix: correct JWT expiry validation
docs: update setup instructions in README
refactor: extract project mapper to separate class
test: add unit tests for ProjectService
chore: update dependencies
```

### 7.3 Pull Request Workflow
1. Branch off `develop`.
2. Commit small, logical changes.
3. Open PR into `develop` with description, linked issue, screenshots (for UI).
4. At least 1 reviewer approval required.
5. Squash-merge to keep history clean.
6. Delete branch after merge.

### 7.4 Code Review Checklist
- Does it follow package/folder conventions above?
- Are DTOs used (no entity leaking to API)?
- Is input validated?
- Are exceptions handled, not swallowed?
- Any secrets committed?
- Tests included for new logic?

---

## 8. Project Architecture

### 8.1 Overall Diagram
```
                         ┌───────────────┐
                         │   Keycloak    │  issues/validates
                         │   (IAM)       │  identity tokens
                         └──────┬────────┘
                    login       │      JWKS (public keys)
                 redirect ▲     │      for token validation
                          │     ▼
┌────────────┐      HTTPS/REST      ┌────────────────┐      JDBC      ┌───────────┐
│   React    │  ───────────────►    │  Spring Boot   │  ───────────►  │   MySQL   │
│  (Vite SPA)│  ◄───────────────    │  Resource      │  ◄───────────  │  Database │
└────────────┘   JSON + Bearer JWT  │  Server        │                └───────────┘
                                    └────────────────┘
```

### 8.2 Request Flow Example (Create Project)
1. On app load, React redirects (once) to Keycloak's login page if the user isn't authenticated; Keycloak issues an access token back to the SPA.
2. User submits "Create Project" form in React.
3. Axios sends `POST /api/projects` with the Keycloak access token in the `Authorization` header.
4. Spring Security's OAuth2 resource server filter validates the token's signature against Keycloak's JWKS endpoint (no local secret needed) and extracts `realm_access.roles`.
5. `ProjectController` receives the validated `ProjectCreateRequest` (only reached if the caller has `PROJECT_MANAGER` or `ADMIN`).
6. `ProjectServiceImpl` applies business rules, saves via `ProjectRepository`.
7. MySQL persists row; entity mapped to `ProjectResponse` DTO.
8. Response returned as JSON with `201 Created`.
9. React updates local/store state and re-renders project list.

---

## 9. Development Workflow

### 9.1 Suggested Role Split (5–6 person team)
| Person | Focus |
|---|---|
| Dev 1 (Backend lead) | Keycloak realm/client setup, Spring Security resource-server config |
| Dev 2 (Backend) | Project & Team services |
| Dev 3 (Frontend lead) | `keycloak-js` integration, routing, state setup |
| Dev 4 (Frontend) | Dashboard, Project/Team UI |
| Dev 5 (DevOps Engineer) | Keycloak/MySQL `docker-compose` setup, env var management, Postman/Swagger docs |
| Dev 6 (or shared) | DB schema, QA, manual test checklist |

### 9.2 Daily Workflow
- Daily 15-min standup: yesterday / today / blockers.
- Backend and frontend agree on API contract **before** coding (write the DTO shapes first).
- Use a shared Postman collection as the contract of truth until Swagger is live.

### 9.3 Integration Strategy
- Backend team exposes endpoints behind mock data first if frontend is blocked; or use a mock server (e.g. `json-server`) against the agreed contract.
- Integrate continuously into `develop`, not at the end of the milestone.

### 9.4 Handling Merge Conflicts
- Pull `develop` into your feature branch daily (`git pull origin develop --rebase`).
- Keep PRs small (< ~400 lines changed) to reduce conflict surface.
- For generated/lock files (`package-lock.json`), regenerate rather than hand-merge.

---

## 10. Testing

### 10.1 Backend Testing
- Unit tests: JUnit 5 + Mockito for services (`ProjectServiceTest` mocks `ProjectRepository`).
- Integration tests: `@SpringBootTest` + Testcontainers (MySQL) or an H2 in-memory DB for repository layer.
- Minimum M1 target: cover Auth and Project service logic.

### 10.2 Frontend Testing
- Vitest + React Testing Library for component tests (form validation, protected route redirect).
- At minimum: test the Login form and a protected route guard.

### 10.3 API Testing
- Postman collection run manually per PR; consider Newman (Postman CLI) in CI once M1 stabilizes.

### 10.4 Manual Testing Checklist
- [ ] Unauthenticated user is redirected to Keycloak login on app load
- [ ] Register via Keycloak's self-registration page → new user can log in
- [ ] Invalid Keycloak login shows proper error
- [ ] Access token is attached to API calls and accepted by the backend
- [ ] Create/edit/delete project as `PROJECT_MANAGER`
- [ ] Non-admin blocked from admin-only actions (403)
- [ ] User with only `DEVOPS_ENGINEER` role can hit the DevOps-visibility stub but not project-management endpoints
- [ ] Team assignment reflects in project details
- [ ] Refresh page keeps user logged in (Keycloak silent SSO / token refresh)
- [ ] Logout via Keycloak clears session and blocks protected routes

---

## 11. Deployment Preparation (Milestone 1 scope only)

- **Environment variables**: separate `.env`/`application-dev.yml` vs `application-prod.yml`; never commit secrets.
- **Build process**: `npm run build` (frontend) → static assets; `mvn clean package` (backend) → executable JAR.
- **Configuration files**: keep dev/prod DB URLs, Keycloak issuer URI/client IDs, CORS origins environment-driven.
- **Production considerations for M1**: no need for Kubernetes/CI-CD yet — just ensure the app *can* run with `docker-compose` locally (MySQL + Keycloak + backend + frontend) as a foundation for M3's CI/CD work. This is also the natural first task for the **DevOps Engineer** role on the team, even in M1.

Example `docker-compose.yml` for local dev parity (MySQL + Keycloak):
```yaml
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: neuroforge_nexus
      MYSQL_ROOT_PASSWORD: root
    ports: ["3306:3306"]

  keycloak:
    image: quay.io/keycloak/keycloak:25.0
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports: ["8081:8080"]
    volumes:
      - ./docs/keycloak:/opt/keycloak/data/import   # auto-imports neuroforge-nexus-realm.json
```
With `--import-realm`, teammates get an identical realm (roles, clients) on first `docker-compose up` — no manual Keycloak console clicking required after the first setup.

---

## 12. Documentation

- **README.md** — as outlined in Section 2.3.
- **API docs** — Swagger UI + exported Postman collection in `docs/api/`.
- **Setup guide** — step-by-step: clone → `.env` setup → DB init → run backend → run frontend.
- **Project structure doc** — this document, kept in `docs/architecture/milestone-1.md`.

---

## 13. Best Practices Summary

- **Clean layering**: Controller → Service → Repository, no layer skipping.
- **DTOs always** at API boundaries; entities never serialized directly.
- **Consistent naming**: `snake_case` DB, `camelCase` Java/JS, `PascalCase` React components.
- **Security basics**: credentials and role assignment centralized in Keycloak (not the app DB), token signature validated against Keycloak's JWKS, role checks on every protected endpoint, CORS locked to known origins.
- **Scalability considerations for later**: this layered design plus DTO boundaries make it straightforward to later split into microservices (User Service, Project Service, etc.) as described in the platform's target architecture — no major rewrite needed if boundaries are respected now. Centralizing IAM in Keycloak from day one also means every future microservice (Sprint Service, CI/CD Service, Release Service) can validate the same tokens without duplicating auth logic.

---

## 14. Milestone 1 — Completion Checklist

**Repository**
- [ ] Repo created, branch protection on `main`/`develop`
- [ ] Folder structure matches Section 2
- [ ] README complete

**Identity & Access (Keycloak)**
- [ ] Keycloak running locally via `docker-compose`
- [ ] Realm `neuroforge-nexus` created with roles: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `TESTER`, `DEVOPS_ENGINEER`
- [ ] `nexus-backend` (confidential) and `nexus-frontend` (public, PKCE) clients configured
- [ ] Realm exported to `docs/keycloak/neuroforge-nexus-realm.json` and auto-imports on `docker-compose up`
- [ ] Self-registration enabled (or admin-invite flow documented)

**Database**
- [ ] Schema created and versioned in `database/schema.sql`
- [ ] Seed data script available (matching a Keycloak-seeded admin user)
- [ ] ER diagram documented

**Backend**
- [ ] Spring Security configured as OAuth2 resource server against Keycloak's issuer
- [ ] Realm roles correctly mapped to Spring authorities (`ROLE_*`)
- [ ] RBAC enforced on protected endpoints, including `DEVOPS_ENGINEER`-only stub
- [ ] Project & Team CRUD complete
- [ ] Global exception handling in place
- [ ] Validation on all inputs
- [ ] Postman collection (Keycloak token request + all app endpoints) covers everything
- [ ] Swagger/OpenAPI available

**Frontend**
- [ ] `keycloak-js` integrated, app gated behind Keycloak login
- [ ] Protected routing works, role-aware UI (nav hides admin-only items appropriately)
- [ ] Dashboard shows live data
- [ ] Project CRUD UI complete
- [ ] Team management UI complete

**Quality**
- [ ] Core services unit tested
- [ ] Manual test checklist passed
- [ ] No secrets committed to Git (Keycloak client secret via env var only)

**Demo**
- [ ] End-to-end walkthrough: Keycloak login → create project → assign team (including a DevOps Engineer) → view dashboard → logout

Once every box above is checked, Milestone 1 is complete and the team can tag the release (`v0.1.0-m1`) and move into Milestone 2 (Sprint & Task Management).
