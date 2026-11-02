import type { Quote } from '../../domain/quoteTypes'
import { calculateQuote, money } from '../../domain/quotes'

export function QuotePreview({ quote }: { quote: Quote }) {
  const totals = calculateQuote(quote)
  return <article className="quote-document" aria-label="Vista previa de la propuesta">
    <div className="document-brand"><strong>MIDEV<span>Propuestas que crean posibilidades.</span></strong><span className={`quote-status ${quote.status}`}>{quote.status === 'approved' ? 'APROBADA' : quote.status === 'pending' ? 'PENDIENTE DE APROBACIÓN' : quote.status === 'reviewed' ? 'REVISADA' : 'BORRADOR'}</span></div>
    <div className="document-title"><span className="eyebrow">PROPUESTA DE SERVICIO</span><h3>{quote.title || 'Nombre de tu servicio'}</h3><p>{quote.folio} · {quote.issueDate || 'Fecha pendiente'}</p></div>
    <div className="document-parties"><div><span className="eyebrow">PREPARADA PARA</span><strong>{quote.client.name || 'Nombre del cliente'}</strong>{quote.client.contact && <span>{quote.client.contact}</span>}{quote.client.email && <span>{quote.client.email}</span>}{quote.client.phone && <span>{quote.client.phone}</span>}{quote.client.rfc && <span>RFC: {quote.client.rfc}</span>}{quote.client.address && <span>{quote.client.address}</span>}</div><div><span className="eyebrow">PRESENTADA POR</span><strong>{quote.provider.name}</strong><span>{quote.provider.contact}</span><span>{quote.provider.email}</span><span>{quote.provider.phone}</span>{quote.provider.rfc && <span>RFC: {quote.provider.rfc}</span>}{quote.provider.address && <span>{quote.provider.address}</span>}</div></div>
    {quote.description && <section><h4>El servicio</h4><p>{quote.description}</p></section>}
    {quote.scope && <section><h4>Alcance y entregables</h4><p>{quote.scope}</p></section>}
    <div className="document-meta"><span><b>Modalidad</b>{quote.modality}</span>{quote.kind === 'advisory' && <span><b>Duración de asesoría</b>{quote.training.hours} horas</span>}{quote.kind === 'training' && <><span><b>Duración</b>{quote.training.hours} horas · {quote.training.hours / 2} sesiones</span><span><b>Participantes</b>{quote.participants ?? 'Por confirmar'}</span></>}{quote.location && <span><b>Lugar</b>{quote.location}</span>}<span><b>Agenda</b>{quote.schedule || 'Por acordar'}</span></div>
    <section><h4>Inversión · MXN</h4><div className="document-table-wrap"><table className="document-table"><thead><tr><th>Concepto</th><th>Cant.</th><th>Tarifa</th><th>Importe</th></tr></thead><tbody>{totals.items.map((item) => <tr key={item.id}><td>{item.description || 'Concepto pendiente'}</td><td>{item.quantity}</td><td>{money(item.rate)}</td><td>{money(item.amount)}</td></tr>)}</tbody></table></div>
      <dl className="document-totals"><div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>{totals.discount !== 0 && <><div><dt>Descuento</dt><dd>−{money(totals.discount)}</dd></div><div><dt>Base gravable</dt><dd>{money(totals.base)}</dd></div></>}<div><dt>IVA ({quote.taxRate}%)</dt><dd>{money(totals.tax)}</dd></div><div className="total"><dt>Total MXN</dt><dd>{money(totals.total)}</dd></div><div><dt>Anticipo</dt><dd>{money(totals.advance)}</dd></div><div><dt>Saldo pendiente</dt><dd>{money(totals.balance)}</dd></div></dl>
    </section>
    <section><h4>Condiciones comerciales</h4><p>Vigencia: {quote.validityDays} días a partir de la fecha de emisión.</p>{quote.conditions && <p>{quote.conditions}</p>}</section>
    <div className="document-end">{quote.reviewedAt ? `Revisión local completada: ${new Date(quote.reviewedAt).toLocaleString('es-MX')}.` : 'Borrador pendiente de revisión.'}<span>MiDev · {quote.folio}</span></div>
  </article>
}
