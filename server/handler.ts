import { isQuote, validateQuote } from '../src/domain/quotes.ts'
import { requests, type RequestTask } from './requests.ts'
import { randomUUID } from 'node:crypto'
import { health, runAssistant, type Message } from './assistant.ts'
export const assistantHandler: import('node:http').RequestListener = async(req,res)=>{
 const origin=req.headers.origin
 if(origin && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)){res.writeHead(403).end();return}
 if(req.url==='/api/quotes'){
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store')
  try{
   if(req.method==='GET'){res.end(JSON.stringify(requests().quotes()));return}
   if(req.method==='POST'){
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1000000)throw Error('Documento demasiado grande')}
    const quote:unknown=JSON.parse(raw)
    if(!isQuote(quote))throw Error('Documento inválido')
    if(quote.status!=='draft'&&validateQuote(quote,[],{allowPending:true}).length)throw Error('La cotización tiene errores comerciales')
    res.end(JSON.stringify(requests().saveQuote(quote)));return
   }
   res.writeHead(405).end();return
  }catch(e){res.writeHead(400).end(JSON.stringify({error:e instanceof Error?e.message:'Error al guardar'}));return}
 }
 if(req.url==='/api/tasks' && req.method==='GET'){res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(requests().list()));return}
 if(req.url==='/api/health') {try{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(await health()))}catch{res.writeHead(503).end(JSON.stringify({available:false,error:'Abre Ollama para conversar con el equipo.'}))}return}
 if(req.url!=='/api/assistant'||req.method!=='POST'){res.writeHead(404).end();return}
 let task:RequestTask|undefined
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),120000)
 res.on('close',()=>controller.abort())
 try{
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('La conversación es demasiado larga.')}
  const body=JSON.parse(raw) as {messages:Message[]}
  if(!Array.isArray(body.messages)||body.messages.length<1||body.messages.length>40||!body.messages.every(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=12000))throw new Error('Conversación inválida.')
  task=requests().save({id:randomUUID(),summary:body.messages.filter(m=>m.role==='user').at(-1)?.content.slice(0,300)||'Cotización',client:'Por identificar',status:'running',stage:0,message:'Conectando con Ollama',history:body.messages,updatedAt:''})
  const status=await health();if(!status.available)throw new Error(`El modelo ${status.model} no está instalado.`)
  res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store'})
  await runAssistant(body.messages,event=>{
    const e=event as Record<string,unknown>
    if((e.type==='draft'||e.type==='proposal')&&isQuote(e.quote)){
      const saved=requests().saveQuote(e.quote);Object.assign(e.quote,saved)
    }
    if(task){
      if(e.type==='stage')task.stage=Number(e.step)
      if(e.type==='context')task.client=String(e.client||'Por confirmar')
      if(e.type==='message')task.message=String(e.content)
      if(e.type==='draft')task.quote=e.quote
      if(e.type==='proposal'){task.quote=e.quote;task.status='ready';task.message='Cotización lista para tu aprobación.'}
      if(e.type==='decision' && e.result!=='sufficient')task.status='needs_info'
      if(e.type==='done' && task.status==='running')task.status='needs_info'
      task=requests().save(task)
    }
    if(!res.destroyed){
      res.write(JSON.stringify(event)+'\n')
      if(e.type==='proposal')res.write(JSON.stringify({type:'message',agent:'Luna',content:'¡La mando, jefe! La cotización quedó guardada. Ábrela en Cotizaciones guardadas para verla y descargarla. No se ha enviado por correo.'})+'\n')
    }
  },controller.signal)
 }catch(error){if(task)requests().save({...task,status:controller.signal.aborted?'interrupted':'error',message:controller.signal.aborted?'Solicitud interrumpida o tiempo agotado. Reintenta.':error instanceof Error?error.message:'Error de conexión.'});if(!res.destroyed){res.write(JSON.stringify({type:'error',message:controller.signal.aborted?'Se agotó el tiempo de espera. Puedes reintentar.':error instanceof Error?error.message:'Error de conexión.'})+'\n')}}finally{clearTimeout(timeout);res.end()}
}
