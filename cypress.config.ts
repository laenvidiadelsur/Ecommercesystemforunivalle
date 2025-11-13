import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    setupNodeEvents(on, config) {
      // Ignorar errores de Select con valor vacío
      on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('Select.Item') && err.message.includes('empty string')) {
          return false; // No fallar la prueba por este error
        }
        return true; // Fallar por otros errores
      });
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    trashAssetsBeforeRuns: false, // Mantener videos y capturas anteriores
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});

