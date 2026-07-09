/**
 * useReturns Composable - Chapter 8 Step 8.3
 *
 * Purpose: Easy access to return/refund operations in frontend
 * Location: app/composables/useReturns.ts
 *
 * Usage:
 *   const returns = useReturns()
 *   await returns.fetchMyReturns()
 *   await returns.createReturn({...})
 *   await returns.withdrawReturn(id)
 */

export const useReturns = () => {
  // State
  const returnRequests = ref<any[]>([])
  const currentReturn = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all return requests for current user
  const fetchMyReturns = async (filters?: {
    status?: string
    type?: string
    page?: number
    perPage?: number
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.perPage) params.append('per_page', filters.perPage.toString())

      const response = await $fetch(`/api/returns?${params.toString()}`)

      if (response.success) {
        returnRequests.value = response.data.return_requests
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch returns')
    }
    catch (e: any) {
      error.value = e.message
      console.error('[useReturns] fetchMyReturns error:', e)
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  // Get specific return request details
  const fetchReturnDetails = async (returnId: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/returns/${returnId}`)

      if (response.success) {
        currentReturn.value = response.data.return_request
        return response.data.return_request
      }
      throw new Error(response.message || 'Failed to fetch return details')
    }
    catch (e: any) {
      error.value = e.message
      console.error('[useReturns] fetchReturnDetails error:', e)
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  // Create a new return request
  const createReturn = async (data: {
    order_id: number
    type: 'cancellation' | 'return'
    reason: string
    description?: string
    images?: string[]
    refund_method?: 'original_payment' | 'store_credit'
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/returns', {
        method: 'POST',
        body: data,
      })

      if (response.success) {
        // Add to list
        returnRequests.value.unshift(response.data.return_request)
        return response.data.return_request
      }
      throw new Error(response.message || 'Failed to create return request')
    }
    catch (e: any) {
      error.value = e.data?.message || e.message
      console.error('[useReturns] createReturn error:', e)
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  // Withdraw a pending return request
  const withdrawReturn = async (returnId: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/returns/${returnId}/withdraw`, {
        method: 'POST',
      })

      if (response.success) {
        // Update in list
        const index = returnRequests.value.findIndex(r => r.id === returnId)
        if (index !== -1) {
          returnRequests.value[index] = response.data.return_request
        }
        return response.data.return_request
      }
      throw new Error(response.message || 'Failed to withdraw return')
    }
    catch (e: any) {
      error.value = e.data?.message || e.message
      console.error('[useReturns] withdrawReturn error:', e)
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  // Check refund status
  const checkRefundStatus = async (refundRefId: string) => {
    isLoading.value = true

    try {
      const params = new URLSearchParams()
      params.append('refund_ref_id', refundRefId)

      const response = await $fetch(`/api/refunds/status?${params.toString()}`)

      if (response.success) {
        return response.data
      }
      throw new Error(response.message || 'Failed to check refund status')
    }
    catch (e: any) {
      console.error('[useReturns] checkRefundStatus error:', e)
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  // Helper to get status color
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'yellow',
      approved: 'green',
      rejected: 'red',
      received: 'blue',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
      withdrawn: 'gray',
    }
    return colors[status] || 'gray'
  }

  // Helper to format status
  const formatStatus = (status: string): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    returnRequests,
    currentReturn,
    isLoading,
    error,

    // Methods
    fetchMyReturns,
    fetchReturnDetails,
    createReturn,
    withdrawReturn,
    checkRefundStatus,

    // Helpers
    getStatusColor,
    formatStatus,
    clearError,
  }
}
