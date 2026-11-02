import test from 'node:test'
import assert from 'node:assert/strict'
import {requestedCourse,courseContent} from '../server/courseCatalog.ts'
test('los temarios distinguen Python, Codex y Claude',()=>{
 for(const course of ['Python','Codex','Claude']){
  assert.equal(requestedCourse([{role:'user',content:`Cotización de ${course} para Juan`}]),course)
  const content=courseContent(course,10)
  assert.equal((content.scope.match(/Sesión /g)||[]).length,5)
  for(const other of ['Python','Codex','Claude'].filter(c=>c!==course))assert.ok(!content.scope.includes(other))
 }
 assert.equal(requestedCourse([{role:'user',content:'Python'},{role:'assistant',content:'Codex y Claude'},{role:'user',content:'Es para mí'}]),'Python')
 assert.equal(requestedCourse([{role:'user',content:'Python'},{role:'user',content:'Mejor un curso de Claude'}]),'Claude')
})
