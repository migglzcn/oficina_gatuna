import { agents } from '../../data/agents'
import { getAgentStatus, statusLabels, useOfficeStore } from '../../store/officeStore'
import { Icon } from './Icon'
import { useQuoteStore } from '../../store/quoteStore'

export function Dashboard() {
  const { selectedId, select, step, running, start, completedRuns, mode, aiCompleted } = useOfficeStore()
  const { quotes, activeId } = useQuoteStore()
  const activeQuote = quotes.find((q) => q.id === activeId)
  const agent = agents.find((a) => a.id === selectedId)!
  const selectedStatus = getAgentStatus(agents.indexOf(agent), step, running, mode === 'ai' ? aiCompleted : undefined)
  return <aside className="dashboard">
    <div className="panel-heading"><div><span className="eyebrow">TALENTO CON PROPÓSITO</span><h2>Tu equipo de expertos</h2></div><span className="count-badge">04</span></div>
    <p className="panel-intro">Cuatro mentes. Un mismo objetivo.</p>
    <div className="agent-list">{agents.map((a, index) => {
      const status = getAgentStatus(index, step, running, mode === 'ai' ? aiCompleted : undefined)
      return <button key={a.id} className={`agent-card ${a.id === selectedId ? 'active' : ''}`} onClick={() => select(a.id)} aria-pressed={a.id === selectedId}>
        <span className="agent-avatar" style={{ color: a.fur, background: a.suit }}><Icon name="cat" size={28} /></span>
        <span className="agent-copy"><strong>{a.name}<span className={`small-status ${status}`}><i />{statusLabels[status]}</span></strong><span>{a.role}</span></span><span className="agent-arrow">↗</span>
      </button>
    })}</div>
    <section className="agent-detail" aria-label="Agente seleccionado">
      <div className="detail-heading"><span className="eyebrow">AGENTE SELECCIONADO</span><span className={`detail-status ${selectedStatus}`}>● {statusLabels[selectedStatus]}</span></div>
      <h3>{agent.name}<span> / {agent.role}</span></h3><p>{agent.description}</p>
      <div className="specialty"><Icon name="spark" size={15} />{selectedStatus === 'working' ? agent.task : selectedStatus === 'done' ? 'Etapa completada' : 'Listo para una nueva tarea'}</div>
    </section>
    <section className="simulation">
      <div className="simulation-heading"><span className="simulation-icon"><Icon name="play" size={18} /></span><div><h3>{mode !== 'simulation' ? 'Revisión de cotización' : 'El equipo en acción'}</h3><p>{mode !== 'simulation' && activeQuote ? activeQuote.folio : 'Descubre cómo trabajan juntos.'}</p></div></div>
      <button className="start-button" onClick={start} disabled={running}><Icon name={running ? 'clock' : 'play'} size={17} />{running ? mode !== 'simulation' ? 'Revisando propuesta…' : 'Simulación en curso…' : 'Probar simulación'}{!running && <Icon name="arrow" size={17} />}</button>
      <p className="simulation-note">{mode !== 'simulation' ? 'IA local y cálculo verificado' : 'Animación de demostración · Sin crear documentos'}</p>
      <div className="progress-track" role="progressbar" aria-label="Progreso del equipo" aria-valuemin={0} aria-valuemax={4} aria-valuenow={Math.max(0, step)}>{agents.map((a, i) => <span key={a.id} className={step > i ? 'done' : running && step === i ? 'working' : ''} />)}</div>
      <p className="run-message" role="status">{running ? `${step + 1} de 4 · ${agents[step].task}` : step === 4 ? mode !== 'simulation' ? '✓ Cotización revisada. Consulta tu propuesta abajo.' : '✓ El equipo completó la simulación' : 'Todo listo. Dale vida a la oficina.'}</p>
    </section>
    <a className="dashboard-quotes-link" href="#cotizaciones">Abrir mis cotizaciones <Icon name="arrow" size={14} /></a>
    <div className="panel-footer"><span className="status-dot" />{completedRuns} {completedRuns === 1 ? 'simulación completada' : 'simulaciones completadas'}<Icon name="cat" size={17} /></div>
  </aside>
}
