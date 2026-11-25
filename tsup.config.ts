import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  external: ['react', 'react-dom']
});
