import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils } from 'three'
import type { AgentDefinition } from '../../data/agents'
import { getAgentStatus, statusLabels, useOfficeStore } from '../../store/officeStore'
import { Box } from '../furniture/Primitives'

function Ball({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return <mesh position={position} scale={scale} castShadow><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
}
const idlePhrases = [
  'Ya quiero que sea viernes…', '¿Hay fiesta en la noche?', 'Quiero un churu.',
  'Lo que hago por sacar para las croquetas…', 'Esta junta pudo ser un maullido.',
  'Cinco minutitos de siesta y sigo.', '¿Quién se acabó el atún?',
  'Trabajo duro para consentir a mi humano.', '¿Las horas extra se pagan en churu?',
  'Hoy se factura, mañana se ronronea.', 'Necesito café… y una caja.',
  'No estoy dormido, estoy procesando.', '¿Ya es hora de comer?',
  'La productividad sube con las croquetas.', 'Hay fiesta en la noche, ¡miau!',
]
function AgentSpeech({ id, working }: { id: AgentDefinition['id']; working: boolean }) {
  const chatOpen = useOfficeStore((s) => s.chatOpen)
  const acknowledgements = useOfficeStore((s) => s.miloAcknowledgements)
  const [acknowledging, setAcknowledging] = useState(false)
  const [remark, setRemark] = useState<string | null>(null)
  useEffect(() => {
    if (id !== 'costos' || !acknowledgements) return
    const show = window.setTimeout(() => setAcknowledging(true), 0)
    const hide = window.setTimeout(() => setAcknowledging(false), 3000)
    return () => { window.clearTimeout(show); window.clearTimeout(hide) }
  }, [acknowledgements, id])
  useEffect(() => {
    let next: number
    let hide: number
    let previous = -1
    const speak = () => {
      let choice = Math.floor(Math.random() * idlePhrases.length)
      if (choice === previous) choice = (choice + 1) % idlePhrases.length
      previous = choice
      setRemark(idlePhrases[choice])
      hide = window.setTimeout(() => setRemark(null), 6500)
      next = window.setTimeout(speak, 22000 + Math.random() * 18000)
    }
    next = window.setTimeout(speak, 8000 + Math.random() * 14000)
    return () => { window.clearTimeout(next); window.clearTimeout(hide) }
  }, [])
  const available = { coordinador: '¡Esperando chamba!', costos: '¡Listo para sacar cuentas!', cotizador: '¡Ideas listas para cotizar!', revisor: '¡Que no se escape nada!' }
  const active = { coordinador: '¡Organizando la chamba!', costos: '¡Señor, sí señor!', cotizador: '¡Armando la propuesta!', revisor: '¡Revisando cada detalle!' }
  const text = id === 'costos' && acknowledging ? '¡Señor, sí señor!' : working ? active[id] : remark || available[id]
  if (id === 'coordinador' && chatOpen) return null
  return <span className="agent-speech-bubble" key={text}>{text}</span>
}

export function ExecutiveCat({ agent, index }: { agent: AgentDefinition; index: number }) {
  const openChat = useOfficeStore((s) => s.openChat)
  const selected = useOfficeStore((s) => s.selectedId === agent.id)
  const select = useOfficeStore((s) => s.select)
  const step = useOfficeStore((s) => s.step)
  const running = useOfficeStore((s) => s.running)
  const mode = useOfficeStore((s) => s.mode)
  const completed = useOfficeStore((s) => s.aiCompleted)
  const status = getAgentStatus(index, step, running, mode === 'ai' ? completed : undefined)
  const [hovered, setHovered] = useState(false)
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const head = useRef<Group>(null)
  const tail = useRef<Group>(null)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const working = status === 'working'
    if (leftArm.current && rightArm.current) {
      leftArm.current.rotation.x = MathUtils.damp(leftArm.current.rotation.x, working ? -0.8 + Math.sin(t * 12) * 0.2 : -0.32, 12, delta)
      rightArm.current.rotation.x = MathUtils.damp(rightArm.current.rotation.x, working ? -0.8 + Math.sin(t * 12 + Math.PI) * 0.2 : -0.32, 12, delta)
    }
    if (head.current) head.current.rotation.z = Math.sin(t * 1.4 + index) * 0.025
    if (tail.current) tail.current.rotation.y = Math.sin(t * 1.7 + index) * 0.17
  })
  return <group position={[agent.position[0], 0, agent.position[2] - 0.86]} onClick={(e) => { e.stopPropagation(); select(agent.id); if (agent.id === 'coordinador') openChat() }} onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }} onPointerOut={() => setHovered(false)}>
    {(selected || hovered) && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><ringGeometry args={[0.48, 0.52, 48]} /><meshBasicMaterial color={selected ? '#d9ab62' : '#9eb69e'} /></mesh>}
    <group rotation={[0, 0, 0]}>
      <Ball position={[0, 1.12, 0]} scale={[0.33, 0.44, 0.24]} color={agent.suit} />
      <Box size={[0.24, 0.48, 0.045]} position={[0, 1.2, 0.225]} color="#f3efdf" />
      {[-1, 1].map((side) => <group key={side}>
        <Box size={[0.14, 0.4, 0.05]} position={[side * 0.16, 1.22, 0.24]} rotation={[0, 0, side * -0.22]} color={agent.suit} />
        <Ball position={[side * 0.16, 0.62, 0.16]} scale={[0.13, 0.28, 0.13]} color={agent.suit} />
        <Ball position={[side * 0.16, 0.38, 0.25]} scale={[0.14, 0.09, 0.22]} color="#303737" />
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
    <Html position={[0, 2.65, 0]} center zIndexRange={[20, 0]}><button className={`scene-label ${selected ? 'selected' : ''} ${status}`} onClick={() => { select(agent.id); if(agent.id === 'coordinador') openChat() }}><span className="status-dot" /><AgentSpeech id={agent.id} working={status === 'working'} />{agent.name}<span className="label-role">{status === 'working' ? 'Escribiendo…' : status === 'done' ? statusLabels[status] : agent.role}</span></button></Html>
  </group>
}
