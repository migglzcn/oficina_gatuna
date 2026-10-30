import { create } from 'zustand'
import { calculateQuote, createQuote, isQuote, localDate, money, nextFolio, validateQuote } from '../domain/quotes.ts'
import type { Quote, QuoteIssue, ReviewResult } from '../domain/quoteTypes.ts'

const STORAGE_KEY = 'midevAiOffice.quotes.v1'
interface SavedState { quotes: Quote[]; activeId: string | null }
function readSaved(): SavedState & { storageError: string | null; storageBlocked: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { quotes: [], activeId: null, storageError: null, storageBlocked: false }
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || !('quotes' in value) || !Array.isArray(value.quotes) || !value.quotes.every(isQuote) || new Set(value.quotes.map((q: Quote) => q.id)).size !== value.quotes.length) throw new Error('invalid')
    return { quotes: value.quotes, activeId: 'activeId' in value && typeof value.activeId === 'string' ? value.activeId : null, storageError: null, storageBlocked: false }
  } catch {
    return { quotes: [], activeId: null, storageError: 'No se pudieron leer las cotizaciones guardadas. Tus datos anteriores se conservaron. Comprueba el almacenamiento del navegador antes de guardar nuevos cambios.', storageBlocked: true }
  }
}
function saveState(quotes: Quote[], activeId: string | null, blocked: boolean): { storageError: string | null; savedAt: string | null } {
  if (blocked) return { storageError: 'El guardado está bloqueado para proteger los datos que no se pudieron leer. Los cambios actuales solo están en memoria.', savedAt: null }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ quotes, activeId }))
    return { storageError: null, savedAt: new Date().toISOString() }
  } catch { return { storageError: 'No se pudo guardar en este navegador. Los cambios solo están en memoria; libera espacio o habilita el almacenamiento y pulsa Guardar.', savedAt: null } }
}
interface QuoteState {
  quotes: Quote[]
  activeId: string | null
  processing: boolean
  issues: QuoteIssue[]
  results: ReviewResult[]
  storageError: string | null
  storageBlocked: boolean
  savedAt: string | null
  notice: string
  receiveProposal: (quote: Quote) => void
  approve: () => void
  create: () => void
  open: (id: string) => void
  update: (patch: Partial<Quote>) => void
  save: () => void
  duplicate: (id: string) => void
  remove: (id: string) => void
  beginReview: () => boolean
  completeStage: (step: number) => void
}
const saved = readSaved()
export const useQuoteStore = create<QuoteState>((set, get) => ({
  ...saved, processing: false, issues: [], results: [], savedAt: null, notice: '',
  receiveProposal: (incoming) => {
    const s=get(), quote={...incoming, id:crypto.randomUUID(),folio:nextFolio(s.quotes),status:'pending' as const}
    const quotes=[quote,...s.quotes]
    set({quotes,activeId:quote.id,issues:[],results:[],...saveState(quotes,quote.id,s.storageBlocked)})
  },
  approve: () => {
    const s=get(),q=s.quotes.find(q=>q.id===s.activeId)
    if(!q || q.status!=='pending' || validateQuote(q,s.quotes,{allowPending:true}).length)return
    const quotes=s.quotes.map(q=>q.id===s.activeId?{...q,status:'approved' as const,updatedAt:new Date().toISOString()}:q)
    set({quotes,...saveState(quotes,s.activeId,s.storageBlocked)})
  },
  create: () => {
    const s = get(); if (s.processing) return
    const quote = createQuote(s.quotes), quotes = [quote, ...s.quotes]
    set({ quotes, activeId: quote.id, issues: [], results: [], notice: '', ...saveState(quotes, quote.id, s.storageBlocked) })
  },
  open: (id) => {
    const s = get(); if (s.processing || !s.quotes.some((q) => q.id === id)) return
    set({ activeId: id, issues: [], results: [], notice: '', ...saveState(s.quotes, id, s.storageBlocked) })
  },
  update: (patch) => {
    const s = get(); if (s.processing || !s.activeId) return
    const quotes = s.quotes.map((q) => q.id === s.activeId ? { ...q, ...patch, id: q.id, createdAt: q.createdAt, updatedAt: new Date().toISOString(), status: 'draft' as const, reviewedAt: null } : q)
    set({ quotes, issues: [], results: [], notice: '', ...saveState(quotes, s.activeId, s.storageBlocked) })
  },
  save: () => {
    const s = get(), outcome = saveState(s.quotes, s.activeId, s.storageBlocked)
    set({ ...outcome, notice: outcome.storageError ? '' : 'Cotización guardada en este navegador.' })
  },
  duplicate: (id) => {
    const s = get(), original = s.quotes.find((q) => q.id === id); if (s.processing || !original) return
    const now = new Date().toISOString()
    const copy: Quote = { ...structuredClone(original), id: crypto.randomUUID(), folio: nextFolio(s.quotes), issueDate: localDate(), createdAt: now, updatedAt: now, status: 'draft', reviewedAt: null }
    const quotes = [copy, ...s.quotes]
    set({ quotes, activeId: copy.id, issues: [], results: [], notice: 'Copia creada con un nuevo folio.', ...saveState(quotes, copy.id, s.storageBlocked) })
  },
  remove: (id) => {
    const s = get(); if (s.processing) return
    const quotes = s.quotes.filter((q) => q.id !== id)
    const activeId = s.activeId === id ? quotes[0]?.id ?? null : s.activeId
    set({ quotes, activeId, issues: [], results: [], notice: 'Cotización eliminada.', ...saveState(quotes, activeId, s.storageBlocked) })
  },
  beginReview: () => {
    const s = get(), quote = s.quotes.find((q) => q.id === s.activeId); if (s.processing || !quote) return false
    const issues = validateQuote(quote, s.quotes)
    if (issues.length) { set({ issues, results: [], notice: 'Hay datos que corregir antes de revisar.' }); return false }
    set({ processing: true, issues: [], results: [], notice: '' }); return true
  },
  completeStage: (step) => {
    const s = get(), quote = s.quotes.find((q) => q.id === s.activeId); if (!s.processing || !quote) return
    const totals = calculateQuote(quote)
    const stages: ReviewResult[] = [
      { agent: 'Salem', message: `Solicitud de ${quote.client.name} organizada. Folio ${quote.folio}.` },
      { agent: 'Milo', message: `Importes calculados: subtotal ${money(totals.subtotal)}, IVA ${money(totals.tax)}, total ${money(totals.total)}.` },
      { agent: 'Oliver', message: `Propuesta estructurada con ${totals.items.length} conceptos, alcance y condiciones comerciales.` },
      { agent: 'Luna', message: quote.kind === 'training' ? 'Datos, duración, tarifa mínima, comisión e IVA validados con las reglas de capacitación.' : 'Datos, conceptos, descuento, IVA y anticipo validados.' },
    ]
    if (step !== s.results.length || !stages[step]) return
    const results = [...s.results, stages[step]]
    if (step === 3) {
      const now = new Date().toISOString()
      const quotes = s.quotes.map((q) => q.id === quote.id ? { ...q, status: 'reviewed' as const, reviewedAt: now, updatedAt: now } : q)
      set({ quotes, results, processing: false, notice: 'Cotización revisada. Puedes consultar la propuesta o seguir editando.', ...saveState(quotes, s.activeId, s.storageBlocked) })
    } else set({ results })
  },
}))
