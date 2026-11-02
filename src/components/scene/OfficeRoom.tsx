import { QuotationCabinet } from '../furniture/QuotationCabinet'
import { Box, Sign } from '../furniture/Primitives'
import { Chair, Desk, Plant } from '../furniture/Furniture'
import { ExecutiveCat } from '../characters/ExecutiveCat'
import { agents } from '../../data/agents'

export function OfficeRoom() {
  return <group>
    <QuotationCabinet/>
    <Box size={[9.5, 0.3, 8]} position={[0, -0.19, 0]} color="#79674f" />
    {Array.from({ length: 24 }, (_, i) => <Box key={i} size={[0.38, 0.09, 7.95]} position={[-4.56 + i * 0.397, 0, 0]} color={['#c7a477', '#cfae83', '#c4a177', '#d3b48d'][i % 4]} />)}
    <Box size={[9.5, 3.7, 0.16]} position={[0, 1.8, -4]} color="#e2e1cf" />
    <Box size={[0.16, 3.7, 5.2]} position={[-4.7, 1.8, -1.4]} color="#e7e6d7" />
    <Box size={[0.16, 0.7, 2.8]} position={[-4.7, 0.3, 2.6]} color="#e7e6d7" />
    <Box size={[9.4, 0.13, 0.08]} position={[0, 0.14, -3.88]} color="#a3aa8b" />
    <Box size={[0.08, 0.13, 7.8]} position={[-4.58, 0.14, 0]} color="#a3aa8b" />
    <Box size={[4.8, 0.85, 0.08]} position={[0.5, 2.7, -3.88]} color="#284d40" />
    <Sign text="MIDEV - COTIZACIONES" position={[0.5, 2.72, -3.82]} width={4.5} height={0.7} />
    <Sign text="IDEAS CLARAS. GRANDES POSIBILIDADES." position={[0.5, 2.08, -3.9]} width={3.7} height={0.28} background="#e2e1cf" color="#637663" />
    <Box size={[0.08, 1.7, 2.8]} position={[-4.59, 2.35, -1.45]} color="#c1d5cf" />
    {[-2.8, -1.45, -0.1].map((z) => <Box key={z} size={[0.12, 1.9, 0.065]} position={[-4.52, 2.35, z]} color="#f7f4e8" />)}
    <Box size={[0.14, 0.065, 2.8]} position={[-4.52, 2.35, -1.45]} color="#f7f4e8" />
    <Box size={[0.35, 0.09, 3]} position={[-4.43, 1.4, -1.45]} color="#eee5cc" />
    <Box size={[7.5, 0.025, 5.4]} position={[-0.4, 0.06, 0.3]} color="#b4bb9e" />
    <Box size={[7.25, 0.028, 5.16]} position={[-0.4, 0.065, 0.3]} color="#bfc5ac" />
    {agents.map((agent, index) => <group key={agent.id}><Chair position={[agent.position[0], 0.08, agent.position[2] - 0.91]} /><ExecutiveCat agent={agent} index={index} /><Desk position={agent.position} /></group>)}
    <Plant position={[-4, 0.06, -3.2]} scale={1.4} /><Plant position={[4, 0.06, -3.1]} scale={1.65} /><Plant position={[-4.05, 0.06, 3.1]} scale={1.2} />
    <group position={[3.95, 0, 1.1]}><Box size={[0.85, 1.6, 1.3]} position={[0, 0.8, 0]} color="#ddd6be" />{[0.4, 0.9, 1.4].map((y) => <group key={y}><Box size={[0.87, 0.025, 1.32]} position={[0, y, 0]} color="#b5ab93" /><Box size={[0.025, 0.05, 0.24]} position={[-0.45, y - 0.18, 0]} color="#627465" /></group>)}<Plant position={[0, 1.62, 0]} scale={0.6} /></group>
    <group position={[3.5, 0, -3.6]}><Box size={[1.7, 0.12, 0.45]} position={[0, 1.6, 0]} color="#b58b63" />{[0, 1, 2, 3, 4].map((i) => <Box key={i} size={[0.12, 0.45 + i % 2 * 0.12, 0.28]} position={[-0.55 + i * 0.17, 1.92, 0]} color={['#597265', '#d1a567', '#e8ddc6'][i % 3]} />)}</group>
    <mesh position={[-3.3, 2.8, -3.87]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.32, 0.32, 0.06, 32]} /><meshStandardMaterial color="#faf5e5" /></mesh>
    <Box size={[0.025, 0.18, 0.02]} position={[-3.3, 2.88, -3.82]} rotation={[0, 0, -0.4]} color="#354f41" />
    <Box size={[0.16, 0.025, 0.02]} position={[-3.24, 2.8, -3.81]} color="#354f41" />
  </group>
}
