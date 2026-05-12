export type PeselType = 'PL' | 'UA'

export type ProductType =
  | 'life_a'
  | 'life_b'
  | 'oc'
  | 'ac'
  | 'oc_ac'
  | 'property'
  | 'investment'

export type PolicyStatus =
  | 'submitted'
  | 'in_review'
  | 'ready'
  | 'accepted'
  | 'active'
  | 'expired'
  | 'claim_in_progress'

export type PaymentFrequency =
  | 'monthly'
  | 'quarterly'
  | 'semi-annual'
  | 'annual'

export type DocumentType = 'owu' | 'kid' | 'ipz'

export type ChatSender = 'client' | 'agent'

export interface Address {
  street: string
  house_number: string
  apartment_number?: string
  postal_code: string
  city: string
  country?: string
}

export interface StatusHistoryEntry {
  status: PolicyStatus
  changed_at: string
  note?: string
}

export interface PolicyDocument {
  id: string
  name: string
  file_url: string
  doc_type: DocumentType
}

export interface Client {
  id: string
  pesel?: string
  pesel_type: PeselType
  first_name: string
  last_name: string
  birth_date?: string
  gender?: 'M' | 'K'
  email: string
  phone: string
  address?: Address
  created_at: string
  last_login?: string
  has_account: boolean
  deep_link_token?: string
  agent_notes?: string
}

export interface Policy {
  id: string
  client_id: string
  product_type: ProductType
  policy_number?: string
  start_date?: string
  end_date?: string
  premium?: number
  frequency?: PaymentFrequency
  status: PolicyStatus
  status_history: StatusHistoryEntry[]
  documents?: PolicyDocument[]
  custom_pdfs?: PolicyDocument[]
  claim_link?: string
  claim_phone?: string
  created_at: string
}

export interface Application {
  id: string
  client_id: string
  product_type: ProductType
  form_data: Record<string, unknown>
  ank_data?: Record<string, unknown>
  medical_data?: Record<string, unknown>
  status: string
  submitted_at: string
  ip_address?: string
}

export interface AnkRecord {
  id: string
  client_id: string
  application_id?: string
  product_type: ProductType
  answers: Record<string, unknown>
  accepted_at: string
  ip_address: string
  created_at: string
}

export interface DocumentLibraryItem {
  id: string
  product_type: ProductType
  doc_type: DocumentType
  name: string
  file_url: string
  version: string
  uploaded_at: string
}

export interface ChatMessage {
  id: string
  client_id: string
  sender: ChatSender
  content: string
  read: boolean
  created_at: string
}

export interface Notification {
  id: string
  client_id: string
  type: string
  title: string
  body: string
  sent_at: string
  opened_at?: string
}
