import test from 'node:test'
import assert from 'node:assert/strict'
import {useOfficeStore as office} from '../src/store/officeStore.ts'
test('ocultar y reabrir el globo conserva la sesión y la tarea del equipo',()=>{
 office.getState().startNewClient()
 const revision=office.getState().chatRevision
 office.getState().aiStage(2)
 office.getState().setRequestContext({client:'Juan',course:'Python',hours:10})
 office.getState().closeChat()
 assert.equal(office.getState().chatOpen,false)
 assert.equal(office.getState().running,true)
 assert.equal(office.getState().step,2)
 office.getState().openChat()
 assert.equal(office.getState().chatOpen,true)
 assert.equal(office.getState().chatRevision,revision)
 assert.equal(office.getState().step,2)
 assert.equal(office.getState().requestContext.client,'Juan')
 office.getState().endAi()
 office.getState().closeChat()
 office.getState().openChat()
 assert.equal(office.getState().chatRevision,revision)
 office.getState().startNewClient()
 assert.equal(office.getState().chatRevision,revision+1)
})
