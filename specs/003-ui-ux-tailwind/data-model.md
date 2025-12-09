# Data Model: UI/UX Tailwind Migration

**Feature**: 003-ui-ux-tailwind
**Date**: 2025-12-08

## Overview

This feature is frontend-only (TC-002). No backend database changes are required. The data model consists of client-side state management for theme preferences.

## Client-Side Entities

### ThemePreference

Represents the user's selected theme mode.

| Field | Type | Description |
|-------|------|-------------|
| value | `'light' \| 'dark' \| 'system'` | User's explicit preference |

**Storage**: `localStorage` key `'theme'`

**Default Value**: `'system'` (follows OS preference)

**Lifecycle**:
1. On app load: Read from localStorage, default to `'system'` if not set
2. On change: Write to localStorage, update DOM class
3. Never expires (persists indefinitely)

### ResolvedTheme

Represents the actual theme being applied (computed from preference + system setting).

| Field | Type | Description |
|-------|------|-------------|
| value | `'light' \| 'dark'` | The actual theme applied to the UI |

**Computation**:
```typescript
function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === 'system') {
    return systemDark ? 'dark' : 'light';
  }
  return preference;
}
```

## Design Tokens (CSS Custom Properties)

These are not database entities but are the semantic color values used throughout the UI.

### Color Token Schema

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--color-surface` | `#ffffff` | `#1f2937` | Page backgrounds |
| `--color-surface-secondary` | `#f3f4f6` | `#374151` | Card backgrounds |
| `--color-surface-tertiary` | `#e5e7eb` | `#4b5563` | Input backgrounds |
| `--color-content` | `#1f2937` | `#f9fafb` | Primary text |
| `--color-content-secondary` | `#6b7280` | `#9ca3af` | Secondary text |
| `--color-content-tertiary` | `#9ca3af` | `#6b7280` | Muted text |
| `--color-primary` | `#3b82f6` | `#60a5fa` | Primary actions |
| `--color-primary-hover` | `#2563eb` | `#93c5fd` | Primary hover state |
| `--color-border` | `#e5e7eb` | `#374151` | Borders, dividers |
| `--color-success` | `#22c55e` | `#4ade80` | Success states |
| `--color-warning` | `#f59e0b` | `#fbbf24` | Warning states |
| `--color-error` | `#ef4444` | `#f87171` | Error states |

### Spacing Scale

Uses Tailwind's default spacing scale (rem-based):

| Class | Value | Pixels (16px base) |
|-------|-------|-------------------|
| `p-1` | 0.25rem | 4px |
| `p-2` | 0.5rem | 8px |
| `p-3` | 0.75rem | 12px |
| `p-4` | 1rem | 16px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |

### Typography Scale

| Element | Size Class | Weight | Line Height |
|---------|-----------|--------|-------------|
| H1 | `text-3xl` | `font-bold` | `leading-tight` |
| H2 | `text-2xl` | `font-semibold` | `leading-tight` |
| H3 | `text-xl` | `font-semibold` | `leading-snug` |
| Body | `text-base` | `font-normal` | `leading-relaxed` |
| Small | `text-sm` | `font-normal` | `leading-normal` |
| Caption | `text-xs` | `font-medium` | `leading-normal` |

## State Transitions

### Theme State Machine

```
                    ┌─────────────────┐
                    │     system      │ ← Initial State
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────┐    ┌───────────┐    ┌───────────┐
    │   light   │◄──►│   dark    │◄──►│  system   │
    └───────────┘    └───────────┘    └───────────┘
```

**Transitions**: User can switch between any state via Settings page toggle.

### DOM Class State

| Theme Preference | System Pref | DOM State |
|------------------|-------------|-----------|
| `'light'` | (any) | No `dark` class |
| `'dark'` | (any) | Has `dark` class |
| `'system'` | light | No `dark` class |
| `'system'` | dark | Has `dark` class |

## Validation Rules

### ThemePreference
- Must be one of: `'light'`, `'dark'`, `'system'`
- Invalid values default to `'system'`

### Touch Target Size
- All interactive elements must have minimum dimensions of 44x44 pixels
- Applies to: buttons, links, inputs, toggles, tabs

### Viewport Support
- Minimum supported width: 320px
- Maximum tested width: 1920px
- Breakpoints: 640px (tablet), 1024px (desktop)

## No Backend Changes

Per TC-002, the following are explicitly NOT part of this data model:
- User table schema changes
- Theme preference API endpoints
- Database migrations
- Server-side session storage
