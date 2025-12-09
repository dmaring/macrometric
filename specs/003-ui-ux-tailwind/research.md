# Research: UI/UX Tailwind Migration

**Feature**: 003-ui-ux-tailwind
**Date**: 2025-12-08

## Research Topics

### 1. Tailwind CSS Dark Mode Strategy

**Decision**: Use class-based dark mode with three-state theme (light/dark/system)

**Rationale**:
- Class-based (`darkMode: 'class'`) provides full control over theme switching
- Allows users to override system preferences
- Supports the "system" option that follows OS preference
- Well-supported pattern with extensive documentation

**Alternatives Considered**:
- `darkMode: 'media'` - Rejected because it doesn't allow user override; purely follows system preference
- Tailwind v4 CSS-first approach - Considered but v3 is more stable and widely documented for production use

**Implementation**:
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

### 2. Theme Persistence Strategy

**Decision**: Store theme preference in localStorage with key `'theme'`

**Rationale**:
- localStorage persists across browser sessions
- No backend changes required (aligns with scope constraint TC-002)
- Works for both authenticated and unauthenticated users
- Simple implementation with broad browser support

**Alternatives Considered**:
- sessionStorage - Rejected because preference wouldn't persist across sessions
- Cookie - Rejected as unnecessary complexity; not sent to server
- Backend user preference - Out of scope per TC-002

**Implementation**:
```typescript
// Three valid values: 'light' | 'dark' | 'system'
localStorage.getItem('theme') // Read
localStorage.setItem('theme', 'dark') // Write
```

### 3. Preventing Flash of Wrong Theme (FOUC)

**Decision**: Add inline script in `index.html` before React loads

**Rationale**:
- Script executes synchronously during HTML parsing
- Applies correct theme class before any styled content renders
- Zero-dependency solution
- Standard industry practice

**Alternatives Considered**:
- React useLayoutEffect - Rejected because React loads too late, flash still occurs
- CSS-only solution - Not viable for class-based switching
- Server-side rendering - Out of scope

**Implementation**:
```html
<!-- index.html, in <head> before any content -->
<script>
  (function() {
    const theme = localStorage.getItem('theme') || 'system';
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### 4. Custom Brand Color Architecture

**Decision**: Use semantic color tokens in Tailwind config with CSS custom properties

**Rationale**:
- Semantic names (`primary`, `surface`, `text`) are more maintainable than literal colors
- CSS variables enable runtime theme switching without class regeneration
- Single source of truth for design tokens
- Easy to adjust brand colors globally

**Alternatives Considered**:
- Tailwind's default palette - Rejected per clarification (custom brand colors required)
- Hardcoded hex values throughout - Rejected for maintainability
- CSS-in-JS theming - Rejected to avoid additional dependencies (TC-003)

**Implementation**:
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens
        surface: {
          DEFAULT: 'var(--color-surface)',
          secondary: 'var(--color-surface-secondary)',
        },
        content: {
          DEFAULT: 'var(--color-content)',
          secondary: 'var(--color-content-secondary)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        // ... additional tokens
      },
    },
  },
}
```

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-surface: #ffffff;
    --color-surface-secondary: #f3f4f6;
    --color-content: #1f2937;
    --color-content-secondary: #6b7280;
    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;
  }

  .dark {
    --color-surface: #1f2937;
    --color-surface-secondary: #374151;
    --color-content: #f9fafb;
    --color-content-secondary: #9ca3af;
    --color-primary: #60a5fa;
    --color-primary-hover: #93c5fd;
  }
}
```

### 5. React Theme Context Architecture

**Decision**: Create ThemeContext with useTheme hook

**Rationale**:
- Provides global theme state access
- Handles localStorage sync and DOM class management
- Listens for system preference changes
- Clean separation of concerns

**Implementation**:
```typescript
// contexts/ThemeContext.tsx
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark'; // Actual applied theme
}

// hooks/useTheme.ts
export function useTheme() {
  return useContext(ThemeContext);
}
```

### 6. Responsive Breakpoints

**Decision**: Use Tailwind's default breakpoints with mobile-first approach

**Rationale**:
- Tailwind defaults align with spec requirements: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Mobile-first is the standard and matches Tailwind's design
- No custom breakpoints needed

**Breakpoints**:
| Name | Min-width | Matches Spec |
|------|-----------|--------------|
| (default) | 0px | Mobile (< 640px) |
| sm | 640px | Tablet start |
| lg | 1024px | Desktop |

### 7. Transition and Animation Handling

**Decision**: Use Tailwind's transition utilities with prefers-reduced-motion respect

**Rationale**:
- Tailwind has built-in `motion-reduce:` variant
- Consistent transition timing via utility classes
- Target: < 200ms for theme transitions (SC-005)

**Implementation**:
```tsx
// Standard interactive element
<button className="transition-colors duration-150 motion-reduce:transition-none">

// Theme transition on body
<body className="transition-colors duration-200 motion-reduce:duration-0">
```

## Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^3.4.0 | Core framework |
| postcss | ^8.4.0 | CSS processing |
| autoprefixer | ^10.4.0 | Vendor prefixes |

## Files to Create

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Tailwind configuration with custom colors |
| `postcss.config.js` | PostCSS pipeline setup |
| `src/contexts/ThemeContext.tsx` | Theme state management |
| `src/hooks/useTheme.ts` | Theme hook for components |

## Files to Delete (20 CSS files)

All existing `.css` files in components and pages directories will be removed as part of full CSS replacement (TC-001).
