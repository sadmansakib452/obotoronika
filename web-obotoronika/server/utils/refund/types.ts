/**
 * Refund System Types - Shared TypeScript interfaces
 * Location: server/utils/refund/types.ts
 */

// ========================================================
// Return Request Types
// ========================================================

export type ReturnType = 'cancellation' | 'return'
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'processing' | 'completed' | 'failed' | 'withdrawn'
export type RefundMethod = 'original_payment' | 'store_credit'

export interface CreateReturnDTO {
  order_id: number
  type: ReturnType
  reason: string
  description?: string
  images?: string[]
  refund_method?: RefundMethod
}

export interface UpdateReturnDTO {
  status?: ReturnStatus
  admin_notes?: string
  processed_by?: string
  processed_at?: string
  refund_id?: number
}

export interface ReturnRequest {
  id: number
  order_id: number
  user_id: string
  type: ReturnType
  status: ReturnStatus
  reason: string
  description: string | null
  images: string[]
  refund_amount: number | null
  method: RefundMethod
  admin_notes: string | null
  processed_by: string | null
  processed_at: string | null
  refund_id: number | null
  created_at: string
  updated_at: string
  // Joined fields
  order?: any
  user?: any
}

// ========================================================
// Refund Processing Types
// ========================================================

export interface RefundProcessDTO {
  return_request_id: number
  refund_amount?: number
  refund_remarks?: string
}

export interface RefundResult {
  success: boolean
  refund_ref_id?: string
  bank_tran_id?: string
  status?: string
  error?: string
  message?: string
}

export interface RefundStatusCheck {
  status: 'refunded' | 'processing' | 'cancelled' | 'failed'
  initiated_on?: string
  refunded_on?: string
  errorReason?: string
}

export interface ValidationResult {
  valid: boolean
  can_cancel: boolean
  can_return: boolean
  errors: string[]
  warnings: string[]
}

// ========================================================
// API Response Types
// ========================================================

export interface ReturnRequestListResponse {
  return_requests: ReturnRequest[]
  meta: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}

export interface ReturnStats {
  total_requests: number
  pending_count: number
  approved_count: number
  rejected_count: number
  completed_count: number
  total_refund_amount: number
}
