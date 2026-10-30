import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateQuote, createQuote, isQuote, localDate, nextFolio, validateQuote } from '../src/domain/quotes.ts'

function validQuote() {
  const quote = createQuote()
  quote.client.name = 'Empresa de prueba'
  quote.title = 'Capacitación en automatización'
  return quote
}
function service() {
  const quote = validQuote()
  quote.kind = 'service'
  quote.items = [{ id: 'one', description: 'Consultoría', quantity: 1, rate: 1000 }]
  return quote
}

test('la tabla de capacitación respeta horas, comisión e IVA; no multiplica por participantes', () => {
  for (const [hours, subtotal, total] of [[2, 1080, 1252.8], [4, 1660, 1925.6], [6, 2240, 2598.4], [8, 2820, 3271.2], [10, 3400, 3944]]) {
    const quote = validQuote()
    quote.training.hours = hours
    quote.participants = 12
    const result = calculateQuote(quote)
    assert.equal(result.subtotal, subtotal)
    assert.equal(result.total, total)
    assert.equal(result.advance, total / 2)
    assert.deepEqual(validateQuote(quote), [])
  }
})
test('Excel usa precio fijo de 7,000 + IVA y rechaza cambios de horas y descuentos', () => {
  const quote = validQuote()
  quote.training.package = 'excel'; quote.training.hours = 10
  assert.equal(calculateQuote(quote).total, 8120)
  assert.deepEqual(validateQuote(quote), [])
  quote.discount.value = 1
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'discount'))
  quote.training.hours = 8
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'training.hours'))
})
test('capacitación rechaza horas fuera de regla, mínimo reducido e IVA distinto', () => {
  for (const hours of [0, 1, 3, 11, 12, -2]) {
    const quote = validQuote(); quote.training.hours = hours
    assert.ok(validateQuote(quote).some((issue) => issue.field === 'training.hours'))
  }
  const quote = validQuote()
  quote.training.rate = 289
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'training.rate'))
  quote.training.rate = 290; quote.discount.value = 1; quote.taxRate = 0
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'discount'))
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'taxRate'))
})
test('un descuento es válido si conserva el mínimo neto de capacitación', () => {
  const quote = validQuote(); quote.training.hours = 10; quote.training.rate = 400
  quote.discount = { type: 'fixed', value: 1100 }
  assert.equal(calculateQuote(quote).base, 3400)
  assert.deepEqual(validateQuote(quote), [])
  quote.discount.value = 1100.01
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'discount'))
})
test('cálculos genéricos reproducen el ejemplo de 15,590.40 y el de 8,584.00', () => {
  const quote = service()
  quote.items[0] = { id: 'one', description: 'Servicio', quantity: 48, rate: 280 }
  assert.equal(calculateQuote(quote).total, 15590.4)
  quote.items = [{ id: 'one', description: 'Servicio', quantity: 1, rate: 6400 }, { id: 'two', description: 'Viáticos', quantity: 1, rate: 1000 }]
  assert.equal(calculateQuote(quote).total, 8584)
})
test('descuentos e impuestos se calculan antes del anticipo; acepta IVA 0 para servicios', () => {
  const quote = service(); quote.discount = { type: 'percent', value: 10 }
  assert.deepEqual(Object.fromEntries(['subtotal', 'discount', 'base', 'tax', 'total', 'advance', 'balance'].map((key) => [key, calculateQuote(quote)[key]])), { subtotal: 1000, discount: 100, base: 900, tax: 144, total: 1044, advance: 522, balance: 522 })
  quote.discount = { type: 'fixed', value: 100 }; quote.advance = { type: 'fixed', value: 200 }; quote.taxRate = 0
  assert.equal(calculateQuote(quote).balance, 700)
  assert.deepEqual(validateQuote(quote), [])
})
test('valida negativos, importes no finitos, anticipo excesivo y conceptos vacíos', () => {
  const quote = service(); quote.advance = { type: 'fixed', value: 1160.01 }
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'advance'))
  quote.discount = { type: 'percent', value: -1 }
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'discount'))
  quote.items[0].rate = Infinity
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'items'))
  quote.items = []
  assert.ok(validateQuote(quote).some((issue) => issue.field === 'items'))
})
test('redondea líneas, IVA y anticipo a centavos', () => {
  const quote = service(); quote.items[0].quantity = 3; quote.items[0].rate = 0.1
  quote.advance.value = 33.33
  const totals = calculateQuote(quote)
  assert.equal(totals.subtotal, 0.3)
  assert.equal(totals.tax, 0.05)
  assert.equal(totals.total, 0.35)
  assert.equal(totals.advance, 0.12)
  assert.equal(totals.balance, 0.23)
})
test('folios locales aumentan sin colisiones aun con borradores y mayúsculas diferentes', () => {
  assert.equal(localDate(new Date(2026, 9, 30)), '2026-10-30')
  assert.equal(nextFolio([{ folio: 'cot-20261030-002' }, { folio: 'COT-20261030-011' }, { folio: 'COT-20261029-999' }], '2026-10-30'), 'COT-20261030-012')
  const a = validQuote(), b = validQuote(); b.folio = a.folio.toLowerCase()
  assert.ok(validateQuote(a, [a, b]).some((issue) => issue.field === 'folio'))
})
test('rechaza fecha imposible, campos vacíos y correos mal formados', () => {
  const quote = validQuote(); quote.issueDate = '2026-02-30'; quote.client.email = 'correo-no-valido'; quote.title = ' '
  const issues = validateQuote(quote)
  for (const field of ['issueDate', 'client.email', 'title']) assert.ok(issues.some((issue) => issue.field === field))
})
test('la lectura distingue cotizaciones válidas de datos corruptos', () => {
  const quote = validQuote()
  assert.equal(isQuote(JSON.parse(JSON.stringify(quote))), true)
  for (const invalid of [null, [], {}, { ...quote, provider: null }, { ...quote, items: [null] }, { ...quote, training: { ...quote.training, hours: null } }, { ...quote, discount: { type: 'anything', value: 4 } }]) assert.equal(isQuote(invalid), false)
})
