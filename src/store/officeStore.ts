import { create } from 'zustand'
import type { RequestContext } from '../domain/agentComments'
import { agents } from '../data/agents.ts'
import type { AgentId } from '../data/agents.ts'

export type AgentStatus = 'idle' | 'working' | 'done'
interface OfficeState {
  filingQueue: {id:string;client:string}[]
  filedIds: string[]
  enqueueFiling: (id:string,client:string) => void
  markFiled: (id:string) => void
  finishFiling: (id:string) => void
  requestContext: RequestContext | null
  setRequestContext: (context: RequestContext | null) => void
  stageEntries: number[]
  miloAcknowledgements: number
  chatRevision: number
  startNewClient: () => void
  chatOpen: boolean
  openChat: () => void
  closeChat: () => void
  aiCompleted: number[]
  selectedId: AgentId
  running: boolean
  mode: 'simulation' | 'quote' | 'ai'
  step: number
  completedRuns: number
  cameraRevision: number
  select: (id: AgentId) => void
  start: () => void
  beginQuote: () => void
  aiStage: (step: number) => void
  endAi: () => void
  advance: () => void
  resetCamera: () => void
}
export const useOfficeStore = create<OfficeState>((set) => ({
  filingQueue: [], filedIds: [],
  enqueueFiling: (id,client) => set(s=>s.filedIds.includes(id)||s.filingQueue.some(item=>item.id===id)?s:{filingQueue:[...s.filingQueue,{id,client}]}),
  markFiled: (id) => set(s=>s.filedIds.includes(id)?s:{filedIds:[...s.filedIds,id]}),
  finishFiling: (id) => set(s=>({filingQueue:s.filingQueue.filter(item=>item.id!==id)})),
  requestContext: null, setRequestContext: (requestContext) => set({requestContext}), stageEntries: [0,0,0,0],
  miloAcknowledgements: 0,
  chatRevision: 0, startNewClient: () => set((s) => s.running ? {...s,chatOpen:true} : {chatRevision:s.chatRevision+1,chatOpen:true,selectedId:'coordinador'}),
  chatOpen: false, openChat: () => set({chatOpen:true,selectedId:'coordinador'}), closeChat: () => set({chatOpen:false}),
  aiCompleted: [], selectedId: 'coordinador', mode: 'simulation', running: false, step: -1, completedRuns: 0, cameraRevision: 0,
  select: (selectedId) => set({ selectedId }),
  start: () => set((state) => state.running ? state : { mode: 'simulation', running: true, step: 0, selectedId: agents[0].id }),
  beginQuote: () => set((state) => state.running ? state : { mode: 'quote', running: true, step: 0, selectedId: agents[0].id }),
  aiStage: (step) => set((s) => ({ stageEntries: s.stageEntries.map((count,i)=> i===step ? count+1 : count), miloAcknowledgements: s.miloAcknowledgements + (step === 1 ? 1 : 0), mode: 'ai', running: true, step, selectedId: agents[step].id, aiCompleted: s.mode === 'ai' && s.running ? [...new Set([...s.aiCompleted,s.step])] : [] })),
  endAi: () => set({ running: false, step: -1, aiCompleted: [] }),
  advance: () => set((state) => {
    if (!state.running) return state
    const next = state.step + 1
    return next >= agents.length
      ? { running: false, step: agents.length, completedRuns: state.completedRuns + (state.mode === 'simulation' ? 1 : 0) }
      : { step: next, selectedId: agents[next].id, miloAcknowledgements: state.miloAcknowledgements + (state.mode === 'quote' && next === 1 ? 1 : 0) }
  }),
  resetCamera: () => set((state) => ({ cameraRevision: state.cameraRevision + 1 })),
}))
export function getAgentStatus(index: number, step: number, running: boolean, completed?: number[]): AgentStatus {
  if (completed) return completed.includes(index) ? 'done' : running && step === index ? 'working' : 'idle'
  if (step > index) return 'done'
  if (running && step === index) return 'working'
  return 'idle'
}
export const statusLabels: Record<AgentStatus, string> = { idle: 'Disponible', working: 'Trabajando', done: 'Completado' }
