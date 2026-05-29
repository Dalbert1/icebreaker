import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Unit tests for the pure POC logic (store reducer, thaw model, scoring). These
// complement — they don't replace — the Playwright visual walk (`npm run shot`),
// which remains the primary verification loop for UI. The react plugin lets us
// import `store.tsx` (and, transitively, the bundled image assets in the mock
// profiles) without a browser environment.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
