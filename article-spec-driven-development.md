# Building a Production App with Spec-Driven Development: Lessons from Macrometric

I just built a full-stack nutrition tracking app called **macrometric** using an approach that's been gaining serious traction in 2025: **spec-driven development**. Instead of iteratively prompting AI coding assistants with vague instructions and hoping for the best, I wrote detailed specifications first, then let AI agents handle the implementation. The results? 186 completed tasks, 94% test coverage, and a working production app—all with dramatically less chaos than traditional "vibe coding."

First, a little about myself. I've been in the tech industry for nearly 20 years and a curious technologist my entire life. In my customer facing roles at Cisco, Docker, and Google I prided myself on keeping up with the latest technologies and trends to better support and advocate for my customers. I lean technical in my interests and will be complementing Carly's voice as a guest writer periodically.

Here's what I learned building macrometric entirely with this approach, and why you might want to try it for your next project.

## The Problem with "Vibe Coding"

If you've used AI coding assistants like GitHub Copilot, Claude Code, or Cursor, you've probably experienced this pattern:

1. Give AI a vague prompt: "Add user authentication"
2. Get back some code that sort of works
3. Realize it doesn't handle edge cases
4. Prompt again: "Add password reset functionality"
5. Watch as the AI makes assumptions that conflict with your earlier code
6. Spend hours debugging inconsistencies

This is what the industry now calls **"vibe coding"**—a chaotic, reactive development process where intent is communicated through iterative prompts rather than structured specifications. It works for small experiments, but falls apart at production scale.

## Enter Spec-Driven Development

Spec-driven development (SDD) flips the script: **write specifications before code**. Your spec becomes the single source of truth—a contract defining *what* you're building and *why*, without dictating *how*. AI agents then use these specs to generate consistent, testable implementations.

The core philosophy: **"Intent is the source of truth."**

Instead of:
```
You → Prompt → AI → Code → Bugs → More prompts → Fixes → Hope
```

You get:
```
You → Spec → AI → Plan → Tasks → Implementation → Tests (that pass)
```

## Choosing a Framework: The Landscape in 2025

Before starting macrometric, I researched the major players in the spec-driven development space:

### **GitHub Spec Kit**
- **Philosophy**: Structured, gated 4-phase workflow (Specify → Plan → Tasks → Implement)
- **Best for**: Greenfield projects (0→1), teams needing strict compliance
- **Strengths**: Deep architecture planning, comprehensive templates, explicit checkpoints
- **Trade-offs**: More verbose specs (~800 lines), steeper learning curve, 8 AI commands

### **OpenSpec (Fission AI)**
- **Philosophy**: Lightweight, change-centric, brownfield-focused
- **Best for**: Evolving existing codebases (1→n), rapid iteration
- **Strengths**: Simple setup (npm install), concise docs (~250 lines), 3 commands
- **Trade-offs**: Less structure for complex greenfield projects, no auto git branching

### **BMAD-METHOD**
- **Philosophy**: Agentic agile with specialized AI personas and role-planning
- **Best for**: Complex domain logic, early architecture debates
- **Strengths**: 55% faster completion in studies, deep role specialization
- **Trade-offs**: Most complex setup, potentially overkill for straightforward apps

### **My Choice: Spec Kit (with customization)**

I chose **GitHub Spec Kit** because macrometric was a greenfield project that needed:
- Clear architectural boundaries (React frontend + FastAPI backend)
- Consistent patterns across multiple features
- Strong testing discipline from day one
- A framework that could scale from MVP to production

The selection guidance from my research was clear: *"For pioneering greenfield projects with straightforward architecture but strict compliance, spec-kit is safer."*

## The Macrometric Journey: Building with Structure

### Phase 0: Constitution as Foundation

Before writing a single line of code, I created a **project constitution** (`specs/.specify/memory/constitution.md`)—a living document defining:

**Core Principles:**
1. **Modern Web Application**: React SPA + FastAPI backend
2. **Semantic HTML**: Accessibility and SEO first
3. **User-Centric Design**: Core workflows in <3 clicks, <500ms API responses
4. **Performance**: Initial render <2s, optimize for speed
5. **Simplicity**: No unnecessary dependencies
6. **Security & Privacy**: bcrypt passwords, 30min access tokens, HTTPS required
7. **Testing**: Automated tests for all features (pytest, Jest, Playwright)
8. **Version Control**: Conventional commits, atomic changes, feature branches

**Technology Stack:**
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS
- Backend: FastAPI (Python 3.11+), SQLAlchemy, PostgreSQL
- Testing: pytest, Jest + React Testing Library, Playwright E2E

This constitution became **guardrails for the AI**. Every feature spec was validated against these principles. When the AI suggested adding a new framework or pattern, the constitution provided clear rejection criteria.

### The 4-Phase Workflow

Every feature in macrometric followed this rigorous process:

#### **1. Specify** (`/speckit.specify`)

I'd describe a feature in natural language:

```bash
/speckit.specify "Implement Goals and Custom Foods management in Settings page"
```

The AI would:
1. Generate a short branch name (`005-settings-goals-foods`)
2. Create a feature spec (`specs/005-settings-goals-foods/spec.md`)
3. Fill in structured sections:
   - **User Scenarios** (Given/When/Then acceptance criteria)
   - **Functional Requirements** (FR-001, FR-002, etc.)
   - **Success Criteria** (measurable, technology-agnostic)
   - **Edge Cases**
4. Run a quality checklist validation

**Real Example** from `005-settings-goals-foods/spec.md`:

```markdown
### User Story 1 - Daily Goals Management (Priority: P1)

A user wants to view and edit their daily nutritional goals (calories,
protein, carbs, fat) from the Settings page.

**Why this priority**: Goals are fundamental to the app's value proposition.

**Independent Test**: Can be fully tested by navigating to Settings > Goals,
entering/modifying goal values, saving, and verifying the diary page shows
updated progress bars.

**Acceptance Scenarios**:

1. **Given** a user navigates to Settings, **When** they click the "Goals"
   tab, **Then** they see their current daily goals or a prompt to set goals
2. **Given** a user enters invalid data (negative numbers, non-numeric values),
   **When** they try to save, **Then** they see clear error messages
```

The spec was **completely technology-agnostic**. No mention of React, FastAPI, or databases. Just user intent.

#### **2. Plan** (`/speckit.plan`)

The AI then created a technical plan (`plan.md`):

```markdown
## Technical Context

**Language/Version**: TypeScript 4.9+, React 18; Python 3.11+
**Primary Dependencies**: React, Axios, FastAPI, SQLAlchemy
**Storage**: PostgreSQL (existing tables: `daily_goals`, `custom_foods`)
**Testing**: Jest, React Testing Library, pytest

## Constitution Check ✅

### I. Modern Web Application ✅
**Status**: PASS
**Rationale**: This feature extends the existing React SPA frontend.
No architectural changes required.

### V. Simplicity ✅
**Status**: PASS
**Rationale**: Zero new dependencies. Reuses existing API services,
Tailwind patterns, validation approaches.
```

Every feature was validated against **all 8 constitutional principles** before proceeding. This caught architectural drift early.

The plan also included:
- **Data models** (DailyGoal entity with calories, protein, carbs, fat)
- **API contracts** (GET/PUT endpoints with request/response schemas)
- **Source structure** (which files to create/modify)
- **Performance targets** (form submissions <500ms)

#### **3. Tasks** (`/speckit.tasks`)

The AI broke the plan into **atomic, testable tasks** following strict TDD:

```markdown
## Phase 1: Goals Management (US1)

### Tests for US1 (Write FIRST - must FAIL)

- [ ] T001 [P] [US1] Write goals API contract tests in backend/tests/contract/test_goals.py
- [ ] T002 [P] [US1] Write GoalInput component tests in frontend/tests/components/GoalInput.test.tsx

### Backend Implementation for US1

- [ ] T003 [US1] Create DailyGoal model in backend/src/models/daily_goal.py
- [ ] T004 [US1] Create migration for DailyGoal table in backend/alembic/versions/
- [ ] T005 [US1] Implement goals API endpoints (GET/PUT /goals) in backend/src/api/goals.py

### Frontend Implementation for US1

- [ ] T006 [US1] Create GoalInput component in frontend/src/components/GoalInput/index.tsx
- [ ] T007 [US1] Update MacroDisplay to show progress toward goals
- [ ] T008 [US1] Run frontend US1 tests - verify PASS
```

**Key patterns:**
- `[P]` = Can run in parallel (different files, no dependencies)
- `[US1]` = Maps to User Story 1 from the spec
- **TDD mandate**: Write tests → FAIL → Implement → PASS

For macrometric, this generated **186 total tasks** across 5 major features.

#### **4. Implement** (`/speckit.implement`)

Finally, the AI executed tasks sequentially:

1. Write the test (must fail)
2. Implement the feature
3. Run tests (must pass)
4. Mark task complete
5. Move to next task

**Real outcome** from the settings-goals-foods feature:
- **32 passing tests** (100% of test tasks)
- **Optimistic UI updates** with rollback on error
- **Full ARIA labels** and accessibility
- **Form validation** preventing all invalid submissions

## Lessons Learned: The Good

### 1. **Forced Architectural Thinking**

Specs made me answer hard questions upfront:
- What are the independent user journeys?
- Which features can be tested in isolation?
- What are the edge cases?

Example: The spec forced me to decide *before coding* how deleted custom foods should behave in saved meals (answer: retain nutritional snapshot, show "(deleted)" indicator).

### 2. **Constitution Prevented Complexity Creep**

Every feature passed the "Simplicity" constitutional check:
- **FR-005 (US6)**: "Zero new dependencies. Reuses existing services."
- **FR-012 (US3)**: "No abstraction layers introduced."

Without the constitution, I probably would have added Redux, a component library, or some other "nice-to-have" that wasn't necessary.

### 3. **Auto-Generated Project Documentation**

The most magical part: **CLAUDE.md auto-updates** from plan files.

After implementing the Tailwind migration (feature 003):

```markdown
## Styling & Theming

### Tailwind CSS
The frontend uses **Tailwind CSS 3.4+** with a custom design system:

- **Theme Support**: Dark, light, and system preference modes
- **Color System**: Semantic tokens via CSS custom properties
- **Design Patterns**:
  - Cards: `bg-surface-secondary rounded-lg border border-border shadow-sm`
  - Buttons: `px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover`
```

This was **automatically extracted** from `specs/003-ui-ux-tailwind/plan.md`. Every new developer gets up-to-date architecture docs without manual wiki maintenance.

### 4. **Test Coverage by Default**

Traditional development: "We'll add tests later" (spoiler: you won't).

Spec-driven development: **47 test tasks out of 186 total tasks** (25% of work is testing).

Result: **94% backend test coverage, full frontend test suites, E2E tests for critical paths**.

### 5. **Consistent Patterns Across Features**

Because every feature went through the same Specify → Plan → Tasks flow, patterns emerged naturally:

- All forms use the same validation approach
- All API errors handled identically
- All components follow the same Tailwind structure
- All tests follow the same Given/When/Then format

No style guide necessary—the templates enforced consistency.

## Lessons Learned: The Challenges

### 1. **Initial Time Investment**

Learning the framework took time. My first spec took **2 hours** to write (would've been 10 minutes of coding). By feature 5, specs took **20 minutes**.

The payoff: Implementation speed increased dramatically. Feature 005 (settings pages) went from spec to 32 passing tests in **one focused session**.

### 2. **Spec Quality = Output Quality**

Vague specs produce vague implementations. I learned this the hard way.

**Bad spec (too vague):**
```markdown
FR-001: System MUST allow users to manage goals
```

**Good spec (testable, unambiguous):**
```markdown
FR-003: System MUST allow users to edit and save their daily goals
with numeric input fields

FR-004: System MUST validate goal inputs (numeric values, non-negative)
and display clear error messages for invalid data
```

The AI can only be as precise as your requirements.

### 3. **Clarification Overload**

Early on, I'd pepper specs with `[NEEDS CLARIFICATION]` markers. The `/speckit.specify` command limits you to **3 maximum** for good reason.

**Before (too many clarifications):**
- How should authentication work? [NEEDS CLARIFICATION]
- What database should we use? [NEEDS CLARIFICATION]
- Should we support mobile? [NEEDS CLARIFICATION]
- What about password reset? [NEEDS CLARIFICATION]

**After (informed guesses + assumptions):**
```markdown
## Assumptions
- Authentication: Email/password (industry standard for web apps)
- Database: PostgreSQL (determined in plan.md)
- Mobile: Responsive design (WCAG 2.1 AA, 44px touch targets)
- Password reset: Email-based flow (document in onboarding)
```

Only use `[NEEDS CLARIFICATION]` for decisions that **significantly impact scope or user experience**.

### 4. **Template Customization Required**

The default Spec Kit templates are generic. I customized mine for nutrition tracking:

Added to `spec-template.md`:
- **Nutritional Data Requirements** (calories, protein, carbs, fat as standard)
- **USDA API Integration** patterns
- **Food Search Performance** targets (<2s results)

Your domain will need similar customizations.

### 5. **Constitution Amendments are Expensive**

When I added the "Version Control" principle (Principle VIII) to the constitution mid-project, I had to:

1. Update the constitution with a sync impact report
2. Verify all existing specs still passed
3. Update all templates to reference the new principle
4. Re-validate plan files

**Lesson**: Get your constitution right early. Changes propagate everywhere.

## What I'd Do Differently: OpenSpec for Iteration

Spec Kit excelled for greenfield development, but I'm curious about **OpenSpec** for the next phase.

**Why?** OpenSpec is optimized for **modifying existing behavior** (1→n):
- Lightweight change tracking (`openspec/changes/` for proposals)
- Faster iteration (no separate task breakdown phase)
- Better for brownfield codebases

**When I'd use each:**
- **Spec Kit**: New project, complex domain, need strict compliance
- **OpenSpec**: Existing codebase, rapid iteration, simpler changes
- **BMAD**: Complex business logic, multiple stakeholder roles

## Practical Takeaways for Your First Spec-Driven Project

### 1. **Start Small**
Don't spec your entire app upfront. Build **one feature** with the workflow to learn the patterns. I started with authentication (foundational but familiar).

### 2. **Invest in Your Constitution**
Spend a day writing your project principles, tech stack, and quality standards. This is **the most valuable artifact** you'll create.

Include:
- Core architectural constraints
- Security requirements
- Performance targets
- Testing philosophy

### 3. **Use Checklist Validation Ruthlessly**

The `/speckit.specify` command generates a quality checklist. Actually use it:

```markdown
## Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] All mandatory sections completed

## Requirement Completeness
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Edge cases are identified
```

If items fail, **fix the spec before planning**. Bad specs compound into bad plans into bad code.

### 4. **Embrace the TDD Discipline**

Write tests first. Make them fail. Then implement. This felt slow initially but prevented **massive** debugging sessions later.

Macrometric's test suite:
- 159/169 backend tests (94%)
- Full frontend coverage
- E2E tests for authentication + food logging

All written **before implementation**.

### 5. **Don't Over-Clarify**

Max 3 `[NEEDS CLARIFICATION]` markers per spec. Make informed guesses and document assumptions instead.

**Ask AI for clarification when:**
- Decision significantly impacts scope
- Multiple interpretations with different implications
- No reasonable default exists

**Don't ask AI when:**
- Industry standards exist (use those)
- Your constitution already defines it
- You can make a reasonable guess

### 6. **Let Templates Guide You**

The templates are training wheels. Use them strictly for your first 2-3 features, then customize based on patterns you discover.

I added domain-specific sections after feature 2:
- **USDA API Integration** patterns
- **Nutritional Data Validation** rules
- **Macro Display** standards

## The Future: AI Needs Adult Supervision

Here's my controversial take: **Spec-driven development is adult supervision for AI coding.**

AI agents are incredible at implementation but terrible at product direction. They need:

1. **Clear intent** (specs)
2. **Architectural boundaries** (constitution)
3. **Quality gates** (checklists)
4. **Structured feedback** (test-driven development)

Without these, you get vibe coding—fast but chaotic, productive but unpredictable.

With spec-driven development, you get:
- **95%+ accuracy** on first implementation
- **Consistent patterns** across features
- **Living documentation** that stays current
- **Test coverage** that actually exists

Is it slower initially? Yes. My first spec took 2 hours.

Is it faster overall? **Absolutely.** Feature 5 went from idea to 32 passing tests in one session. No debugging. No "let me fix that" prompts. Just working code.

## Try It Yourself

Macrometric is **open source** and fully documented with all specs, plans, and tasks visible in the `specs/` directory:

- `001-macro-calorie-tracker` - Initial MVP (186 tasks)
- `003-ui-ux-tailwind` - Complete design system migration
- `005-settings-goals-foods` - Settings pages with full CRUD

Each feature includes:
- **spec.md** - Technology-agnostic requirements
- **plan.md** - Technical design with constitution checks
- **tasks.md** - Atomic TDD tasks
- **Implementation** - The actual working code

Clone it. Read the specs. See how intent translates to implementation.

The tools are free (Spec Kit, OpenSpec are both MIT-licensed). The learning curve is real. But if you're building production software with AI assistants in 2025, **structured beats chaotic every time**.

---

*Want to dive deeper? Check out the full macrometric source code on GitHub, or explore the alternatives: OpenSpec for brownfield projects, BMAD-METHOD for complex domain logic, or stick with Spec Kit for greenfield work.*

*Questions? Hit me up—I'm still learning, but happy to share what worked (and what didn't) in this wild new world of spec-driven AI development.*
