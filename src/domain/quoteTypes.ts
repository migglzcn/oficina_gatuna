export interface Party {
  name: string
  contact: string
  email: string
  phone: string
  rfc: string
  address: string
}
export interface QuoteItem { id: string; description: string; quantity: number; rate: number }
export interface Adjustment { type: 'percent' | 'fixed'; value: number }
export interface Quote {
  id: string
  folio: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'reviewed' | 'pending' | 'approved'
  reviewedAt: string | null
  provider: Party
  client: Party
  kind: 'training' | 'service'
  title: string
  description: string
  scope: string
  modality: 'En línea' | 'Presencial' | 'Híbrida' | 'Por confirmar'
  location: string
  schedule: string
  participants: number | null
  training: { package: 'standard' | 'excel'; hours: number; rate: number }
  items: QuoteItem[]
  discount: Adjustment
  taxRate: number
  advance: Adjustment
  issueDate: string
  validityDays: number
  conditions: string
}
export interface QuoteTotals {
  items: (QuoteItem & { amount: number })[]
  subtotal: number
  discount: number
  base: number
  tax: number
  total: number
  advance: number
  balance: number
}
export interface QuoteIssue { field: string; message: string }
export interface ReviewResult { agent: string; message: string }
