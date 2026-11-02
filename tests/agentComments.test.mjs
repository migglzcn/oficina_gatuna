import test from 'node:test'
import assert from 'node:assert/strict'
import {agentComment,mentionsDiscount} from '../src/domain/agentComments.ts'
test('los comentarios usan al cliente actual y la tarea del agente',()=>{
 const context={client:'Juan Pérez',course:'Python',hours:10}
 for(const id of ['coordinador','costos','cotizador','revisor']){
  for(let variant=0;variant<2;variant++)assert.ok(agentComment(id,context,variant).includes('Juan Pérez'))
  assert.ok(!agentComment(id,{...context,client:'María'},0).includes('Juan Pérez'))
 }
 assert.ok(agentComment('cotizador',context).includes('Python en 10 horas'))
 assert.ok(agentComment('costos',context).includes('¡Señor, sí señor!'))
})
test('sin identidad se usa una expresión genérica sin inventar nombres',()=>{
 assert.ok(agentComment('revisor',null).startsWith('Este cliente:'))
})

test('pedir descuento activa bromas sin afirmar autorización',()=>{
 for(const text of ['¿Me haces descuento?', 'Una rebajita', '¿Puede ser más barato?'])assert.equal(mentionsDiscount(text),true)
 for(const text of ['Python básico', 'Sin descuento', 'No quiero un descuento'])assert.equal(mentionsDiscount(text),false)
 const context={client:'Juan',course:'Python',hours:10,discountRequested:true}
 assert.match(agentComment('coordinador',context),/descuento sobre descuento.*No miauches/)
 for(const id of ['coordinador','costos','cotizador','revisor'])assert.ok(agentComment(id,context).includes('Juan'))
})
