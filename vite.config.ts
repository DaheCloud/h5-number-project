import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = (import.meta as any).env ?? loadEnv(mode, process.cwd(), 'VITE_');
  const rawBase = (env.VITE_BASE_URL || '/').trim();
  let base = rawBase;
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return {
    base,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [vue(), tailwindcss()],
    server: {
      fs: {
        allow: ['../../'],
      },
    },
  };
})
