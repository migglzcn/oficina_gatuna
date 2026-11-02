import { useEffect, useState } from 'react'
import { isQuote } from '../../domain/quotes'
import { useQuoteStore } from '../../store/quoteStore'
interface Task {id:string;summary:string;client:string;status:string;stage:number;message:string;updatedAt:string;history:{role:'user'|'assistant';content:string}[];quote?:unknown}
export function PendingRequests({busy,onRetry}:{busy:boolean;onRetry:(history:Task['history'])=>void}){
 const [tasks,setTasks]=useState<Task[]>([]),[error,setError]=useState('')
 useEffect(()=>{
  let active=true
  const refresh=()=>{void fetch('/api/tasks').then(async r=>{if(!r.ok)throw Error();const data=await r.json();if(!Array.isArray(data))throw Error();if(active){setTasks(data);setError('')}}).catch(()=>{if(active)setError('No se pudo consultar los pendientes. Comprueba el servidor local.')})}
  refresh();const timer=window.setInterval(refresh,2500)
  return()=>{active=false;window.clearInterval(timer)}
 },[])
 const stages=['Salem: identifica el curso','Milo: calcula la inversión','Oliver: prepara el temario','Luna: revisa la propuesta']
 const labels:Record<string,string>={running:'En proceso',ready:'Lista',needs_info:'Necesita aclaración',error:'Error',interrupted:'Interrumpida'}
 return <details className="request-board" open><summary>Pendientes y cotizaciones · {tasks.filter(t=>t.status!=='ready').length} por atender</summary>{error&&<p role="status">{error}</p>}<div className="request-list">{!tasks.length&&!error&&<p>Aún no hay solicitudes. Cuéntame qué curso necesita tu cliente.</p>}{tasks.map(task=><article key={task.id}><header><strong>{task.client}</strong><span>{labels[task.status]||task.status}</span></header><p>{task.summary}</p><b>{task.status==='running'?stages[task.stage]:task.message}</b>{task.status==='running'&&<small>Esperando respuesta del modelo local. Actualizado: {new Date(task.updatedAt).toLocaleTimeString('es-MX')}</small>}{isQuote(task.quote)?<button className="quote-secondary" disabled={busy} onClick={()=>{if(isQuote(task.quote))useQuoteStore.getState().receiveProposal(task.quote)}}>{task.status==='ready'?'Ver cotización':'Ver borrador'}</button>:null}{task.status!=='running'&&task.status!=='ready'&&<button className="quote-secondary" disabled={busy} onClick={()=>onRetry(task.history)}>Retomar solicitud</button>}</article>)}</div></details>
}
