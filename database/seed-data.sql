-- Seed data for local development.
-- IMPORTANT: the id/keycloak_id below must match the "sub" claim of a real
-- user created in your local Keycloak realm (see docs/keycloak/neuroforge-nexus-realm.json,
-- default admin user: username "admin", password "admin123" — change on first login).
-- After importing the realm, open Keycloak admin console -> Users -> admin -> copy the
-- "ID" field and replace REPLACE_WITH_KEYCLOAK_ADMIN_SUB below before running this script.

USE neuroforge_nexus;

INSERT INTO users (id, keycloak_id, full_name, email)
VALUES ('c9fe10ca-b3c1-4d6f-bc97-0b0762e86c09', 'c9fe10ca-b3c1-4d6f-bc97-0b0762e86c09', 'Admin User', 'admin@neuroforge-nexus.dev')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO teams (id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Platform Core Team')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO team_members (team_id, user_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'c9fe10ca-b3c1-4d6f-bc97-0b0762e86c09')
ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);

INSERT INTO projects (id, name, description, status, milestone_due_date, team_id, created_by)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'FinCore Nexus',
    'Milestone 1 pilot project used to validate Project & User Management.',
    'ACTIVE',
    '2026-08-20',
    '11111111-1111-1111-1111-111111111111',
    'c9fe10ca-b3c1-4d6f-bc97-0b0762e86c09'
)
ON DUPLICATE KEY UPDATE name = VALUES(name);
