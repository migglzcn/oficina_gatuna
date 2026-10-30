import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'
import type { OrthographicCamera } from 'three'
import { useOfficeStore } from '../../store/officeStore'
import { OfficeRoom } from './OfficeRoom'
import { Assistant } from '../assistant/Assistant'

function CameraRig() {
  const ref = useRef<OrbitControlsType>(null)
  const revision = useOfficeStore((s) => s.cameraRevision)
  const size = useThree((s) => s.size)
  const zoom = Math.max(1, Math.min(size.width / 16.5, size.height / 12))

  useEffect(() => {
    // Canvas creates this camera before the first frame; no default-camera swap is needed.
    const controls = ref.current
    if (!controls) return
    const orthographic = controls.object as OrthographicCamera
    orthographic.position.set(12, 11, 15)
    orthographic.lookAt(0, 0.7, 0)
    orthographic.zoom = zoom
    orthographic.updateProjectionMatrix()
    controls.target.set(0, 0.7, 0)
    controls.update()
  }, [revision, zoom])

  return <OrbitControls ref={ref} target={[0, 0.7, 0]} enablePan={false} minZoom={zoom * 0.75} maxZoom={zoom * 1.8} minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 2.8} minAzimuthAngle={Math.PI / 12} maxAzimuthAngle={Math.PI / 2.5} enableDamping />
}

function RenderHealth({ onReady, onContextLost }: { onReady: () => void; onContextLost: () => void }) {
  const reported = useRef(false)
  const gl = useThree((s) => s.gl)
  useFrame(() => {
    // Confirm that an actual draw took place, rather than just that Canvas mounted.
    if (!reported.current && gl.info.render.calls > 0) {
      reported.current = true
      onReady()
    }
  })
  useEffect(() => {
    const canvas = gl.domElement
    const lost = (event: Event) => { event.preventDefault(); onContextLost() }
    canvas.addEventListener('webglcontextlost', lost)
    return () => canvas.removeEventListener('webglcontextlost', lost)
  }, [gl, onContextLost])
  return null
}

class SceneBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state: { error: string | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error: error.message } }
  render() {
    if (this.state.error) return <div className="scene-fallback" role="alert"><strong>No se pudo abrir la escena 3D.</strong><span>{this.state.error}</span><span>Recarga la página para volver a intentarlo.</span></div>
    return this.props.children
  }
}

export function OfficeScene() {
  const chatOpen = useOfficeStore((s) => s.chatOpen)
  const [status, setStatus] = useState<'loading' | 'ready' | 'stalled' | 'lost'>('loading')
  const ready = useCallback(() => setStatus('ready'), [])
  const lost = useCallback(() => setStatus('lost'), [])
  useEffect(() => {
    const timeout = window.setTimeout(() => setStatus((current) => current === 'loading' ? 'stalled' : current), 10000)
    return () => window.clearTimeout(timeout)
  }, [])

  return <div className="office-renderer" data-scene-status={status}>
    <SceneBoundary>
      <Canvas orthographic camera={{ position: [12, 11, 15], zoom: 40, near: 0.1, far: 100 }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} shadows dpr={[1, 1.7]} gl={{ antialias: true }} fallback={<div className="scene-fallback" role="alert">Tu navegador no tiene WebGL disponible. Activa la aceleración gráfica y recarga la página.</div>}>
        <color attach="background" args={['#e9ece3']} />
        <ambientLight intensity={1.2} /><hemisphereLight args={['#fff9e7', '#8b9b81', 1.6]} />
        <directionalLight position={[1, 10, 5]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-normalBias={0.035} />
        <Suspense fallback={null}><OfficeRoom /></Suspense>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}><planeGeometry args={[200, 200]} /><shadowMaterial transparent opacity={0.12} /></mesh>
        <CameraRig />
        <RenderHealth onReady={ready} onContextLost={lost} />
      </Canvas>
      {status !== 'ready' && <div className={`render-status ${status}`} role="status">{status === 'loading' ? 'Preparando la oficina 3D…' : status === 'lost' ? 'Se perdió la conexión con el renderizador gráfico. Recarga la página.' : 'El renderizador 3D no ha respondido. Comprueba la aceleración gráfica y recarga la página.'}</div>}
    </SceneBoundary>
    <div className="salem-balloon-layer" style={{display: chatOpen ? 'block' : 'none'}}><Assistant compact /></div>
  </div>
}
