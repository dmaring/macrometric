<!--
  SYNC IMPACT REPORT
  ===================
  Version Change: 2.1.0 → 2.2.0 (MINOR)
  Reason: Added Version Control principle

  Modified Sections:
  - None

  Added Sections:
  - VIII. Version Control - Conventional Commits, atomic commits, feature branch workflow

  Removed Sections:
  - None

  Templates Status:
  - .specify/templates/plan-template.md: ✅ Compatible
  - .specify/templates/spec-template.md: ✅ Compatible
  - .specify/templates/tasks-template.md: ✅ Compatible

  Follow-up TODOs:
  - None
-->

# Macrometric Constitution

## Core Principles

### I. Modern Web Application
A full-stack web application with a React SPA frontend and FastAPI backend. The frontend is built as a single-page application served statically. The backend provides authentication, data persistence, and external API integration.

### II. Semantic HTML
Use semantic HTML elements for accessibility and SEO. Structure content with proper heading hierarchy and landmarks. Components MUST include appropriate ARIA attributes and accessible names.

### III. User-Centric Design
Prioritize speed and ease of use. Food logging MUST be quick and frictionless. The interface MUST be intuitive for first-time users. Core workflows (add food, view diary) MUST complete in under 3 clicks.

### IV. Performance
Optimize for fast initial load and responsive interactions. Minimize asset sizes, lazy-load non-critical resources, and ensure API responses complete within 500ms. Frontend MUST render initial content within 2 seconds.

### V. Simplicity
Avoid unnecessary dependencies. Start simple and add complexity only when justified. Prefer established patterns over novel solutions. Each new dependency MUST solve a problem that cannot be reasonably solved with existing tools.

### VI. Security & Privacy
Protect user data with industry-standard authentication. Passwords MUST be hashed with bcrypt. Access tokens MUST expire within 30 minutes. Support full account deletion. NEVER expose sensitive data in client-side code or logs.

### VII. Testing
Automated tests MUST accompany all features. Unit tests for business logic, contract tests for API endpoints, and E2E tests for critical user journeys (authentication, food logging). Tests MUST pass before merging to main branch.

### VIII. Version Control
All code changes MUST follow these practices:

**Commit Messages**: Use Conventional Commits format:
- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `docs(scope): description` - Documentation changes
- `refactor(scope): description` - Code restructuring
- `test(scope): description` - Test additions/changes
- `chore(scope): description` - Maintenance tasks

**Commit Scope**: Prefer atomic commits (one logical change) but related changes MAY be bundled when they form a cohesive unit. Each commit SHOULD leave the codebase in a working state. Commits SHOULD be suggested at natural stopping points: after completing a feature, fixing a bug, or finishing a logical unit of work.

**Branching**: All work MUST occur on feature branches. Branch naming: `###-feature-name` (e.g., `042-add-dark-mode`). Merge to main when ready.

## Technology Stack

- **Frontend**: React 18 with TypeScript, Vite build tool, React Router for navigation
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy ORM, Alembic migrations
- **Database**: PostgreSQL for persistent storage of users, diary entries, custom foods, and goals
- **Testing**: pytest (backend), Jest + React Testing Library (frontend), Playwright (E2E)
- **External APIs**: USDA FoodData Central for food search

## Quality Standards

- Valid HTML (W3C compliant)
- Accessible (WCAG 2.1 AA baseline)
- Mobile-responsive design
- Cross-browser compatibility (modern browsers)
- Secure authentication (JWT with access/refresh tokens)
- HTTPS required for all production connections
- Type safety enforced (TypeScript strict mode, Python type hints)

## Governance

This constitution guides all development decisions. Changes require documentation and justification. Amendment procedure:

1. Propose change with rationale in pull request
2. Review against existing principles for conflicts
3. Update version according to semantic versioning:
   - MAJOR: Backward incompatible principle changes
   - MINOR: New principles or expanded guidance
   - PATCH: Clarifications and typo fixes
4. Update Last Amended date upon merge

**Version**: 2.2.1 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-08
