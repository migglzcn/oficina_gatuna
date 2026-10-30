import type { Quote, QuoteIssue, QuoteItem, QuoteTotals } from './quoteTypes.ts'

export const TRAINING_RULES = { minimumRate: 290, commission: 500, sessionHours: 2, maximumHours: 10, taxRate: 16, excelPrice: 7000 } as const
export const money = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
const cents = (value: number) => Math.round((value + Number.EPSILON) * 100)
const safe = (value: number) => Number.isFinite(value) ? value : 0
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function nextFolio(quotes: Pick<Quote, 'folio'>[], date = localDate()): string {
  const prefix = `COT-${date.replaceAll('-', '')}-`
  const numbers = quotes.map((q) => q.folio.trim().toUpperCase()).filter((folio) => folio.startsWith(prefix)).map((folio) => Number(folio.slice(prefix.length))).filter((n) => Number.isSafeInteger(n) && n >= 0)
  return `${prefix}${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`
}
export function createQuote(quotes: Quote[] = []): Quote {
  const now = new Date().toISOString()
  const emptyParty = { name: '', contact: '', email: '', phone: '', rfc: '', address: '' }
  return {
    id: crypto.randomUUID(), folio: nextFolio(quotes), createdAt: now, updatedAt: now, status: 'draft', reviewedAt: null,
    provider: { ...emptyParty, name: 'MiDev', contact: 'Miguel Ángel González Contreras', email: 'migglzcn@gmail.com', phone: '55 5826 2574' },
    client: { ...emptyParty }, kind: 'training', title: '', description: '', scope: '', modality: 'En línea', location: '', schedule: 'Por acordar entre las partes', participants: 1,
    training: { package: 'standard', hours: 2, rate: 290 }, items: [], discount: { type: 'percent', value: 0 }, taxRate: 16, advance: { type: 'percent', value: 50 },
    issueDate: localDate(), validityDays: 15, conditions: 'El servicio se agenda al confirmar el anticipo. Las licencias y suscripciones de las herramientas utilizadas no están incluidas.',
  }
}
export function quoteItems(quote: Quote): QuoteItem[] {
  if (quote.kind === 'service') return quote.items
  if (quote.training.package === 'excel') return [{ id: 'excel', description: 'Curso completo de Excel · 10 horas / 5 sesiones', quantity: 1, rate: TRAINING_RULES.excelPrice }]
  return [
    { id: 'training', description: `${quote.title.trim() || 'Capacitación'} · ${quote.training.hours / 2} sesiones de 2 horas`, quantity: quote.training.hours, rate: quote.training.rate },
    { id: 'commission', description: 'Comisión por curso', quantity: 1, rate: TRAINING_RULES.commission },
  ]
}
export function calculateQuote(quote: Quote): QuoteTotals {
  const items = quoteItems(quote).map((item) => ({ ...item, amount: cents(safe(item.quantity) * safe(item.rate)) / 100 }))
  const subtotalCents = items.reduce((sum, item) => sum + cents(item.amount), 0)
  const discountCents = quote.discount.type === 'fixed' ? cents(safe(quote.discount.value)) : Math.round(subtotalCents * safe(quote.discount.value) / 100)
  const baseCents = subtotalCents - discountCents
  const taxCents = Math.round(baseCents * safe(quote.taxRate) / 100)
  const totalCents = baseCents + taxCents
  const advanceCents = quote.advance.type === 'fixed' ? cents(safe(quote.advance.value)) : Math.round(totalCents * safe(quote.advance.value) / 100)
  return { items, subtotal: subtotalCents / 100, discount: discountCents / 100, base: baseCents / 100, tax: taxCents / 100, total: totalCents / 100, advance: advanceCents / 100, balance: (totalCents - advanceCents) / 100 }
}
export function validateQuote(quote: Quote, others: Quote[] = [], options: { allowPending?: boolean } = {}): QuoteIssue[] {
  const issues: QuoteIssue[] = []
  const require = (field: string, value: string, label: string) => { if (!value.trim()) issues.push({ field, message: `Completa ${label}.` }) }
  const number = (field: string, value: number, min: number, max: number, label: string, integer = false) => {
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) issues.push({ field, message: `${label}: usa ${integer ? 'un entero' : 'un valor'} entre ${min} y ${max}.` })
  }
  require('folio', quote.folio, 'el folio')
  if (others.some((q) => q.id !== quote.id && q.folio.trim().toUpperCase() === quote.folio.trim().toUpperCase())) issues.push({ field: 'folio', message: 'Este folio ya pertenece a otra cotización.' })
  if (!options.allowPending) require('client.name', quote.client.name, 'el nombre del cliente o empresa')
  require('title', quote.title, 'el nombre del servicio')
  require('provider.name', quote.provider.name, 'el nombre del proveedor')
  for (const [field, email] of [['client.email', quote.client.email], ['provider.email', quote.provider.email]]) {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.push({ field, message: 'Revisa el formato del correo electrónico.' })
  }
  const date = new Date(`${quote.issueDate}T12:00:00`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(quote.issueDate) || Number.isNaN(date.getTime()) || localDate(date) !== quote.issueDate) issues.push({ field: 'issueDate', message: 'Selecciona una fecha de emisión válida.' })
  number('validityDays', quote.validityDays, 1, 365, 'Vigencia', true)
  number('taxRate', quote.taxRate, 0, 100, 'IVA')
  if (quote.kind === 'training') {
    if (!(options.allowPending && quote.participants === null)) number('participants', quote.participants ?? 0, 1, 10000, 'Participantes', true)
    if (![2, 4, 6, 8, 10].includes(quote.training.hours)) issues.push({ field: 'training.hours', message: 'La capacitación debe tener de 1 a 5 sesiones de 2 horas (máximo 10 horas).' })
    number('training.rate', quote.training.rate, TRAINING_RULES.minimumRate, 1000000, 'Tarifa neta por hora')
    if (quote.taxRate !== 16) issues.push({ field: 'taxRate', message: 'Las reglas de capacitación MiDev establecen IVA del 16%.' })
    if (quote.training.package === 'excel' && quote.training.hours !== 10) issues.push({ field: 'training.hours', message: 'El paquete de Excel incluye exactamente 10 horas.' })
  }
  if (!options.allowPending && quote.modality === 'Por confirmar') issues.push({field:'modality',message:'Confirma la modalidad para la revisión manual.'})
  const totals = calculateQuote(quote)
  if (totals.items.length === 0) issues.push({ field: 'items', message: 'Agrega al menos un concepto cobrable.' })
  for (const item of totals.items) {
    require('items', item.description, 'la descripción de cada concepto')
    number('items', item.quantity, 0.01, 1000000, 'Cantidad')
    number('items', item.rate, 0, 1000000, 'Tarifa')
  }
  number('discount', quote.discount.value, 0, quote.discount.type === 'percent' ? 100 : Math.max(0, totals.subtotal), 'Descuento')
  number('advance', quote.advance.value, 0, quote.advance.type === 'percent' ? 100 : Math.max(0, totals.total), 'Anticipo')
  if (!Number.isFinite(totals.total) || totals.total <= 0) issues.push({ field: 'items', message: 'El total debe ser mayor que cero.' })
  if (quote.kind === 'training') {
    const minimum = quote.training.hours * TRAINING_RULES.minimumRate + TRAINING_RULES.commission
    if (quote.training.package === 'standard' && cents(totals.base) < cents(minimum)) issues.push({ field: 'discount', message: `El descuento deja el subtotal por debajo del mínimo de ${money(minimum)} (incluye la comisión).` })
    if (quote.training.package === 'excel' && cents(totals.base) !== cents(TRAINING_RULES.excelPrice)) issues.push({ field: 'discount', message: 'El paquete completo de Excel tiene un precio fijo de $7,000.00 + IVA; no admite descuentos.' })
  }
  return issues
}

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
export function isQuote(value: unknown): value is Quote {
  if (!isRecord(value)) return false
  const strings = ['id', 'folio', 'createdAt', 'updatedAt', 'title', 'description', 'scope', 'location', 'schedule', 'issueDate', 'conditions']
  if (!strings.every((key) => typeof value[key] === 'string')) return false
  if (!['draft', 'reviewed', 'pending', 'approved'].includes(String(value.status)) || !(value.reviewedAt === null || typeof value.reviewedAt === 'string')) return false
  if (!['training', 'service'].includes(String(value.kind)) || !['En línea', 'Presencial', 'Híbrida', 'Por confirmar'].includes(String(value.modality))) return false
  if (!['taxRate', 'validityDays'].every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]))) return false
  if (!(value.participants === null || typeof value.participants === 'number' && Number.isFinite(value.participants))) return false
  for (const key of ['provider', 'client']) {
    const party = value[key]
    if (!isRecord(party) || !['name', 'contact', 'email', 'phone', 'rfc', 'address'].every((field) => typeof party[field] === 'string')) return false
  }
  const training = value.training
  if (!isRecord(training) || !['standard', 'excel'].includes(String(training.package)) || typeof training.hours !== 'number' || !Number.isFinite(training.hours) || typeof training.rate !== 'number' || !Number.isFinite(training.rate)) return false
  for (const key of ['discount', 'advance']) {
    const adjustment = value[key]
    if (!isRecord(adjustment) || !['percent', 'fixed'].includes(String(adjustment.type)) || typeof adjustment.value !== 'number' || !Number.isFinite(adjustment.value)) return false
  }
  return Array.isArray(value.items) && value.items.every((item) => isRecord(item) && ['id', 'description'].every((key) => typeof item[key] === 'string') && ['quantity', 'rate'].every((key) => typeof item[key] === 'number' && Number.isFinite(item[key])))
}
