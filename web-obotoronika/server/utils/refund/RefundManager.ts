/**
 * Refund Manager - Core Business Logic - Chapter 4
 *
 * Purpose: Central utility for all refund/return operations
 * Location: server/utils/refund/RefundManager.ts
 *
 * This is the main utility that integrates:
 * - Database operations (return_requests table)
 * - Configuration system (RefundConfig)
 * - Payment gateway (SSLCommerz)
 * - Order status management
 *
 * Usage:
 *   const refundManager = new RefundManager()
 *   await refundManager.createReturnRequest({...})
 *   await refundManager.approveReturn(returnId, adminId)
 *   await refundManager.processRefund(returnId)
 */

import supabaseAdmin from '../supabaseAdmin'
import { RefundConfig } from './RefundConfig'
import { SSLCommerzRefundHelper } from '~~/server/ssl/api/refund-helper'
import type {
  CreateReturnDTO,
  ReturnRequest,
  RefundResult,
  ValidationResult,
  RefundStatusCheck,
} from './types'

// ========================================================
// RefundManager Class
// ========================================================

export class RefundManager {
  private sslCommerz: SSLCommerzRefundHelper

  constructor(live = false) {
    this.sslCommerz = new SSLCommerzRefundHelper(live)
  }

  // ========================================================
  // Step 4.1: Core Structure & Validation
  // ========================================================

  /**
   * Validate if an order can be returned or cancelled
   * This is the main entry point to check eligibility
   *
   * @param orderId - The order ID to check
   * @param type - 'cancellation' or 'return'
   */
  async validateOrder(orderId: number, type: 'cancellation' | 'return'): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: false,
      can_cancel: false,
      can_return: false,
      errors: [],
      warnings: [],
    }

    try {
      // 1. Fetch order details
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*, profiles!inner(id, email, full_name)')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        result.errors.push('Order not found')
        return result
      }

      // 2. Get configuration
      const config = await RefundConfig.get()

      // 3. Check cancellation eligibility
      if (config.conditions.cancellation_allowed_status.includes(order.status)) {
        result.can_cancel = true
      }
      else {
        result.warnings.push(`Order status '${order.status}' does not allow cancellation`)
      }

      // 4. Check return eligibility
      if (config.conditions.return_allowed_status.includes(order.status)) {
        result.can_return = true
      }
      else {
        result.warnings.push(`Order status '${order.status}' does not allow returns`)
      }

      // 5. Check if order is already refunded/canceled
      if (['refunded', 'canceled', 'returned'].includes(order.status)) {
        result.errors.push(`Order is already ${order.status}`)
        return result
      }

      // 6. Check for existing return requests
      const { data: existingRequests } = await supabaseAdmin
        .from('return_requests')
        .select('id, status')
        .eq('order_id', orderId)
        .in('status', ['pending', 'approved', 'processing'])

      if (existingRequests && existingRequests.length > 0) {
        result.errors.push('An active return request already exists for this order')
        return result
      }

      // 7. Determine validity based on type
      if (type === 'cancellation') {
        result.valid = result.can_cancel
      }
      else {
        result.valid = result.can_return
      }

      return result
    }
    catch (error: any) {
      console.error('[RefundManager] validateOrder error:', error)
      result.errors.push(`Validation failed: ${error.message}`)
      return result
    }
  }

  /**
   * Check if user owns the order
   */
  async verifyOrderOwnership(orderId: number, userId: string): Promise<boolean> {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return false
    }

    return order.user_id === userId
  }

  // ========================================================
  // Step 4.2: Create Return Request
  // ========================================================

  /**
   * Create a new return or cancellation request
   *
   * @param data - Return request details
   * @param userId - User creating the request
   */
  async createReturnRequest(data: CreateReturnDTO, userId: string): Promise<ReturnRequest> {
    try {
      // 1. Validate the request
      const validation = await this.validateOrder(data.order_id, data.type)

      if (!validation.valid) {
        throw new Error(validation.errors.join(', '))
      }

      // 2. Verify ownership
      const isOwner = await this.verifyOrderOwnership(data.order_id, userId)
      if (!isOwner) {
        throw new Error('You do not own this order')
      }

      // 3. Calculate refund amount
      const refundAmount = await this.calculateRefundAmount(data.order_id)

      // 4. Create return request
      const { data: returnRequest, error } = await supabaseAdmin
        .from('return_requests')
        .insert({
          order_id: data.order_id,
          user_id: userId,
          type: data.type,
          status: 'pending',
          reason: data.reason,
          description: data.description || null,
          images: data.images || [],
          refund_amount: refundAmount,
          method: data.refund_method || 'original_payment',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('[RefundManager] createReturnRequest DB error:', error)
        throw new Error(`Failed to create return request: ${error.message}`)
      }

      if (!returnRequest) {
        throw new Error('Failed to create return request')
      }

      // 5. Update order status based on type
      const newStatus = data.type === 'cancellation' ? 'canceled' : 'return_pending'
      await this.updateOrderStatus(data.order_id, newStatus)

      return returnRequest as ReturnRequest
    }
    catch (error: any) {
      console.error('[RefundManager] createReturnRequest error:', error)
      throw error
    }
  }

  /**
   * Calculate refund amount for an order
   * Applies refund config rules: shipping cost deduction, gateway commission deduction
   *
   * Logic:
   * 1. Start with the net amount after gateway fee (store_amount)
   * 2. Then deduct shipping cost if configured
   * This ensures proper order of deductions
   */
  async calculateRefundAmount(orderId: number): Promise<number> {
    try {
      // Get order total
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('total_amount, order_id')
        .eq('id', orderId)
        .single()

      if (error || !order) {
        return 0
      }

      const config = await RefundConfig.get()

      // Get transaction to find store_amount (amount merchant received after gateway fee)
      const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('payment_details')
        .eq('order_id', orderId)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Determine base amount (what merchant actually received)
      let baseAmount: number

      if (config.rules.deduct_gateway_commission && transaction?.payment_details?.ipn?.store_amount) {
        // Use store_amount - this is what merchant received after SSLCommerz fee
        baseAmount = parseFloat(transaction.payment_details.ipn.store_amount)
        console.log(`[RefundManager] Using store_amount: ${baseAmount} (customer paid: ${order.total_amount})`)
      }
      else if (config.rules.deduct_gateway_commission) {
        // Fallback: Calculate approximately 4% commission if store_amount not available
        const commissionRate = 0.04
        baseAmount = order.total_amount * (1 - commissionRate)
        console.log(`[RefundManager] Using estimated store_amount: ${baseAmount} (fallback - no store_amount stored)`)
      }
      else {
        // No gateway commission deduction - use full order amount
        baseAmount = order.total_amount
        console.log(`[RefundManager] Using full order amount: ${baseAmount}`)
      }

      // Now deduct shipping cost from the base amount
      let refundAmount = baseAmount

      if (config.rules.deduct_shipping_cost) {
        const { data: merchantOrders } = await supabaseAdmin
          .from('merchant_orders')
          .select('shipping_cost')
          .eq('order_id', orderId)

        if (merchantOrders) {
          const totalShipping = merchantOrders.reduce((sum, mo) => sum + (mo.shipping_cost || 0), 0)
          refundAmount = refundAmount - totalShipping
          console.log(`[RefundManager] Shipping deducted: ${totalShipping}, final refund: ${refundAmount}`)
        }
      }

      return Math.max(0, refundAmount)
    }
    catch (error) {
      console.error('[RefundManager] calculateRefundAmount error:', error)
      return 0
    }
  }

  // ========================================================
  // Step 4.3: Admin Actions - Approve/Reject
  // ========================================================

  /**
   * Approve a return request (Admin action)
   */
  async approveReturn(returnId: number, adminId: string, notes?: string): Promise<ReturnRequest> {
    try {
      // 1. Get return request
      const { data: returnRequest, error: fetchError } = await supabaseAdmin
        .from('return_requests')
        .select('*, orders!inner(order_id)')
        .eq('id', returnId)
        .single()

      if (fetchError || !returnRequest) {
        throw new Error('Return request not found')
      }

      if (returnRequest.status !== 'pending') {
        throw new Error(`Cannot approve return request with status: ${returnRequest.status}`)
      }

      // 2. Update return request status
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('return_requests')
        .update({
          status: 'approved',
          processed_by: adminId,
          admin_notes: notes || null,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', returnId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to approve return: ${updateError.message}`)
      }

      return updated as ReturnRequest
    }
    catch (error: any) {
      console.error('[RefundManager] approveReturn error:', error)
      throw error
    }
  }

  /**
   * Reject a return request (Admin action)
   */
  async rejectReturn(returnId: number, adminId: string, reason: string): Promise<ReturnRequest> {
    try {
      // 1. Get return request
      const { data: returnRequest, error: fetchError } = await supabaseAdmin
        .from('return_requests')
        .select('*')
        .eq('id', returnId)
        .single()

      if (fetchError || !returnRequest) {
        throw new Error('Return request not found')
      }

      if (returnRequest.status !== 'pending') {
        throw new Error(`Cannot reject return request with status: ${returnRequest.status}`)
      }

      // 2. Update return request status
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('return_requests')
        .update({
          status: 'rejected',
          processed_by: adminId,
          admin_notes: reason,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', returnId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to reject return: ${updateError.message}`)
      }

      // 3. Restore order status if it was changed
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', returnRequest.order_id)
        .single()

      if (order?.status === 'return_pending') {
        // Restore to delivered status
        await this.updateOrderStatus(returnRequest.order_id, 'delivered')
      }

      return updated as ReturnRequest
    }
    catch (error: any) {
      console.error('[RefundManager] rejectReturn error:', error)
      throw error
    }
  }

  // ========================================================
  // Step 4.4: Process Refund - The Core Function
  // ========================================================

  /**
   * Process refund - This is the main function that triggers SSLCommerz API
   *
   * @param returnRequestId - The return request ID to process
   * @param customAmount - Optional custom refund amount
   * @param remarks - Optional custom remarks
   */
  async processRefund(
    returnRequestId: number,
    customAmount?: number,
    remarks?: string,
  ): Promise<RefundResult> {
    try {
      // Step 1: Get return request
      const { data: returnRequest, error: fetchError } = await supabaseAdmin
        .from('return_requests')
        .select('*, orders!inner(order_id, user_id)')
        .eq('id', returnRequestId)
        .single()

      if (fetchError || !returnRequest) {
        throw new Error('Return request not found')
      }

      // Step 2: Validate status
      if (!['approved', 'received'].includes(returnRequest.status)) {
        throw new Error(`Cannot process refund for return request with status: ${returnRequest.status}`)
      }

      // Step 3: Check gateway is enabled
      const isEnabled = await RefundConfig.isGatewayEnabled('sslcommerz')
      if (!isEnabled) {
        throw new Error('SSLCommerz refund is not enabled')
      }

      // Step 4: Get original transaction (bank_tran_id)
      const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('id, bank_tran_id, amount, status')
        .eq('tran_id', returnRequest.orders?.order_id)
        .eq('status', 'success')
        .single()

      if (!transaction) {
        throw new Error('Original transaction not found or not successful')
      }

      // Step 5: Determine refund amount
      const refundAmount = customAmount || returnRequest.refund_amount

      if (!refundAmount || refundAmount <= 0) {
        throw new Error('Invalid refund amount')
      }

      if (refundAmount > Number(transaction.amount)) {
        throw new Error('Refund amount exceeds original payment amount')
      }

      // Step 6: Generate unique refund transaction ID
      const refundTransId = SSLCommerzRefundHelper.generateRefundTransId()

      // Step 7: Call SSLCommerz API
      const sslResult = await this.sslCommerz.initiateRefund({
        bank_tran_id: transaction.bank_tran_id,
        refund_trans_id: refundTransId,
        refund_amount: refundAmount,
        refund_remarks: remarks || `Refund for ${returnRequest.type}: ${returnRequest.reason}`,
      })

      // Step 8: Handle SSLCommerz response
      if (sslResult.status === 'success' && sslResult.refund_ref_id) {
        // Step 9: Create refund record in database
        const { data: refundRecord, error: refundError } = await supabaseAdmin
          .from('refunds')
          .insert({
            order_id: returnRequest.order_id,
            invoice_id: null, // Can be enhanced to link to invoice
            transaction_id: transaction.id,
            refund_id: sslResult.refund_ref_id,
            amount: refundAmount,
            reason: returnRequest.reason,
            status: 'paid', // Mark as paid since initiated
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (refundError) {
          console.error('[RefundManager] Failed to create refund record:', refundError)
        }

        // Step 10: Update return request status
        await supabaseAdmin
          .from('return_requests')
          .update({
            status: 'processing',
            refund_id: refundRecord?.id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', returnRequestId)

        // Step 11: Update order status
        await this.updateOrderStatus(returnRequest.order_id, 'refunded')

        return {
          success: true,
          refund_ref_id: sslResult.refund_ref_id,
          bank_tran_id: sslResult.bank_tran_id,
          status: sslResult.status,
          message: 'Refund initiated successfully',
        }
      }
      else {
        // Refund initiation failed
        throw new Error(sslResult.errorReason || 'Refund initiation failed')
      }
    }
    catch (error: any) {
      console.error('[RefundManager] processRefund error:', error)

      // Update return request status to failed
      try {
        await supabaseAdmin
          .from('return_requests')
          .update({
            status: 'failed',
            admin_notes: error.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', returnRequestId)
      }
      catch (updateError) {
        console.error('[RefundManager] Failed to update status to failed:', updateError)
      }

      return {
        success: false,
        error: error.message,
        message: error.message,
      }
    }
  }

  /**
   * Check refund status from SSLCommerz
   */
  async checkRefundStatus(refundRefId: string): Promise<RefundStatusCheck> {
    try {
      const response = await this.sslCommerz.queryRefundStatus({
        refund_ref_id: refundRefId,
      })

      return {
        status: response.status as 'refunded' | 'processing' | 'cancelled' | 'failed',
        initiated_on: response.initiated_on,
        refunded_on: response.refunded_on || undefined,
        errorReason: response.errorReason || undefined,
      }
    }
    catch (error: any) {
      console.error('[RefundManager] checkRefundStatus error:', error)
      return {
        status: 'failed',
        errorReason: error.message,
      }
    }
  }

  // ========================================================
  // Helper Methods
  // ========================================================

  /**
   * Update order status
   */
  private async updateOrderStatus(orderId: number, status: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      console.error('[RefundManager] updateOrderStatus error:', error)
      throw new Error(`Failed to update order status: ${error.message}`)
    }
  }

  /**
   * Get return request by ID
   */
  async getReturnRequest(returnId: number): Promise<ReturnRequest | null> {
    const { data, error } = await supabaseAdmin
      .from('return_requests')
      .select('*, orders(*), profiles!user_id(email, full_name)')
      .eq('id', returnId)
      .single()

    if (error) {
      console.error('[RefundManager] getReturnRequest error:', error)
      return null
    }

    return data as ReturnRequest
  }

  /**
   * List return requests (with filters)
   */
  async listReturnRequests(
    filters: {
      userId?: string
      status?: string
      type?: string
      page?: number
      perPage?: number
    } = {},
  ): Promise<{ data: ReturnRequest[], total: number }> {
    const { userId, status, type, page = 1, perPage = 10 } = filters

    let query = supabaseAdmin
      .from('return_requests')
      .select('*', { count: 'exact' })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const offset = (page - 1) * perPage
    query = query.range(offset, offset + perPage - 1)
    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      console.error('[RefundManager] listReturnRequests error:', error)
      return { data: [], total: 0 }
    }

    return {
      data: (data || []) as ReturnRequest[],
      total: count || 0,
    }
  }

  /**
   * Cancel/withdraw a return request (Customer action)
   */
  async withdrawReturn(returnId: number, userId: string): Promise<ReturnRequest> {
    try {
      // 1. Verify ownership
      const { data: returnRequest, error: fetchError } = await supabaseAdmin
        .from('return_requests')
        .select('*, orders!inner(user_id)')
        .eq('id', returnId)
        .single()

      if (fetchError || !returnRequest) {
        throw new Error('Return request not found')
      }

      if (returnRequest.orders?.user_id !== userId) {
        throw new Error('You do not own this return request')
      }

      if (returnRequest.status !== 'pending') {
        throw new Error(`Cannot withdraw return request with status: ${returnRequest.status}`)
      }

      // 2. Update status to withdrawn
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('return_requests')
        .update({
          status: 'withdrawn',
          updated_at: new Date().toISOString(),
        })
        .eq('id', returnId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to withdraw: ${updateError.message}`)
      }

      // 3. Restore order status
      const originalStatus = returnRequest.type === 'cancellation' ? 'pending' : 'delivered'
      await this.updateOrderStatus(returnRequest.order_id, originalStatus)

      return updated as ReturnRequest
    }
    catch (error: any) {
      console.error('[RefundManager] withdrawReturn error:', error)
      throw error
    }
  }
}

// ========================================================
// Export default instance
// ========================================================

export default RefundManager
