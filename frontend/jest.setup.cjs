// Mock import.meta for Jest environment
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:8000/api/v1',
      },
    },
  },
});
