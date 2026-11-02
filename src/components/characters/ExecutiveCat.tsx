import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils } from 'three'
import type { AgentDefinition } from '../../data/agents'
import { getAgentStatus, statusLabels, useOfficeStore } from '../../store/officeStore'
import { filingPose } from '../../domain/filing'
import { agentComment } from '../../domain/agentComments'
import { Box } from '../furniture/Primitives'

function Ball({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return <mesh position={position} scale={scale} castShadow><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
}
const idlePhrases = [
  '¿Y si mejor vendemos barbacha los domingos?',
  '¿A quién se le ocurrió el impuesto a las croquetas?',
  'No se conforman con el IVA y el ISR… ¡también las croquetas!',
  'Mi plan de retiro es una caja junto a la ventana.',
  'Si me buscan, estoy en una junta con mi siesta.',
  '¿El aguinaldo incluye atún premium?',
  'Mi jefe dice que piense fuera de la caja. Pero está bien cómoda.',
  'Hoy amanecí con actitud de viernes y pendientes de lunes.',
  'La quincena llega caminando y se va corriendo.',
  'Si trabajar diera tanto gusto, cobrarían entrada.',
  '¿Quién puso la junta a la hora del churu?',
  'Estoy a una croqueta de tomar vacaciones.',
  'Yo no tiro cosas: hago pruebas de gravedad.',
  'Mi currículum dice experto en caer parado.',
  'Necesito vacaciones de estas ganas de vacaciones.',
  'Ya quiero que sea viernes…', '¿Hay fiesta en la noche?', 'Quiero un churu.',
  'Lo que hago por sacar para las croquetas…', 'Esta junta pudo ser un maullido.',
  'Cinco minutitos de siesta y sigo.', '¿Quién se acabó el atún?',
  'Trabajo duro para consentir a mi humano.', '¿Las horas extra se pagan en churu?',
  'Hoy se factura, mañana se ronronea.', 'Necesito café… y una caja.',
  'No estoy dormido, estoy procesando.', '¿Ya es hora de comer?',
  'La productividad sube con las croquetas.', 'Hay fiesta en la noche, ¡miau!',
]
const catchphrases: Record<AgentDefinition['id'], string> = { coordinador: '¡Chambeando duro!', costos: '¡Listo para sacar cuentas!', cotizador: '¡Ideas listas para cotizar!', revisor: '¡Que no se escape nada!' }
function AgentSpeech({ id, working }: { id: AgentDefinition['id']; working: boolean }) {
  const delivery = useOfficeStore((s) => s.filingQueue[0])
  const filed = useOfficeStore((s) => s.filedIds)
  const context = useOfficeStore((s) => s.requestContext)
  const entry = useOfficeStore((s) => s.stageEntries[{coordinador:0,costos:1,cotizador:2,revisor:3}[id]])
  const [handling, setHandling] = useState(false)
  const [variant, setVariant] = useState(() => Math.floor(Math.random() * 1000))
  useEffect(() => {
    if (!entry) return
    const show=window.setTimeout(()=>setHandling(true),0)
    const hide=window.setTimeout(()=>setHandling(false),7000)
    return ()=>{window.clearTimeout(show);window.clearTimeout(hide)}
  },[entry])
  useEffect(()=>{
    if(!working)return
    const interval=window.setInterval(()=>setVariant(v=>v+1),4500)
    return ()=>window.clearInterval(interval)
  },[working])
  const acknowledgements = useOfficeStore((s) => s.miloAcknowledgements)
  const [acknowledging, setAcknowledging] = useState(false)
  const [remark, setRemark] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (id !== 'costos' || !acknowledgements) return
    const show = window.setTimeout(() => setAcknowledging(true), 0)
    const hide = window.setTimeout(() => setAcknowledging(false), 3000)
    return () => { window.clearTimeout(show); window.clearTimeout(hide) }
  }, [acknowledgements, id])
  useEffect(() => {
    let next: number
    let fade: number
    let hide: number
    let previous = -1
    const phrases = id === 'coordinador' ? ['¡Chambeando duro!', 'Ojalá pronto caiga otra cotización…', '¡Esperando chamba!', 'Una coti más y sale para las croquetas.', 'Mi equipo y yo estamos listos, ¡miau!', ...idlePhrases] : idlePhrases
    const speak = () => {
      // Each cat mixes its own catchphrase with the shared office chatter, then goes quiet for a while.
      let choice = Math.floor(Math.random() * (phrases.length + 1))
      if (choice === previous) choice = (choice + 1) % (phrases.length + 1)
      previous = choice
      const duration = 4500 + Math.random() * 2500
      setLeaving(false)
      setRemark(choice === phrases.length ? catchphrases[id] : phrases[choice])
      fade = window.setTimeout(() => setLeaving(true), duration - 300)
      hide = window.setTimeout(() => setRemark(null), duration)
      next = window.setTimeout(speak, duration + 9000 + Math.random() * 16000)
    }
    next = window.setTimeout(speak, 1500 + Math.random() * 9000)
    return () => { window.clearTimeout(next); window.clearTimeout(fade); window.clearTimeout(hide) }
  }, [id])
  const active = { coordinador: '¡Organizando la chamba!', costos: '¡Señor, sí señor!', cotizador: '¡Armando la propuesta!', revisor: '¡Revisando cada detalle!' }
  const filingText=id==='revisor'&&delivery ? `${delivery.client||'Jefe'}: ${filed.includes(delivery.id)?'¡Guardadita en Cotizaciones!':'¡La llevo al archivo, jefe!'}` : null
  const text = filingText || (working || handling) && context ? agentComment(id,context,id === 'costos' && acknowledging ? 0 : variant) : id === 'costos' && acknowledging ? '¡Señor, sí señor!' : working ? active[id] : remark || (id === 'coordinador' ? catchphrases[id] : null)
  if (!text) return null
  return <span className={`agent-speech-bubble ${leaving && !filingText && !handling && id !== 'coordinador' && !working && !acknowledging ? 'leaving' : ''}`} key={text}>{text}</span>
}

export function ExecutiveCat({ agent, index }: { agent: AgentDefinition; index: number }) {
  const delivery = useOfficeStore((s) => s.filingQueue[0])
  const actor = useRef<Group>(null)
  const folder = useRef<Group>(null)
  const trip = useRef({id:'',elapsed:0})
  const leftLeg = useRef<Group>(null)
  const rightLeg = useRef<Group>(null)
  const openChat = useOfficeStore((s) => s.openChat)
  const selected = useOfficeStore((s) => s.selectedId === agent.id)
  const select = useOfficeStore((s) => s.select)
  const step = useOfficeStore((s) => s.step)
  const running = useOfficeStore((s) => s.running)
  const mode = useOfficeStore((s) => s.mode)
  const completed = useOfficeStore((s) => s.aiCompleted)
  const status = getAgentStatus(index, step, running, mode === 'ai' ? completed : undefined)
  const [hovered, setHovered] = useState(false)
  // StrictMode remounts drei's <Html> root during the first commit and the discarded root can leave a label empty; remount it once afterwards.
  const [labelKey, setLabelKey] = useState(0)
  useEffect(() => {
    const timer = window.setTimeout(() => setLabelKey(1), 0)
    return () => window.clearTimeout(timer)
  }, [])
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const head = useRef<Group>(null)
  const tail = useRef<Group>(null)
  useFrame(({ clock }, delta) => {
    if(agent.id==='revisor'&&delivery&&actor.current){
      if(trip.current.id!==delivery.id)trip.current={id:delivery.id,elapsed:0}
      trip.current.elapsed+=Math.min(delta,0.1)
      const pose=filingPose(trip.current.elapsed,[agent.position[0],0,agent.position[2]-0.86])
      actor.current.position.set(...pose.position)
      actor.current.rotation.y=pose.rotation
      if(pose.walking)actor.current.position.y+=Math.sin(trip.current.elapsed*14)*0.025
      if(leftLeg.current)leftLeg.current.rotation.x=pose.walking?Math.sin(trip.current.elapsed*9)*0.35:0
      if(rightLeg.current)rightLeg.current.rotation.x=pose.walking?-Math.sin(trip.current.elapsed*9)*0.35:0
      if(folder.current)folder.current.visible=!pose.deposited
      if(pose.deposited)useOfficeStore.getState().markFiled(delivery.id)
      if(pose.finished){actor.current.position.set(agent.position[0],0,agent.position[2]-0.86);actor.current.rotation.set(0,0,0);useOfficeStore.getState().finishFiling(delivery.id)}
    }else if(agent.id==='revisor'){
      if(actor.current){actor.current.position.set(agent.position[0],0,agent.position[2]-0.86);actor.current.rotation.set(0,0,0)}
      if(folder.current)folder.current.visible=false
      if(leftLeg.current)leftLeg.current.rotation.x=0
      if(rightLeg.current)rightLeg.current.rotation.x=0
    }
    const t = clock.elapsedTime
    const working = status === 'working'
    if (leftArm.current && rightArm.current) {
      leftArm.current.rotation.x = MathUtils.damp(leftArm.current.rotation.x, working ? -0.8 + Math.sin(t * 12) * 0.2 : -0.32, 12, delta)
      rightArm.current.rotation.x = MathUtils.damp(rightArm.current.rotation.x, working ? -0.8 + Math.sin(t * 12 + Math.PI) * 0.2 : -0.32, 12, delta)
    }
    if (head.current) head.current.rotation.z = Math.sin(t * 1.4 + index) * 0.025
    if (tail.current) tail.current.rotation.y = Math.sin(t * 1.7 + index) * 0.17
  })
  return <group ref={actor} position={[agent.position[0], 0, agent.position[2] - 0.86]} onClick={(e) => { e.stopPropagation(); select(agent.id); if (agent.id === 'coordinador') openChat() }} onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }} onPointerOut={() => setHovered(false)}>
    {(selected || hovered) && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><ringGeometry args={[0.48, 0.52, 48]} /><meshBasicMaterial color={selected ? '#d9ab62' : '#9eb69e'} /></mesh>}
    <group ref={folder} visible={false} position={[0,1.2,0.45]}><Box size={[0.5,0.04,0.36]} color="#e4c88b"/><Box size={[0.43,0.01,0.29]} position={[0,0.03,0]} color="#fff8e6"/></group>
    <group rotation={[0, 0, 0]}>
      <Ball position={[0, 1.12, 0]} scale={[0.33, 0.44, 0.24]} color={agent.suit} />
      <Box size={[0.24, 0.48, 0.045]} position={[0, 1.2, 0.225]} color="#f3efdf" />
      {[-1, 1].map((side) => <group key={side}>
        <Box size={[0.14, 0.4, 0.05]} position={[side * 0.16, 1.22, 0.24]} rotation={[0, 0, side * -0.22]} color={agent.suit} />
        <group ref={side===-1?leftLeg:rightLeg}><Ball position={[side * 0.16, 0.62, 0.16]} scale={[0.13, 0.28, 0.13]} color={agent.suit} />
        <Ball position={[side * 0.16, 0.38, 0.25]} scale={[0.14, 0.09, 0.22]} color="#303737" /></group>
      </group>)}
      <mesh position={[0, 1.24, 0.269]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.065, 0.31, 4]} /><meshStandardMaterial color={agent.tie} /></mesh>
      <Ball position={[0, 1.43, 0.27]} scale={[0.055, 0.055, 0.03]} color={agent.tie} />
      {[-1, 1].map((side) => <group ref={side === -1 ? leftArm : rightArm} key={side} position={[side * 0.35, 1.39, 0]}>
        <Ball position={[0, -0.16, 0.06]} scale={[0.115, 0.25, 0.12]} color={agent.suit} />
        <Ball position={[0, -0.32, 0.22]} scale={[0.105, 0.09, 0.2]} color={agent.suit} />
        <Ball position={[0, -0.32, 0.4]} scale={[0.11, 0.085, 0.11]} color={agent.fur} />
      </group>)}
      <group ref={head} position={[0, 1.88, 0]}>
        <Ball position={[0, 0, 0]} scale={[0.39, 0.35, 0.31]} color={agent.fur} />
        {[-1, 1].map((side) => <group key={side}>
          <mesh position={[side * 0.26, 0.3, 0]} rotation={[0, 0, side * -0.22]} castShadow><coneGeometry args={[0.18, 0.36, 3]} /><meshStandardMaterial color={agent.fur} /></mesh>
          <mesh position={[side * 0.26, 0.31, 0.085]} rotation={[0, 0, side * -0.22]}><coneGeometry args={[0.1, 0.23, 3]} /><meshStandardMaterial color="#c59389" /></mesh>
          <Ball position={[side * 0.155, 0.05, 0.276]} scale={[0.088, 0.105, 0.04]} color="#d3d9ab" />
          <Ball position={[side * 0.155, 0.05, 0.313]} scale={[0.025, 0.075, 0.016]} color="#202f28" />
          <Ball position={[side * 0.135, 0.078, 0.33]} scale={[0.018, 0.025, 0.008]} color="#ffffff" />
          <Ball position={[side * 0.085, -0.115, 0.29]} scale={[0.13, 0.09, 0.07]} color={agent.id === 'coordinador' ? '#7a817c' : '#ecdfcc'} />
          {[-1, 0, 1].map((j) => <Box key={j} size={[0.25, 0.009, 0.009]} position={[side * 0.3, -0.1 + j * 0.055, 0.3]} rotation={[0, 0, side * j * 0.15]} color={agent.id === 'coordinador' ? '#c5c4b8' : '#606c66'} />)}
        </group>)}
        <Ball position={[0, -0.08, 0.365]} scale={[0.055, 0.04, 0.03]} color="#b8797b" />
      </group>
      <group ref={tail} position={[0, 0.88, -0.16]}><mesh rotation={[Math.PI / 2, 0.25, 0]} position={[0.25, -0.05, -0.24]} castShadow><torusGeometry args={[0.34, 0.07, 10, 24, Math.PI * 1.3]} /><meshStandardMaterial color={agent.fur} /></mesh></group>
    </group>
    <Html key={labelKey} position={[0, 2.65, 0]} center zIndexRange={[20, 0]}><button className={`scene-label ${selected ? 'selected' : ''} ${status}`} onClick={() => { select(agent.id); if(agent.id === 'coordinador') openChat() }}><span className="status-dot" /><AgentSpeech id={agent.id} working={status === 'working'} />{agent.name}<span className="label-role">{status === 'working' ? 'Escribiendo…' : status === 'done' ? statusLabels[status] : agent.role}</span></button></Html>
  </group>
}
