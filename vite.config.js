import { join } from 'path';
import { defineConfig } from 'vite';
import MonacoEditorNlsPlugin, {
    esbuildPluginMonacoEditorNls,
    Languages,
} from 'vite-plugin-monaco-editor-nls';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

const PACKAGE_ROOT = __dirname;
const prefix = `monaco-editor/esm/vs`;

export default defineConfig({
    server: {
      open: false, // do not open the browser as we use electron
      port: process.env.PORT || 5000,
      fsServe: {
        root: join(PACKAGE_ROOT, '../../'),
      },
    },
    root: join(PACKAGE_ROOT, 'public') + '/',
    base: '',
    plugins: [
        MonacoEditorNlsPlugin({locale: Languages.en_gb}),
        svelte({
          emitCss: true
        }),
        resolve({browser: true,
            dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/'),
            preferBuiltins: true,
        }),
        commonjs(),
        
    ],
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                sourcemap: true,
                format: 'esm',
                name: 'app',
                dir: 'public',
            },
        }
    },
    resolve: {
        alias: {
            '@': join('./src'),
        },
    },
    optimizeDeps: {
        include: [
            `${prefix}/editor/editor.worker`,
            `${prefix}/language/json/json.worker.js`,
            `${prefix}/language/css/css.worker.js`,
            `${prefix}/language/html/html.worker.js`,
            `${prefix}/language/typescript/ts.worker.js`,
        ],
        exclude: ['path', 'electron-window-state'],
        /** requires vite >= 2.3.0 */
        esbuildOptions: {
            plugins: [
                esbuildPluginMonacoEditorNls({
                    locale: Languages.en_gb,
                }),
            ],
        },
    },
});