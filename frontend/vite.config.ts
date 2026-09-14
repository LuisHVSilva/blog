import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: process.env.FRONTEND_SNAPSHOT_PATH ? [{
      find: '../../generated/published-content.json',
      replacement: path.resolve(process.env.FRONTEND_SNAPSHOT_PATH),
    }] : [],
  },
})
