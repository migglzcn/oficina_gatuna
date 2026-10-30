import { useEffect, useRef, useState } from 'react'
import { useOfficeStore } from '../../store/officeStore'
import { useQuoteStore } from '../../store/quoteStore'
import { isQuote } from '../../domain/quotes'
import { QuotePreview } from '../quotes/QuotePreview'
import '../quotes/quotes.css'
import './assistant.css'
interface ChatMessage { role:'user'|'assistant'; content:string; agent?:string }
function load():ChatMessage[]{try{const v=JSON.parse(localStorage.getItem('midevAiOffice.chat.v1')||'[]');return Array.isArray(v)&&v.every(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string')?v:[]}catch{return []}}
export function Assistant({ compact = false }: { compact?: boolean }){
 const [messages,setMessages]=useState<ChatMessage[]>(load),[text,setText]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[connected,setConnected]=useState(false)
 const request=useRef<AbortController|null>(null)
 const quotes=useQuoteStore(s=>s.quotes),activeId=useQuoteStore(s=>s.activeId)
 const quote=quotes.find(q=>q.id===activeId)
 const running=useOfficeStore(s=>s.running)
 const check=()=>{void fetch('/api/health').then(r=>r.json()).then(d=>setConnected(!!d.available)).catch(()=>setConnected(false))}
 useEffect(()=>{check();return()=>request.current?.abort()},[])
 useEffect(()=>{try{localStorage.setItem('midevAiOffice.chat.v1',JSON.stringify(messages))}catch{queueMicrotask(()=>setError('La conversación no se pudo guardar en este navegador.'))}},[messages])
 async function send(retry=false){
  if(busy||running||(!retry&&!text.trim()))return
  const history=retry?messages:[...messages,{role:'user' as const,content:text.trim()}]
  setMessages(history);setText('');setError('');setBusy(true)
  if(quote?.status==='approved'||quote?.status==='pending')useQuoteStore.getState().update({})
  const controller=new AbortController();request.current=controller
  const timeout=window.setTimeout(()=>controller.abort(),125000)
  try{
   const response=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({messages:history.slice(-40).map(m=>({role:m.role,content:m.agent?`${m.agent}: ${m.content}`:m.content}))})})
   if(!response.ok||!response.body)throw Error('No se pudo conectar con el servidor local. Ejecuta npm run dev y abre Ollama.')
   setConnected(true)
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';let done=false
   while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let newline:number
    while((newline=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,newline);buffer=buffer.slice(newline+1);if(!line.trim())continue
     const event=JSON.parse(line)
     if(event.type==='stage'&&[0,1,2,3].includes(event.step))useOfficeStore.getState().aiStage(event.step)
     if(event.type==='message')setMessages(m=>[...m,{role:'assistant',agent:String(event.agent),content:String(event.content)}])
     if(event.type==='proposal'){if(!isQuote(event.quote))throw Error('La propuesta recibida no es válida.');useQuoteStore.getState().receiveProposal(event.quote)}
     if(event.type==='error')throw Error(event.message)
     if(event.type==='done')done=true
    }
   }
   if(!done)throw Error('La respuesta se interrumpió. Puedes reintentar.')
  }catch(e){setError(controller.signal.aborted?'Solicitud cancelada o tiempo de espera agotado. Puedes reintentar.':e instanceof Error?e.message:'Error de conexión.')}finally{clearTimeout(timeout);request.current=null;setBusy(false);useOfficeStore.getState().endAi()}
 }
 return <section className={`assistant-workspace ${compact ? 'compact-assistant' : ''}`} id="conversacion"><div className="quotes-heading">{compact && <button className="balloon-close" aria-label="Cerrar conversación con Salem" onClick={()=>useOfficeStore.getState().closeChat()}>×</button>}<div><span className="eyebrow">CONVERSA CON TU EQUIPO</span><h2>Salem · Coordinador</h2><p>El equipo recomendará una capacitación y preparará la propuesta para tu aprobación.</p></div><button className="quote-secondary" disabled={busy||running} onClick={()=>{setMessages([]);setError('');useQuoteStore.setState({activeId:null});useQuoteStore.getState().save()}}>Nueva conversación</button><button className="quote-secondary" onClick={check}>{connected?'● IA local disponible':'Comprobar Ollama'}</button></div><div className="assistant-layout"><div className="assistant-chat"><div className="chat-history" role="log" aria-label="Conversación con el equipo">{!messages.length&&<p className="chat-welcome">Hola, soy Salem. ¿Qué necesita lograr tu cliente? Cuéntame sobre su equipo, sus conocimientos actuales y el problema que quieren resolver.</p>}{messages.map((m,i)=><article key={i} className={`chat-message ${m.role}`}><strong>{m.role==='user'?'Tú':m.agent||'Equipo'}</strong><p>{m.content}</p></article>)}</div>{error&&<div className="quote-issues" role="alert">{error}<button className="quote-secondary" disabled={busy||running} onClick={()=>void send(true)}>Reintentar</button></div>}<form onSubmit={e=>{e.preventDefault();void send()}}><label htmlFor="assistant-message">Necesidad del cliente o ajuste a la propuesta</label><textarea id="assistant-message" maxLength={12000} rows={compact ? 2 : 4} value={text} onChange={e=>setText(e.target.value)} placeholder="Ejemplo: Somos cuatro personas y queremos automatizar reportes de Excel…" disabled={busy||running}/><div className="chat-actions"><span>IA en tu equipo · Revisa la propuesta antes de aprobar</span>{busy?<button type="button" className="quote-secondary" onClick={()=>request.current?.abort()}>Cancelar</button>:<button className="quote-primary" disabled={!text.trim()||running}>Enviar al equipo</button>}</div></form></div><div className="assistant-proposal">{quote?<><div className="proposal-actions"><strong>{quote.status==='approved'?'Propuesta aprobada':quote.status==='pending'?'Propuesta lista para tu aprobación':'Propuesta en preparación'}</strong>{quote.status==='pending'&&<button className="quote-primary" disabled={busy||running} onClick={()=>useQuoteStore.getState().approve()}>Aprobar propuesta</button>}</div><QuotePreview quote={quote}/></>:<div className="quotes-empty"><h3>Tu propuesta aparecerá aquí.</h3><p>Salem te preguntará lo que falte. Puedes solicitar cambios conversando, sin llenar un formulario.</p></div>}</div></div></section>
}
