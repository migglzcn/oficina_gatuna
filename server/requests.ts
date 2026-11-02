import { isQuote, nextFolio } from '../src/domain/quotes.ts'
import type { Quote } from '../src/domain/quoteTypes.ts'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Message } from './assistant.ts'
export interface RequestTask { id:string; summary:string; client:string; status:'running'|'ready'|'needs_info'|'error'|'interrupted'; stage:number; message:string; updatedAt:string; history:Message[]; quote?:unknown }
export class RequestRepository {
 private db:DatabaseSync
 constructor(db:DatabaseSync){
  this.db=db
  db.exec('CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, data TEXT NOT NULL)')
  db.exec('CREATE TABLE IF NOT EXISTS quotes (id TEXT PRIMARY KEY, data TEXT NOT NULL)')
  for(const task of this.list())if(isQuote(task.quote)&&!this.quotes().some(q=>q.id===(task.quote as Quote).id))this.saveQuote(task.quote)
  for(const task of this.list())if(task.status==='running')this.save({...task,status:'interrupted',message:'El servidor se reinició. Puedes reintentar esta solicitud.'})
 }
 quotes():Quote[]{return (this.db.prepare('SELECT data FROM quotes ORDER BY rowid DESC').all() as {data:string}[]).map(row=>JSON.parse(row.data)).filter(isQuote)}
 saveQuote(incoming:Quote):Quote{
  const all=this.quotes(),existing=all.find(q=>q.id===incoming.id)
  const quote={...incoming,folio:existing?.folio||nextFolio(all)}
  this.db.prepare('INSERT INTO quotes(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(quote.id,JSON.stringify(quote))
  return quote
 }
 save(task:RequestTask){task={...task,updatedAt:new Date().toISOString()};this.db.prepare('INSERT INTO requests(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(task.id,JSON.stringify(task));return task}
 list():RequestTask[]{return (this.db.prepare('SELECT data FROM requests ORDER BY rowid DESC LIMIT 50').all() as {data:string}[]).map(row=>JSON.parse(row.data) as RequestTask)}
}
let repository:RequestRepository|undefined
export function requests(){if(!repository){const dir=resolve('data');mkdirSync(dir,{recursive:true});repository=new RequestRepository(new DatabaseSync(resolve(dir,'office.sqlite')))}return repository}
