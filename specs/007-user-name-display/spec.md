# Feature Specification: User Name & Username Display

**Feature Branch**: `007-user-name-display`
**Created**: 2025-12-17
**Status**: Draft
**Input**: User description: "Add user name and username fields to the application. Users should provide their name and username during registration. Both should be stored in the database and returned in authentication responses. The username will be displayed in the application header next to the Settings button. Both fields should be editable in settings."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provide Name and Username During Registration (Priority: P1)

As a new user, I want to provide my full name and choose a username when I register so that my account has my real identity stored and a display name I prefer to be addressed by.

**Why this priority**: Registration is the entry point for all users. Without capturing both fields at registration, the feature cannot function. This is the foundational data collection step.

**Independent Test**: Can be fully tested by completing a new user registration with name and username fields and verifying both are saved and returned in the response.

**Acceptance Scenarios**:

1. **Given** I am on the registration page, **When** I view the form, **Then** I see required name and username fields along with email and password fields
2. **Given** I am registering, **When** I submit the form without entering a name or username, **Then** I see validation errors indicating both fields are required
3. **Given** I am registering, **When** I enter a valid name, username, email, and password and submit, **Then** my account is created with both stored
4. **Given** I just completed registration, **When** I am redirected to the application, **Then** my username is immediately visible in the header

---

### User Story 2 - See My Username in the Application Header (Priority: P1)

As a logged-in user, I want to see my username displayed in the application header so that I can confirm I'm logged into the correct account and see my preferred display name.

**Why this priority**: This is the primary user-facing outcome of the feature. Users expect to see their chosen identity reflected in the interface.

**Independent Test**: Can be fully tested by logging in and verifying the user's username appears in the header area near the navigation controls.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I view any page with the application header, **Then** I see my username displayed next to the Settings button
2. **Given** I registered with username "johnny123", **When** I view the header, **Then** I see "johnny123" clearly visible
3. **Given** I log out and log in as a different user, **When** I view the header, **Then** I see the new user's username displayed

---

### User Story 3 - Edit My Name and Username in Settings (Priority: P2)

As a registered user, I want to edit my name and username in the settings so that I can correct mistakes or update them if they change.

**Why this priority**: While important for user control, this is a secondary flow. Users can still use the application without editing their profile.

**Independent Test**: Can be fully tested by navigating to settings, changing the name and/or username, saving, and verifying the changes persist.

**Acceptance Scenarios**:

1. **Given** I am on the Settings page, **When** I look for profile options, **Then** I see my current name and username in editable fields
2. **Given** I am editing my profile in Settings, **When** I change my name and/or username and save, **Then** I see a confirmation that my profile was updated
3. **Given** I just updated my username, **When** I view the application header, **Then** I see my new username displayed immediately
4. **Given** I am editing my profile, **When** I try to save an empty name or username, **Then** I see validation errors indicating both fields are required

---

### Edge Cases

- What happens when a user enters a very long name (100+ characters)? The system should accept names up to 100 characters.
- What happens when a user enters a very long username? The system should limit usernames to 30 characters maximum.
- What happens when a user enters special characters in their name? The system should accept international characters, accents, and common name punctuation (hyphens, apostrophes).
- What happens when a user enters special characters in their username? The system should only allow alphanumeric characters, underscores, and hyphens in usernames.
- What happens when a user enters only whitespace? The system should treat this as empty and show a validation error.
- How does the system handle existing users who registered before this feature? Existing users will have null/empty name and username fields and should be allowed to add them in Settings. Their email will be displayed in the header until they set a username.
- What happens when a user tries to register or change to an already-taken username? The system should display a clear error message indicating the username is taken and prompt the user to choose a different one.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST collect a name from users during registration
- **FR-002**: System MUST collect a username from users during registration
- **FR-003**: System MUST require both name and username fields during registration (non-empty, non-whitespace)
- **FR-004**: System MUST store the user's name and username persistently with their account
- **FR-005**: System MUST return the user's name and username in authentication responses (login, registration, token refresh)
- **FR-006**: System MUST display the logged-in user's username in the application header
- **FR-007**: System MUST position the username display near the Settings button in the header
- **FR-008**: Users MUST be able to view their current name and username in the Settings page
- **FR-009**: Users MUST be able to edit and save changes to their name and username in Settings
- **FR-010**: System MUST validate profile changes (both fields required, non-empty) before saving
- **FR-011**: System MUST accept names containing letters, spaces, hyphens, apostrophes, and international characters
- **FR-012**: System MUST limit name length to 100 characters maximum
- **FR-013**: System MUST limit username to alphanumeric characters, underscores, and hyphens only
- **FR-014**: System MUST limit username length to 30 characters maximum
- **FR-015**: System MUST enforce username uniqueness (no two users can have the same username)
- **FR-016**: System MUST display a clear error when a user attempts to register or change to an already-taken username
- **FR-017**: System MUST handle existing users without name/username gracefully (display email until they set a username)

### Key Entities

- **User**: Represents a registered user of the application. Extended to include:
  - **name**: The user's full name (for record-keeping, up to 100 characters)
  - **username**: The user's chosen display name (shown in header, up to 30 characters, alphanumeric/underscore/hyphen only)

  Both fields are required for new registrations and optional for existing users (for backward compatibility).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new user registrations include name and username fields that are saved and retrievable
- **SC-002**: Users can see their username displayed in the header within 1 second of page load
- **SC-003**: Users can update their name and username in Settings and see changes reflected immediately (within 2 seconds)
- **SC-004**: Registration form completion time increases by no more than 15 seconds due to the additional fields
- **SC-005**: Validation errors are displayed clearly and users can correct and resubmit without page refresh
- **SC-006**: 100% of existing users can access the application without errors (graceful handling of missing name/username)

## Clarifications

### Session 2025-12-17

- Q: How should the name be displayed in the header when space is limited? → A: Display the username instead of the name. Store both name (full name) and username (display name), but show username in the header.
- Q: Should usernames be unique? → A: Yes, usernames must be unique (no two users can have the same username)

## Assumptions

- The name is a single field (not split into first/last name) to keep the user experience simple
- The name is for record-keeping purposes and not displayed prominently in the UI
- The username is the primary display identifier shown in the header
- Usernames must be unique across all users
- The application header is present on all authenticated pages (Diary, Settings, etc.)
- Existing users without a username will see their email displayed until they add a username in Settings
