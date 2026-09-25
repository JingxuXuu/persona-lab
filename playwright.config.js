import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/pages',
  use: { baseURL: 'http://127.0.0.1:3004/persona-lab/' },
  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 3004 --strictPort --base /persona-lab/',
    url: 'http://127.0.0.1:3004/persona-lab/',
    reuseExistingServer: false,
  },
});
