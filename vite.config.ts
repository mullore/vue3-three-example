import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

import glsl from 'vite-plugin-glsl';
import viteEslint from 'vite-plugin-eslint';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
const useDevMode = true;

// https://vitejs.dev/config/
export default defineConfig({
  base: 'http://localhost:8080/',
  plugins: [
    // useDevMode = true 时不开启热更新
    vue(),
    viteEslint(),
    glsl(),
    vueJsx(),
    qiankun('three', {
      useDevMode,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.jsx', '.tsx', '.json', '.vue'],
    // 别名配置
    alias: {
      '@': path.join(__dirname, 'src'),
      '@assets': path.join(__dirname, 'src/assets'),
      '@comps': path.join(__dirname, 'src/components'),
      '@utils': path.join(__dirname, 'src/utils'),
      '@router': path.join(__dirname, 'src/router'),
      '@store': path.join(__dirname, 'src/store'),
    },
  },
  server: {
    port: 8080,
    cors: true,
    origin: 'http://localhost:8080',
  },
});
