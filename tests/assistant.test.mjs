import test from 'node:test'
import assert from 'node:assert/strict'
import {runAssistant,explicitHours} from '../server/assistant.ts'
import {calculateQuote,isQuote,validateQuote} from '../src/domain/quotes.ts'
const facts={course:'Python básico a avanzado',client:'Juan Pérez',hours:0,participants:0,modality:'Por confirmar'}
const design={description:'Introducción a Python',scope:'Sesiones 1 a 5: fundamentos, estructuras, funciones, archivos y proyecto.'}
const review={observations:'Ajustar el alcance al nivel introductorio.'}
function mock(values){let count=0;globalThis.fetch=async()=>({ok:true,json:async()=>({message:{content:typeof values[count]==='string'?values[count++]:JSON.stringify(values[count++])}})});return()=>count}
async function run(messages,values){const original=fetch;try{mock(values);const events=[];await runAssistant(messages,e=>events.push(e),new AbortController().signal);return events}finally{globalThis.fetch=original}}
const user=content=>({role:'user',content})
test('Juan Pérez obtiene cotización de 10 horas sin repetir preguntas',async()=>{
 const events=await run([user('Oye el Sr Juan Perez quiere saber cuanto le cuesta una cotización de Python para el, quiere un curso de basico a avanzado.'),{role:'assistant',content:'Indica tu nivel y tiempo disponible'},user('quiero que aprendas que es nivel basico y que siempre serán 10 horas'),user('solo necesitas el curso y las horas, revisa los precios de /Users/migglzcn/Documents/33 Cotizador/Cotizadores'),user('ya te dije que es basico y son 10 horas')],[facts,design,review])
 const quote=events.find(e=>e.type==='proposal').quote
 assert.equal(quote.training.hours,10);assert.equal(quote.participants,1);assert.equal(quote.modality,'Por confirmar');assert.equal(quote.client.name,'Juan Pérez');assert.equal(quote.status,'pending');assert.equal(calculateQuote(quote).total,3944)
 assert.ok(!events.filter(e=>e.type==='message').some(e=>e.content.includes('?')))
 assert.ok(quote.scope.includes('POR CONFIRMAR'));assert.equal(isQuote(quote),true)
})
test('cliente, modalidad y participantes desconocidos no bloquean el borrador',async()=>{const events=await run([user('Quiero Python')],[{...facts,client:''},design,review]);const q=events.find(e=>e.type==='proposal').quote;assert.equal(q.client.name,'');assert.equal(q.participants,null);assert.deepEqual(validateQuote(q,[],{allowPending:true}),[]);assert.ok(validateQuote(q).some(i=>i.field==='participants'))})
test('solo se pregunta cuando falta el curso',async()=>{const events=await run([user('Hola')],[{...facts,course:''}]);assert.ok(events.some(e=>e.type==='decision'&&e.result==='clarification'));assert.ok(!events.some(e=>e.type==='proposal'))})
test('duración explícita menor prevalece y no se confunde el equipo con un individuo',async()=>{const events=await run([user('Python para el equipo, 4 horas')],[facts,design,review]);const q=events.find(e=>e.type==='proposal').quote;assert.equal(q.training.hours,4);assert.equal(q.participants,null);assert.equal(calculateQuote(q).total,1925.6)})
test('más de diez horas se rechazan aunque el modelo devuelva diez',async()=>{const events=await run([user('Python de 12 horas')],[{...facts,hours:10}]);assert.ok(events.some(e=>e.type==='decision'&&e.result==='restriction'));assert.ok(!events.some(e=>e.type==='proposal'))})
test('precios inventados no aparecen en contenido o mensajes de IA',async()=>{const events=await run([user('Python')],[facts,{description:'Curso\nPrecio $2900',scope:'Sesión 1 fundamentos\nTotal 2 pesos'}, {observations:'IVA cero pesos'}]);const q=events.find(e=>e.type==='proposal').quote;assert.ok(!/2900|pesos|IVA/.test(q.scope+q.description));assert.equal(calculateQuote(q).total,3944)})
test('Excel mantiene precio fijo',async()=>{const events=await run([user('Excel completo')],[{...facts,course:'Excel completo'},design,review]);assert.equal(calculateQuote(events.find(e=>e.type==='proposal').quote).total,8120)})
test('la última corrección de horas prevalece',()=>{assert.equal(explicitHours([user('4 horas'),user('mejor 8 horas')]),8)})
test('JSON inválido se reintenta una vez',async()=>{const original=fetch;try{const count=mock(['invalid','invalid']);await assert.rejects(runAssistant([user('Python')],()=>{},new AbortController().signal),/inválida/);assert.equal(count(),2)}finally{globalThis.fetch=original}})
