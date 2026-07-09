-- NeuroForge Nexus — Milestone 1 schema
-- Note: Keycloak owns credentials AND role assignment (realm roles: ADMIN,
-- PROJECT_MANAGER, DEVELOPER, TESTER, DEVOPS_ENGINEER). These tables are a
-- local profile/business-data mirror, keyed off the Keycloak "sub" claim.

CREATE DATABASE IF NOT EXISTS neuroforge_nexus;
USE neuroforge_nexus;

CREATE TABLE IF NOT EXISTS users (
                                     id           CHAR(36) PRIMARY KEY,          -- same value as Keycloak's "sub" claim
    keycloak_id  CHAR(36) NOT NULL UNIQUE,
    full_name    VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Optional local cache of role assignment, kept in sync from Keycloak (webhook
-- or refreshed on login). Source of truth remains Keycloak; this exists only
-- to allow fast SQL filtering without calling the Keycloak Admin API.
CREATE TABLE IF NOT EXISTS user_roles_cache (
                                                user_id    CHAR(36) NOT NULL,
    role_name  VARCHAR(50) NOT NULL,             -- ADMIN, PROJECT_MANAGER, DEVELOPER, TESTER, DEVOPS_ENGINEER
    PRIMARY KEY (user_id, role_name),
    CONSTRAINT fk_user_roles_cache_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS teams (
                                     id          CHAR(36) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS team_members (
                                            team_id  CHAR(36) NOT NULL,
    user_id  CHAR(36) NOT NULL,
    PRIMARY KEY (team_id, user_id),
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS projects (
                                        id                  CHAR(36) PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    status              ENUM('ACTIVE','ON_HOLD','COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    milestone_due_date  DATE,
    team_id             CHAR(36),
    created_by          CHAR(36) NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_team    FOREIGN KEY (team_id)    REFERENCES teams(id) ON DELETE SET NULL,
    CONSTRAINT fk_projects_creator FOREIGN KEY (created_by) REFERENCES users(id)
    );

CREATE INDEX idx_projects_status  ON projects(status);
CREATE INDEX idx_projects_team    ON projects(team_id);
CREATE INDEX idx_projects_creator ON projects(created_by);

-- Basic sprint tracking (creation + status only — see
-- docs/architecture/milestone-1.md). Full Kanban/drag-drop board is M2.
CREATE TABLE IF NOT EXISTS sprints (
                                       id          CHAR(36) PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    status      ENUM('PLANNED','ACTIVE','COMPLETED') NOT NULL DEFAULT 'PLANNED',
    project_id  CHAR(36) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sprints_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

CREATE INDEX idx_sprints_project ON sprints(project_id);
