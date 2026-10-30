import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { ThreeElements } from '@react-three/fiber'

type BoxProps = { size: [number, number, number]; color: string } & Omit<ThreeElements['mesh'], 'args'>
export function Box({ size, color, ...props }: BoxProps) {
  return <mesh castShadow receiveShadow {...props}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
}
export function Sign({ text, position, width = 3, height = 0.5, color = '#f5edda', background = '#284d40', rotation }: { text: string; position: [number, number, number]; width?: number; height?: number; color?: string; background?: string; rotation?: [number, number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024; canvas.height = 160
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = background; ctx.fillRect(0, 0, 1024, 160)
    ctx.fillStyle = color; ctx.font = '600 52px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(text, 512, 82)
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace
    return map
  }, [text, color, background])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh position={position} rotation={rotation}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
}
