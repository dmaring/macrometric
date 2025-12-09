# Quickstart: UI/UX Tailwind Migration

**Feature**: 003-ui-ux-tailwind
**Date**: 2025-12-08

## Prerequisites

- Node.js 18+
- npm 9+
- Existing macrometric frontend running

## Setup Steps

### 1. Install Tailwind CSS Dependencies

```bash
cd frontend
npm install -D tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0
```

### 2. Initialize Tailwind Configuration

```bash
npx tailwindcss init -p
```

This creates:
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

### 3. Configure Tailwind

Replace `tailwind.config.js` content:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--color-surface)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)',
        },
        content: {
          DEFAULT: 'var(--color-content)',
          secondary: 'var(--color-content-secondary)',
          tertiary: 'var(--color-content-tertiary)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
    },
  },
  plugins: [],
}
```

### 4. Update index.css

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-surface: #ffffff;
    --color-surface-secondary: #f3f4f6;
    --color-surface-tertiary: #e5e7eb;
    --color-content: #1f2937;
    --color-content-secondary: #6b7280;
    --color-content-tertiary: #9ca3af;
    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;
    --color-border: #e5e7eb;
    --color-success: #22c55e;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
  }

  .dark {
    --color-surface: #1f2937;
    --color-surface-secondary: #374151;
    --color-surface-tertiary: #4b5563;
    --color-content: #f9fafb;
    --color-content-secondary: #9ca3af;
    --color-content-tertiary: #6b7280;
    --color-primary: #60a5fa;
    --color-primary-hover: #93c5fd;
    --color-border: #374151;
    --color-success: #4ade80;
    --color-warning: #fbbf24;
    --color-error: #f87171;
  }

  body {
    @apply bg-surface text-content transition-colors duration-200;
  }
}
```

### 5. Add FOUC Prevention Script

Update `index.html`, add this script in `<head>` before any other content:

```html
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

### 6. Create Theme Context

Create `src/contexts/ThemeContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const isDark = theme === 'dark' ||
        (theme === 'system' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
        setResolvedTheme('dark');
      } else {
        root.classList.remove('dark');
        setResolvedTheme('light');
      }
    };

    updateTheme();

    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### 7. Wrap App with ThemeProvider

Update `src/App.tsx`:

```typescript
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* existing app content */}
    </ThemeProvider>
  );
}
```

### 8. Verify Setup

```bash
npm run dev
```

Open browser DevTools and verify:
1. Tailwind classes are being applied
2. Toggle system dark mode - app should respond (if theme is 'system')
3. No console errors

## Common Tailwind Class Patterns

### Layout
```tsx
// Container with max-width and padding
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

// Flexbox centering
<div className="flex items-center justify-center">

// Grid layout
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Components
```tsx
// Button
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors min-h-[44px]">

// Card
<div className="bg-surface-secondary rounded-lg p-4 border border-border shadow-sm">

// Input
<input className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
```

### Responsive
```tsx
// Mobile-first responsive
<div className="p-2 sm:p-4 lg:p-6">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Stack on mobile, row on tablet+
<div className="flex flex-col sm:flex-row">
```

### Dark Mode
```tsx
// Explicit dark mode override (if needed beyond CSS vars)
<div className="bg-white dark:bg-gray-800">
```

## Troubleshooting

### Styles Not Applying
1. Ensure `content` paths in `tailwind.config.js` include all source files
2. Verify `index.css` is imported in `main.tsx`
3. Run `npm run dev` to rebuild

### Dark Mode Not Working
1. Check `darkMode: 'class'` in config
2. Verify FOUC script is in `index.html` `<head>`
3. Check localStorage value: `localStorage.getItem('theme')`

### Flash of Wrong Theme
1. Ensure inline script is BEFORE any stylesheets or other scripts
2. Script must be synchronous (no `async` or `defer`)
