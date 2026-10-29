import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/components/index.js'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  sourcemap: true,
  clean: false,
  target: 'es2020',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'tailwindcss'],
  define: {
    'import.meta.env': '{}',
  },
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
