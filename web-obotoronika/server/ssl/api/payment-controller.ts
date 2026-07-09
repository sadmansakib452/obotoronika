import { httpCall } from './fetch' // Import the Nuxt-compatible httpCall utility
import { paymentInitDataProcess } from './payment-init-data-process' // Adjust path as needed

export class SslCommerzPayment {
  baseURL: string
  initURL: string
  validationURL: string
  refundURL: string
  refundQueryURL: string
  transactionQueryBySessionIdURL: string
  transactionQueryByTransactionIdURL: string
  store_id: any
  store_passwd: any
  constructor(store_id: string, store_passwd: string, live = false) {
    this.baseURL = `https://${live ? 'securepay' : 'sandbox'}.sslcommerz.com`
    this.initURL = `${this.baseURL}/gwprocess/v4/api.php`
    this.validationURL = `${this.baseURL}/validator/api/validationserverAPI.php?`
    this.refundURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?`
    this.refundQueryURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?`
    this.transactionQueryBySessionIdURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?`
    this.transactionQueryByTransactionIdURL = `${this.baseURL}/validator/api/merchantTransIDvalidationAPI.php?`
    this.store_id = store_id
    this.store_passwd = store_passwd
  }

  async init(data: any, url = false, method = 'POST') {
    data.store_id = this.store_id
    data.store_passwd = this.store_passwd
    const paymentData = {
      ...paymentInitDataProcess(data),
    }
    return await httpCall({ url: url || this.initURL, method, data: paymentData })
    // return 'xx'
  }

  async validate(data: any, url = false, method = 'GET') {
    return await httpCall({
      url: url || `${this.validationURL}val_id=${data.val_id}&store_id=${this.store_id}&store_passwd=${this.store_passwd}&v=1&format=json`,
      method,
    })
  }

  /**
   * Initiate a refund transaction via SSLCommerz
   *
   * Required Parameters:
   * - bank_tran_id: The transaction ID from the original payment
   * - refund_trans_id: Unique refund transaction ID (mandatory since Feb 2024)
   * - refund_amount: Amount to refund
   * - refund_remarks: Reason for refund
   *
   * @param data - Object containing refund details
   * @param url - Optional override URL
   * @param method - HTTP method (default: GET)
   */
  async initiateRefund(data: any, url = false, method = 'GET') {
    // Validate required parameters
    if (!data.bank_tran_id) {
      throw new Error('bank_tran_id is required for refund')
    }
    if (!data.refund_trans_id) {
      throw new Error('refund_trans_id is required for refund')
    }
    if (!data.refund_amount || data.refund_amount <= 0) {
      throw new Error('refund_amount must be greater than 0')
    }

    // Encode refund remarks for URL safety
    const encodedRemarks = encodeURIComponent(data.refund_remarks || 'Customer refund request')
    const encodedRefId = encodeURIComponent(data.refe_id || '')

    return await httpCall({
      url: url || `${this.refundURL}bank_tran_id=${data.bank_tran_id}&refund_trans_id=${data.refund_trans_id}&refund_amount=${data.refund_amount}&refund_remarks=${encodedRemarks}&refe_id=${encodedRefId}&store_id=${this.store_id}&store_passwd=${this.store_passwd}&v=1&format=json`,
      method,
    })
  }

  /**
   * Query refund status from SSLCommerz
   *
   * Use the refund_ref_id returned from initiateRefund() to check status
   *
   * @param data - Object containing refund_ref_id
   * @param url - Optional override URL
   * @param method - HTTP method (default: GET)
   */
  async refundQuery(data: any, url = false, method = 'GET') {
    // Validate required parameters
    if (!data.refund_ref_id) {
      throw new Error('refund_ref_id is required to query refund status')
    }

    const encodedRefundRefId = encodeURIComponent(data.refund_ref_id)

    return await httpCall({
      url: url || `${this.refundQueryURL}refund_ref_id=${encodedRefundRefId}&store_id=${this.store_id}&store_passwd=${this.store_passwd}&v=1&format=json`,
      method,
    })
  }

  async transactionQueryBySessionId(data: any, url = false, method = 'GET') {
    return await httpCall({
      url: url || `${this.transactionQueryBySessionIdURL}sessionkey=${data.sessionkey}&store_id=${this.store_id}&store_passwd=${this.store_passwd}&v=1&format=json`,
      method,
    })
  }

  async transactionQueryByTransactionId(data: any, url = false, method = 'GET') {
    return await httpCall({
      url: url || `${this.transactionQueryByTransactionIdURL}tran_id=${data.tran_id}&store_id=${this.store_id}&store_passwd=${this.store_passwd}&v=1&format=json`,
      method,
    })
  }
}
