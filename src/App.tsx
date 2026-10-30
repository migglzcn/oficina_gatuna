import { useEffect } from 'react'
import { OfficeScene } from './components/scene/OfficeScene'
import { Dashboard } from './components/dashboard/Dashboard'
import { Icon } from './components/dashboard/Icon'
import { useOfficeStore } from './store/officeStore'
import './App.css'
import { QuotesWorkspace } from './components/quotes/QuotesWorkspace'
import { useQuoteStore } from './store/quoteStore'

function App() {
  const running = useOfficeStore((s) => s.running)
  const mode = useOfficeStore((s) => s.mode)
  const completeStage = useQuoteStore((s) => s.completeStage)
  const step = useOfficeStore((s) => s.step)
  const advance = useOfficeStore((s) => s.advance)
  const resetCamera = useOfficeStore((s) => s.resetCamera)
  useEffect(() => {
    if (!running || mode === 'ai') return
    const timeout = window.setTimeout(() => {
      if (mode === 'quote') completeStage(step)
      advance()
    }, mode === 'quote' ? 1400 : 3600)
    return () => window.clearTimeout(timeout)
  }, [running, step, mode, advance, completeStage])
  const openChat = useOfficeStore((s) => s.openChat)
  const newQuote = () => {
    if (running) return
    openChat()
    document.getElementById('oficina')?.scrollIntoView({ behavior: 'smooth' })
  }
  return <div className="app-shell">
    <nav className="sidebar" aria-label="Navegación principal">
      <a className="brand-mark" href="#inicio" aria-label="Midev inicio">m<span>·</span></a>
      <div className="nav-items"><a href="#inicio" className="nav-icon" aria-label="Vista general" title="Vista general"><Icon name="grid" /></a><a href="#oficina" className="nav-icon current" aria-label="Departamento de Cotizaciones" title="Cotizaciones"><Icon name="office" /></a><a href="#equipo" className="nav-icon" aria-label="Equipo" title="Equipo"><Icon name="team" /></a></div>
      <a href="#cotizaciones" className="nav-icon quote-nav" aria-label="Mis cotizaciones" title="Cotizaciones guardadas"><Icon name="layers" /></a><div className="sidebar-bottom"><span className="floor-marker" title="Piso 01"><Icon name="layers" /></span><span className="user-avatar" title="Espacio MiDev">M</span></div>
    </nav>
    <div className="workspace" id="inicio">
      <header className="topbar"><a href="#inicio" className="wordmark">MIDEV<span>AI OFFICE</span></a><div className="breadcrumb">Workspace <span>/</span> Oficina virtual</div><div className="connection"><span className="status-dot" />Entorno local<span className="version">V.01</span></div></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow">TU ESPACIO DE INTELIGENCIA COLABORATIVA</div><h1>Grandes propuestas.<br className="mobile-break" /> Un gran equipo<span>.</span></h1><p>Bienvenido a tu oficina virtual. Aquí, cada detalle cuenta.</p></div><div className="page-heading-actions"><span className="department-tag"><Icon name="office" size={15} /> DEPARTAMENTO 01</span><button className="quote-primary" onClick={newQuote} disabled={running}>+ Nueva cotización</button></div></div>
        <div className="office-layout">
          <section className="office-view" id="oficina" aria-label="Oficina 3D interactiva de Cotizaciones">
            <div className="scene-header"><div><span className="room-icon"><Icon name="office" size={18} /></span><div><h2>Cotizaciones</h2><span>Piso 01 <i /> Oficina principal</span></div></div><span className={`live-badge ${running ? 'working' : ''}`}><span className="status-dot" />{running ? 'EN ACTIVIDAD' : 'EN LÍNEA'}</span></div>
            <div className="scene-canvas"><OfficeScene /><div className="scene-corner"><span className="status-dot" />{running ? 'El equipo está trabajando' : '4 agentes en su espacio'}</div><button className="reset-camera" onClick={resetCamera} aria-label="Restablecer cámara" title="Restablecer vista"><Icon name="reset" size={18} /></button><div className="isometric-label">VISTA ISOMÉTRICA <span>↗</span></div></div>
            <div className="scene-footer"><span><span className="mouse-icon" />Arrastra para rotar <b>·</b> Scroll para acercar</span><span><Icon name="cat" size={16} /> Selecciona un gato para conocerlo</span></div>
          </section>
          <div id="equipo"><Dashboard /></div>
        </div>
        <details><summary>Editor manual y cotizaciones guardadas</summary><QuotesWorkspace /></details>
        <div className="bottom-strip"><span><Icon name="spark" size={16} /><strong>La inteligencia trabaja mejor en equipo.</strong><span className="bottom-caption"> Un espacio diseñado para crear posibilidades.</span></span><span>MIDEV <span className="footer-dot">✳</span> Hecho para evolucionar</span></div>
      </main>
      <footer className="app-footer"><span>© {new Date().getFullYear()} MiDev · AI Office</span><span>Primer departamento. Grandes comienzos.</span></footer>
    </div>
  </div>
}
export default App
