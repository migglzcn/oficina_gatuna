import { createServer } from 'node:http'
import { health, runAssistant, type Message } from './assistant.ts'
const server=createServer(async(req,res)=>{
 const origin=req.headers.origin
 if(origin && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)){res.writeHead(403).end();return}
 if(req.url==='/api/health') {try{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(await health()))}catch{res.writeHead(503).end(JSON.stringify({available:false,error:'Abre Ollama para conversar con el equipo.'}))}return}
 if(req.url!=='/api/assistant'||req.method!=='POST'){res.writeHead(404).end();return}
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),120000)
 res.on('close',()=>controller.abort())
 try{
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('La conversación es demasiado larga.')}
  const body=JSON.parse(raw) as {messages:Message[]}
  if(!Array.isArray(body.messages)||body.messages.length<1||body.messages.length>40||!body.messages.every(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=12000))throw new Error('Conversación inválida.')
  const status=await health();if(!status.available)throw new Error(`El modelo ${status.model} no está instalado.`)
  res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store'})
  await runAssistant(body.messages,event=>{if(!res.destroyed)res.write(JSON.stringify(event)+'\n')},controller.signal)
 }catch(error){if(!res.destroyed){res.write(JSON.stringify({type:'error',message:controller.signal.aborted?'Se agotó el tiempo de espera. Puedes reintentar.':error instanceof Error?error.message:'Error de conexión.'})+'\n')}}finally{clearTimeout(timeout);res.end()}
})
server.on('error', (error) => { console.error('No se pudo iniciar el servidor del equipo:', error.message); process.exitCode=1 })
server.listen(Number(process.env.API_PORT||3001),'127.0.0.1',()=>console.log('Equipo MiDev: http://127.0.0.1:3001'))
