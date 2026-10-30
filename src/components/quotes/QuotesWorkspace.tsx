import { useState } from 'react'
import { calculateQuote, money } from '../../domain/quotes'
import { useQuoteStore } from '../../store/quoteStore'
import { useOfficeStore } from '../../store/officeStore'
import { QuoteEditor } from './QuoteEditor'
import { Icon } from '../dashboard/Icon'
import './quotes.css'

export function QuotesWorkspace() {
  const { quotes, activeId, create, open, duplicate, remove, processing, storageError } = useQuoteStore()
  const running = useOfficeStore((s) => s.running)
  const [deleting, setDeleting] = useState<string | null>(null)
  const quote = quotes.find((q) => q.id === activeId)
  const blocked = running || processing
  return <section className="quotes-workspace" id="cotizaciones" aria-labelledby="quotes-heading">
    <div className="quotes-heading"><div><span className="eyebrow">DE LA IDEA A LA PROPUESTA</span><h2 id="quotes-heading">Tus cotizaciones<span>{quotes.length.toString().padStart(2, '0')}</span></h2><p>Prepara una propuesta, revisa los detalles y guárdala en tu espacio.</p></div><button className="quote-primary" onClick={create} disabled={blocked}>+ Nueva cotización</button></div>
    {storageError && <div className="quote-issues" role="alert">{storageError}</div>}
    {quotes.length === 0 ? <div className="quotes-empty"><span className="empty-quote-icon"><Icon name="office" size={30} /></span><h3>Tu próxima propuesta empieza aquí.</h3><p>Agrega un cliente y un servicio. El equipo te ayudará a comprobar los importes y preparar la propuesta.</p><button className="quote-primary" onClick={create} disabled={blocked}>Crear mi primera cotización <Icon name="arrow" size={16} /></button><span>Guardado en este navegador · Validación local</span></div> : <>
      <div className="quote-list" aria-label="Cotizaciones guardadas">{quotes.map((q) => <div key={q.id} className={`saved-quote ${q.id === activeId ? 'active' : ''}`}><button className="saved-quote-open" onClick={() => { open(q.id); setDeleting(null) }} disabled={blocked} aria-pressed={q.id === activeId}><span className="saved-quote-top"><span>{q.folio}</span><span className={`quote-status ${q.status}`}>{q.status === 'approved' ? 'Aprobada' : q.status === 'pending' ? 'Por aprobar' : q.status === 'reviewed' ? 'Revisada' : 'Borrador'}</span></span><strong>{q.client.name || 'Cliente pendiente'}</strong><span className="saved-quote-title">{q.title || 'Servicio pendiente'}</span><span className="saved-quote-total">{money(calculateQuote(q).total)} <small>MXN</small></span></button><div className="saved-quote-actions"><button disabled={blocked} onClick={() => duplicate(q.id)}>Duplicar</button>{deleting === q.id ? <><button className="delete-confirm" disabled={blocked} onClick={() => { remove(q.id); setDeleting(null) }}>Confirmar eliminación</button><button disabled={blocked} onClick={() => setDeleting(null)}>Cancelar</button></> : <button disabled={blocked} onClick={() => setDeleting(q.id)}>Eliminar</button>}</div></div>)}</div>
      {quote && <QuoteEditor key={quote.id} quote={quote} />}
    </>}
  </section>
}
