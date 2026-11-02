import test from 'node:test'
import assert from 'node:assert/strict'
import {DatabaseSync} from 'node:sqlite'
import {RequestRepository} from '../server/requests.ts'
test('SQLite conserva solicitudes, cotización y avance; reiniciar marca las activas interrumpidas',()=>{
 const db=new DatabaseSync(':memory:')
 const repo=new RequestRepository(db)
 const task={id:'one',summary:'Python para Juan',client:'Juan',status:'running',stage:2,message:'Preparando temario',updatedAt:'',history:[{role:'user',content:'Python'}]}
 repo.save(task)
 assert.equal(repo.list()[0].stage,2)
 const restarted=new RequestRepository(db)
 assert.equal(restarted.list()[0].status,'interrupted')
 restarted.save({...task,status:'ready',quote:{title:'Python',total:3944}})
 assert.deepEqual(new RequestRepository(db).list()[0].quote,{title:'Python',total:3944})
 assert.equal(repo.list().length,1)
 db.close()
})
test('SQLite guarda documentos independientes con folios únicos y permite actualizar aprobación',async()=>{
 const {createQuote}=await import('../src/domain/quotes.ts')
 const db=new DatabaseSync(':memory:'),repo=new RequestRepository(db)
 const first=createQuote(),second=createQuote()
 const a=repo.saveQuote(first),b=repo.saveQuote(second)
 assert.notEqual(a.folio,b.folio)
 repo.saveQuote({...a,status:'approved'})
 assert.equal(repo.quotes().length,2)
 assert.equal(repo.quotes().find(q=>q.id===a.id).status,'approved')
 assert.equal(repo.quotes().find(q=>q.id===a.id).folio,a.folio)
 db.close()
})
