import { Box } from './Primitives'

export function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.25, 0.18, 0.5, 16]} /><meshStandardMaterial color="#d7c4a4" /></mesh>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <group key={i} rotation={[0, i * 2.4, 0]}><mesh position={[0.16, 0.77 + i * 0.065, 0]} rotation={[0, 0, -0.6]} scale={[0.14, 0.36, 0.07]} castShadow><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color={i % 2 ? '#507c45' : '#759358'} /></mesh></group>)}
  </group>
}
export function Desk({ position }: { position: [number, number, number] }) {
  return <group position={position} rotation={[0, Math.PI, 0]}>
    <Box size={[2.7, 0.12, 1.3]} position={[0, 1.25, 0]} color="#bd9065" />
    {[-1.12, 1.12].map((x) => <group key={x}><Box size={[0.09, 1.2, 0.09]} position={[x, 0.6, -0.45]} color="#354a43" /><Box size={[0.09, 1.2, 0.09]} position={[x, 0.6, 0.45]} color="#354a43" /></group>)}
    <Box size={[0.98, 0.64, 0.07]} position={[0, 1.85, -0.26]} color="#293b39" />
    <Box size={[0.88, 0.53, 0.015]} position={[0, 1.85, -0.216]} color="#a7c7b7" />
    {[0, 1, 2].map((i) => <Box key={i} size={[0.48 - i * 0.08, 0.025, 0.01]} position={[-0.09, 2 - i * 0.13, -0.204]} color={i === 0 ? '#40685c' : '#e1ece0'} />)}
    <Box size={[0.07, 0.25, 0.07]} position={[0, 1.48, -0.26]} color="#354a43" /><Box size={[0.42, 0.035, 0.24]} position={[0, 1.34, -0.26]} color="#354a43" />
    <Box size={[0.77, 0.045, 0.27]} position={[0, 1.34, 0.3]} color="#d9dfd5" />
    {[0, 1, 2].map((row) => Array.from({ length: 9 }, (_, col) => <Box key={`${row}-${col}`} size={[0.055, 0.012, 0.045]} position={[-0.31 + col * 0.077, 1.369, 0.22 + row * 0.075]} color="#879a90" />))}
    <Box size={[0.12, 0.05, 0.19]} position={[0.66, 1.35, 0.28]} color="#e6e7db" />
    <mesh position={[-0.95, 1.45, 0.25]} castShadow><cylinderGeometry args={[0.09, 0.075, 0.23, 16]} /><meshStandardMaterial color="#f3ead8" /></mesh>
    <Box size={[0.32, 0.035, 0.43]} position={[1, 1.34, 0.05]} rotation={[0, -0.14, 0]} color="#45665a" />
    <group position={[-1, 1.33, -0.35]}><Box size={[0.06, 0.55, 0.06]} position={[0, 0.26, 0]} color="#414c42" /><mesh position={[0.1, 0.55, 0]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.19, 0.22, 16]} /><meshStandardMaterial color="#ddc69b" /></mesh></group>
  </group>
}
export function Chair({ position }: { position: [number, number, number] }) {
  return <group position={position} rotation={[0, Math.PI, 0]}>
    <Box size={[0.78, 0.13, 0.7]} position={[0, 0.65, 0]} color="#697c66" />
    <Box size={[0.78, 0.75, 0.12]} position={[0, 1.05, 0.36]} color="#697c66" />
    <Box size={[0.1, 0.5, 0.1]} position={[0, 0.35, 0]} color="#3f4943" />
    {[0, 1, 2, 3, 4].map((i) => <group key={i} rotation={[0, i * Math.PI * 2 / 5, 0]}><Box size={[0.5, 0.07, 0.07]} position={[0.2, 0.12, 0]} color="#3f4943" /><mesh position={[0.43, 0.08, 0]}><sphereGeometry args={[0.065, 8, 8]} /><meshStandardMaterial color="#303d37" /></mesh></group>)}
  </group>
}
