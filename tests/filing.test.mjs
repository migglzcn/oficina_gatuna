import test from 'node:test'
import assert from 'node:assert/strict'
import {filingPose,FILING_DURATION} from '../src/domain/filing.ts'
import {agents} from '../src/data/agents.ts'
test('Luna regresa al puesto actual y no a coordenadas antiguas',()=>{
 const luna=agents.find(a=>a.id==='revisor')
 const home=[luna.position[0],0,luna.position[2]-0.86]
 const close=(a,b)=>assert.ok(a.every((v,i)=>Math.abs(v-b[i])<1e-8))
 close(filingPose(0,home).position,home)
 assert.equal(filingPose(3,home).position[0],4.55)
 assert.equal(filingPose(6,home).position[0],3)
 close(filingPose(10,home).position,[0.9,0.12,2.85])
 assert.equal(filingPose(10,home).deposited,false)
 assert.equal(filingPose(10.5,home).deposited,true)
 assert.equal(filingPose(10.5,home).walking,false)
 close(filingPose(FILING_DURATION,home).position,home)
 assert.equal(filingPose(FILING_DURATION,home).finished,true)
 assert.equal(filingPose(FILING_DURATION,home).rotation,0)
 for(let t=0;t<=FILING_DURATION;t+=0.1)assert.ok(filingPose(t,home).position.every(Number.isFinite))
 const moved=[2.5,0,-2.5]
 close(filingPose(FILING_DURATION,moved).position,moved)
})
