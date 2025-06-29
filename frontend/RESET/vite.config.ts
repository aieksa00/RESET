/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/RESET',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  resolve: {
    alias: {
      HacksPage: 'RESET/features/HacksPage/src/index.ts',
      LandingPage: 'RESET/features/LandingPage/src/index.ts',
      CreateHackPage: 'RESET/features/CreateHackPage/src/index.ts',
      models: 'RESET/models/src/index.ts',
      SCService: 'RESET/sc-service/src/index.ts',
      HackDetailsPage: 'RESET/features/HackDetailsPage/src/index.ts',
      ChatWindow: 'RESET/features/ChatWindow/src/index.ts',
    },
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../dist/RESET',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
