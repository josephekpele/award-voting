import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // ❗ Ne mets rien ici si tu n’en as pas besoin
      // external: [], // ← si tu dois exclure des libs, mets un tableau
      external: ['react', 'react-dom'],
    },
  },
  define: {
    // Certaines libs attendent process.env; on met un objet vide pour éviter les erreurs
    'process.env': {},
  },
})
