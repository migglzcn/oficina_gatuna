import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { assistantHandler } from './server/handler.ts'

export default defineConfig({
  plugins: [react(), {
    name: 'midev-local-assistant',
    configureServer(server) {
      server.middlewares.use((req,res,next) => {
        if(req.url === '/api/quotes' || req.url === '/api/tasks' || req.url === '/api/health' || req.url === '/api/assistant') void assistantHandler(req,res)
        else next()
      })
    },
  }],
})
