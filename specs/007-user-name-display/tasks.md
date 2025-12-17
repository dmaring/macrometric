# Tasks: User Name & Username Display

**Input**: Design documents from `/specs/007-user-name-display/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No tests requested in feature specification - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with `backend/` and `frontend/` directories at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and initial setup for name/username fields

- [X] T001 Create database migration to add `name` and `username` columns to users table in backend/alembic/versions/
- [X] T002 Run database migration to update schema

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model and validation updates that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Update User model to add name and username fields with validation in backend/src/models/user.py
- [X] T004 [P] Update UserRegisterRequest schema to include name and username fields in backend/src/api/auth.py
- [X] T005 [P] Update UserResponse schema to include name and username fields in backend/src/api/auth.py
- [X] T006 [P] Update AuthResponse schema to include name and username fields in backend/src/api/auth.py
- [X] T007 Implement username uniqueness validation in backend/src/services/auth.py
- [X] T008 Update AuthService.register() to handle name and username fields in backend/src/services/auth.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Provide Name and Username During Registration (Priority: P1) 🎯 MVP

**Goal**: Enable users to provide their full name and username during registration, with both fields saved to database and returned in auth response.

**Independent Test**: Complete a new user registration with name and username fields, verify both are saved and returned in the response.

### Implementation for User Story 1

- [X] T009 [P] [US1] Update Register page to add name and username input fields in frontend/src/pages/Register/index.tsx
- [X] T010 [P] [US1] Add client-side validation for name (required, max 100 chars) in frontend/src/pages/Register/index.tsx
- [X] T011 [P] [US1] Add client-side validation for username (required, max 30 chars, alphanumeric/underscore/hyphen only) in frontend/src/pages/Register/index.tsx
- [X] T012 [P] [US1] Update authService.register() to send name and username in request body in frontend/src/services/auth.ts
- [X] T013 [P] [US1] Update auth context types to include name and username in User interface in frontend/src/contexts/AuthContext.tsx
- [X] T014 [US1] Update backend register endpoint to validate name and username (non-empty, length limits) in backend/src/api/auth.py
- [X] T015 [US1] Add error handling for duplicate username in registration flow in backend/src/services/auth.py
- [X] T016 [US1] Display username uniqueness error in Register page UI in frontend/src/pages/Register/index.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register with name and username

---

## Phase 4: User Story 2 - See My Username in the Application Header (Priority: P1) 🎯 MVP

**Goal**: Display the logged-in user's username in the application header next to the Settings button.

**Independent Test**: Log in and verify the user's username appears in the header area near the navigation controls.

### Implementation for User Story 2

- [X] T017 [P] [US2] Update Diary page header to display username next to Settings button in frontend/src/pages/Diary/index.tsx
- [X] T018 [P] [US2] Update Settings page header to display username next to Logout button in frontend/src/pages/Settings/index.tsx
- [X] T019 [US2] Handle null/undefined username gracefully (display email as fallback for existing users) in frontend/src/pages/Diary/index.tsx
- [X] T020 [US2] Handle null/undefined username gracefully (display email as fallback for existing users) in frontend/src/pages/Settings/index.tsx
- [X] T021 [US2] Update login endpoint to return name and username in AuthResponse in backend/src/api/auth.py
- [X] T022 [US2] Update refresh token endpoint to return user data with name and username in backend/src/api/auth.py
- [X] T023 [US2] Update /auth/me endpoint to return name and username in UserResponse in backend/src/api/auth.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - registration captures data and header displays username

---

## Phase 5: User Story 3 - Edit My Name and Username in Settings (Priority: P2)

**Goal**: Allow users to view and edit their name and username from the Settings page with validation and immediate header update.

**Independent Test**: Navigate to Settings, change name and/or username, save, verify changes persist and header updates immediately.

### Implementation for User Story 3

- [X] T024 [P] [US3] Create profile editing section in Settings page with name and username fields in frontend/src/pages/Settings/index.tsx
- [X] T025 [P] [US3] Add client-side validation for profile fields (same rules as registration) in frontend/src/pages/Settings/index.tsx
- [X] T026 [P] [US3] Create PUT /auth/profile endpoint for updating user profile in backend/src/api/auth.py
- [X] T027 [P] [US3] Create UpdateProfileRequest schema with name and username fields in backend/src/api/auth.py
- [X] T028 [US3] Implement ProfileService.update_profile() with validation and uniqueness check in backend/src/services/auth.py
- [X] T029 [US3] Create updateProfile() service method in frontend/src/services/auth.ts
- [X] T030 [US3] Implement profile update form submission handler in frontend/src/pages/Settings/index.tsx
- [X] T031 [US3] Display success message on successful profile update in frontend/src/pages/Settings/index.tsx
- [X] T032 [US3] Display validation errors (required fields, username taken) in frontend/src/pages/Settings/index.tsx
- [X] T033 [US3] Update auth context state after successful profile update to trigger header re-render in frontend/src/contexts/AuthContext.tsx

**Checkpoint**: All user stories should now be independently functional - registration, display, and editing all work

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final touches

- [X] T034 [P] Add ARIA labels for name and username inputs across all forms for accessibility
- [X] T035 [P] Add loading states during profile updates in Settings page
- [X] T036 [P] Add optimistic UI updates for profile changes (update header immediately, rollback on error)
- [X] T037 [P] Ensure username display is responsive and truncates gracefully on mobile
- [X] T038 Update CLAUDE.md with documentation of new user fields and profile endpoint
- [X] T039 Verify existing users without name/username can still use the app (email fallback works)
- [X] T040 Test username validation edge cases (special characters, empty, whitespace-only, too long)
- [X] T041 Test duplicate username error handling across registration and profile update flows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational - Should integrate with US1 to display newly registered username
  - User Story 3 (P2): Can start after Foundational - Builds on US1 and US2 by allowing edits
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent but integrates with US1 (displays username from registration)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent but builds on US1/US2 (edits what was created, updates what is displayed)

### Within Each User Story

- Frontend and backend tasks can often run in parallel (marked [P])
- Schema updates before service logic
- Service logic before endpoint implementation
- API client updates parallel with backend endpoints
- UI components parallel with API updates
- Integration/error handling after core implementation

### Parallel Opportunities

- All Setup tasks can run sequentially (T001 then T002)
- All Foundational schema tasks (T003-T006) marked [P] can run in parallel
- Service validation tasks (T007-T008) must run after schema updates
- Once Foundational completes:
  - User Story 1 tasks T009-T013 (all frontend) can run in parallel
  - User Story 1 tasks T014-T016 (backend validation) can run in parallel with frontend
  - User Story 2 tasks T017-T020 (frontend display) can run in parallel
  - User Story 2 tasks T021-T023 (backend auth endpoints) can run in parallel with frontend
  - User Story 3 tasks T024-T025 (frontend form) can run in parallel
  - User Story 3 tasks T026-T027 (backend schemas) can run in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch frontend tasks together:
Task T009: "Update Register page to add name and username input fields"
Task T010: "Add client-side validation for name"
Task T011: "Add client-side validation for username"
Task T012: "Update authService.register() to send name and username"
Task T013: "Update auth context types to include name and username"

# In parallel, launch backend tasks:
Task T014: "Update backend register endpoint to validate name and username"
Task T015: "Add error handling for duplicate username in registration"
Task T016: "Display username uniqueness error in Register page UI"
```

---

## Parallel Example: User Story 2

```bash
# Launch all frontend header updates together:
Task T017: "Update Diary page header to display username"
Task T018: "Update Settings page header to display username"
Task T019: "Handle null username gracefully in Diary"
Task T020: "Handle null username gracefully in Settings"

# In parallel, launch backend auth endpoint updates:
Task T021: "Update login endpoint to return name and username"
Task T022: "Update refresh token endpoint to return user data"
Task T023: "Update /auth/me endpoint to return name and username"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (database migration)
2. Complete Phase 2: Foundational (model and schema updates) - CRITICAL
3. Complete Phase 3: User Story 1 (registration with name/username)
4. Complete Phase 4: User Story 2 (display username in header)
5. **STOP and VALIDATE**: Test registration and header display independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test registration independently → Works!
3. Add User Story 2 → Test header display independently → Works!
4. **MVP Complete!** Users can register with name/username and see it displayed
5. Add User Story 3 → Test profile editing independently → Works!
6. Complete Polish phase → Full feature complete

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (critical path)
2. Once Foundational is done:
   - Developer A: User Story 1 (registration)
   - Developer B: User Story 2 (header display)
   - Developer C: User Story 3 (profile editing)
3. Stories integrate naturally (US2 displays what US1 creates, US3 edits what US1 creates)

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- MVP = User Stories 1 + 2 (register with name/username + display in header)
- User Story 3 is enhancement (editing profile)
- Existing users without name/username must be handled gracefully (email fallback)
- Username must be unique across all users
- Name max 100 chars, username max 30 chars
- Username alphanumeric/underscore/hyphen only
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
