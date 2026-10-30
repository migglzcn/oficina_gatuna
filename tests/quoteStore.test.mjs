import test from 'node:test'
import assert from 'node:assert/strict'
const values = new Map()
let failWrites = false
globalThis.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { if (failWrites) throw new Error('quota'); values.set(key, value) } }
const { useQuoteStore: store } = await import('../src/store/quoteStore.ts')

test('crear, editar, revisar, duplicar y eliminar conserva datos y estados coherentes', () => {
  store.getState().create()
  const id = store.getState().activeId
  let quote = store.getState().quotes[0]
  assert.equal(store.getState().beginReview(), false)
  assert.ok(store.getState().issues.length > 0)
  store.getState().update({ client: { ...quote.client, name: 'Cliente de prueba' }, title: 'Curso de prueba' })
  assert.equal(store.getState().beginReview(), true)
  store.getState().completeStage(3)
  assert.equal(store.getState().results.length, 0)
  store.getState().create()
  store.getState().update({ title: 'Cambio durante revisión' })
  assert.equal(store.getState().quotes.length, 1)
  assert.equal(store.getState().quotes[0].title, 'Curso de prueba')
  for (let i = 0; i < 4; i++) store.getState().completeStage(i)
  assert.equal(store.getState().processing, false)
  quote = store.getState().quotes[0]
  assert.equal(quote.status, 'reviewed')
  assert.equal(store.getState().results.length, 4)
  const persisted = JSON.parse(values.get('midevAiOffice.quotes.v1'))
  assert.equal(persisted.quotes[0].status, 'reviewed')
  assert.equal(persisted.activeId, id)
  store.getState().duplicate(id)
  const copy = store.getState().quotes[0]
  assert.notEqual(copy.id, id)
  assert.notEqual(copy.folio, quote.folio)
  assert.equal(copy.status, 'draft')
  assert.equal(copy.reviewedAt, null)
  store.getState().open(id)
  store.getState().update({ title: 'Cambio posterior' })
  assert.equal(store.getState().quotes.find((q) => q.id === id).status, 'draft')
  store.getState().remove(id)
  assert.equal(store.getState().quotes.length, 1)
  assert.equal(store.getState().activeId, copy.id)
})
test('fallos de almacenamiento no producen una confirmación falsa', () => {
  failWrites = true
  store.getState().update({ title: 'Cambio aún sin guardar' })
  assert.ok(store.getState().storageError)
  assert.equal(store.getState().savedAt, null)
  store.getState().save()
  assert.equal(store.getState().notice, '')
  failWrites = false
  store.getState().save()
  assert.equal(store.getState().storageError, null)
  assert.ok(store.getState().savedAt)
})
test('datos guardados corruptos se conservan y bloquean sobrescritura', async () => {
  const original = '{invalid json'
  values.set('midevAiOffice.quotes.v1', original)
  const { useQuoteStore: recovered } = await import('../src/store/quoteStore.ts?corrupt-data-test')
  assert.equal(recovered.getState().storageBlocked, true)
  recovered.getState().create()
  assert.equal(values.get('midevAiOffice.quotes.v1'), original)
  assert.ok(recovered.getState().storageError)
})
