import { createServer } from 'node:http'
import { assistantHandler } from './handler.ts'
const server=createServer(assistantHandler)
server.on('error', (error) => { console.error('No se pudo iniciar el servidor del equipo:', error.message); process.exitCode=1 })
server.listen(Number(process.env.API_PORT||3001),'127.0.0.1',()=>console.log('Equipo MiDev: http://127.0.0.1:3001'))
