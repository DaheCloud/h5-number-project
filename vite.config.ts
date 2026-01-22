import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite';
// import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
// @ts-ignore
// https://vite.dev/config/
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
        // '@': resolve(__dirname, 'src'),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },  
    plugins: [
      vue({
        // 若需使用 reactivityTransform，需确保 @vitejs/plugin-vue 版本支持该配置
        // 可尝试添加以下配置，若类型检查仍报错，可能需要更新插件版本
      }),
      tailwindcss(),
      AutoImport({
        // dts: 'src/auto-imports.d.ts',
        // dts: './auto-imports.d.ts',
        imports: [
          'vue',
          'vue-router',
          'pinia',
          {
            vant: ['showToast', 'showDialog', 'showNotify', 'showConfirmDialog']
          }
        ],
        resolvers: [VantResolver()],
      }),
      Components({
        resolvers: [VantResolver()],
      }),
    ],
    server: {
      fs: {
        allow: ['../../'],
      },
    },
  };
})
