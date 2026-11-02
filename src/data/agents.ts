export type AgentId = 'coordinador' | 'costos' | 'cotizador' | 'revisor'
export interface AgentDefinition {
  id: AgentId
  name: string
  role: string
  description: string
  task: string
  fur: string
  suit: string
  tie: string
  accent: string
  position: [number, number, number]
}
export const agents: AgentDefinition[] = [
  { id: 'coordinador', name: 'Salem', role: 'Coordinador', description: 'Organiza las solicitudes y coordina al equipo para que cada propuesta avance en orden.', task: 'Organizando la solicitud', fur: '#272c30', suit: '#20272a', tie: '#c94d49', accent: '#637769', position: [-0.05, 0, 1.9] },
  { id: 'costos', name: 'Milo', role: 'Analista de costos', description: 'Analiza horas, tarifa mínima, comisión e IVA para preparar los costos de capacitación.', task: 'Analizando los costos', fur: '#dc9b50', suit: '#273c54', tie: '#d8a85e', accent: '#c39052', position: [-2.85, 0, -1.4] },
  { id: 'cotizador', name: 'Oliver', role: 'Cotizador', description: 'Organiza conceptos, alcance, temario y condiciones comerciales en una propuesta clara.', task: 'Estructurando la propuesta', fur: '#909a9e', suit: '#266365', tie: '#e4c68b', accent: '#4d8a88', position: [-0.05, 0, -1.4] },
  { id: 'revisor', name: 'Luna', role: 'Revisora de calidad', description: 'Verifica sesiones de dos horas, duración máxima de diez horas y consistencia de la propuesta.', task: 'Revisando los detalles', fur: '#f4eee3', suit: '#78838b', tie: '#7d6385', accent: '#9b88a9', position: [2.75, 0, -1.4] },
]
