/**
 * Refund Configuration System - Chapter 2 Step 2.1
 *
 * Purpose: Dynamic configuration system for refund/return settings
 * Location: server/utils/refund/RefundConfig.ts
 *
 * This module provides:
 * - Type-safe access to refund configuration
 * - Default values as fallback when database config is not available
 * - Methods to read and update configuration
 */

import supabaseAdmin from '../supabaseAdmin'

// ========================================================
// Type Definitions
// ========================================================

export interface RefundConfigValue {
  value: string | number | boolean
  unit?: string
}

export interface RefundConfigRow {
  id: number
  key: string
  value: RefundConfigValue
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TimingConfig {
  return_days: number
  cancellation_days: number
  refund_processing_days: number
}

export interface ConditionConfig {
  cancellation_allowed_status: string[]
  return_allowed_status: string[]
}

export interface RulesConfig {
  deduct_shipping_cost: boolean
  deduct_gateway_commission: boolean
  allow_partial_refund: boolean
  allow_store_credit: boolean
}

export interface GatewayConfig {
  enabled: boolean
  refund_window_days: number
}

export interface RefundConfig {
  timing: TimingConfig
  conditions: ConditionConfig
  rules: RulesConfig
  gateways: {
    sslcommerz: GatewayConfig
    bkash: GatewayConfig
  }
}

// ========================================================
// Default Configuration Values
// ========================================================

const DEFAULT_CONFIG: RefundConfig = {
  timing: {
    return_days: 7,
    cancellation_days: 1,
    refund_processing_days: 7,
  },
  conditions: {
    cancellation_allowed_status: ['pending', 'processing'],
    return_allowed_status: ['delivered', 'completed'],
  },
  rules: {
    deduct_shipping_cost: false,
    deduct_gateway_commission: false,
    allow_partial_refund: true,
    allow_store_credit: false,
  },
  gateways: {
    sslcommerz: {
      enabled: true,
      refund_window_days: 90,
    },
    bkash: {
      enabled: false,
      refund_window_days: 30,
    },
  },
}

// ========================================================
// RefundConfig Class
// ========================================================

/**
 * RefundConfig - Manages refund system configuration
 *
 * Usage:
 *   const config = await RefundConfig.get()
 *   const returnDays = config.timing.return_days
 */
export class RefundConfig {
  private static configCache: RefundConfig | null = null
  private static cacheTime: number = 0
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache

  /**
   * Get all refund configuration
   * Uses cache to avoid repeated database queries
   */
  static async get(): Promise<RefundConfig> {
    // Check if cache is valid
    if (this.configCache && Date.now() - this.cacheTime < this.CACHE_TTL) {
      return this.configCache
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('refund_config')
        .select('key, value')
        .eq('is_active', true)

      if (error) {
        console.error('[RefundConfig] Database error:', error.message)
        return DEFAULT_CONFIG
      }

      if (!data || data.length === 0) {
        console.warn('[RefundConfig] No config found in database, using defaults')
        return DEFAULT_CONFIG
      }

      // Parse database values into config object
      const config = this.parseConfigFromDB(data)

      // Update cache
      this.configCache = config
      this.cacheTime = Date.now()

      return config
    }
    catch (error) {
      console.error('[RefundConfig] Error fetching config:', error)
      return DEFAULT_CONFIG
    }
  }

  /**
   * Get a specific configuration value
   */
  static async getValue(key: string): Promise<RefundConfigValue | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('refund_config')
        .select('value')
        .eq('key', key)
        .eq('is_active', true)
        .single()

      if (error) {
        console.warn(`[RefundConfig] Config key not found: ${key}`)
        return null
      }

      return data?.value as RefundConfigValue
    }
    catch (error) {
      console.error(`[RefundConfig] Error fetching key ${key}:`, error)
      return null
    }
  }

  /**
   * Update a configuration value
   */
  static async setValue(key: string, value: RefundConfigValue, description?: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('refund_config')
        .upsert({
          key,
          value,
          description: description || null,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key',
        })

      if (error) {
        console.error(`[RefundConfig] Error updating key ${key}:`, error.message)
        return false
      }

      // Invalidate cache after update
      this.invalidateCache()

      return true
    }
    catch (error) {
      console.error(`[RefundConfig] Error setting key ${key}:`, error)
      return false
    }
  }

  /**
   * Check if order can be cancelled based on configuration
   */
  static async canCancel(orderStatus: string): Promise<boolean> {
    const config = await this.get()
    return config.conditions.cancellation_allowed_status.includes(orderStatus)
  }

  /**
   * Check if order can be returned based on configuration
   */
  static async canReturn(orderStatus: string): Promise<boolean> {
    const config = await this.get()
    return config.conditions.return_allowed_status.includes(orderStatus)
  }

  /**
   * Get return window in days
   */
  static async getReturnWindowDays(): Promise<number> {
    const config = await this.get()
    return config.timing.return_days
  }

  /**
   * Get cancellation window in days
   */
  static async getCancellationWindowDays(): Promise<number> {
    const config = await this.get()
    return config.timing.cancellation_days
  }

  /**
   * Check if a specific gateway is enabled
   */
  static async isGatewayEnabled(gateway: 'sslcommerz' | 'bkash'): Promise<boolean> {
    const config = await this.get()
    return config.gateways[gateway]?.enabled ?? false
  }

  /**
   * Invalidate the configuration cache
   * Call this after making changes to force refresh
   */
  static invalidateCache(): void {
    this.configCache = null
    this.cacheTime = 0
  }

  /**
   * Force refresh configuration from database
   */
  static async refresh(): Promise<RefundConfig> {
    this.invalidateCache()
    return await this.get()
  }

  /**
   * Parse database rows into RefundConfig object
   */
  private static parseConfigFromDB(rows: { key: string, value: any }[]): RefundConfig {
    const config: any = { ...DEFAULT_CONFIG }

    for (const row of rows) {
      const key = row.key
      const value = row.value?.value ?? row.value

      // Parse timing config
      if (key === 'timing.return_days' && typeof value === 'number') {
        config.timing.return_days = value
      }
      else if (key === 'timing.cancellation_days' && typeof value === 'number') {
        config.timing.cancellation_days = value
      }
      else if (key === 'timing.refund_processing_days' && typeof value === 'number') {
        config.timing.refund_processing_days = value
      }
      // Parse conditions config
      // Handle both direct array ["pending", "processing"] and wrapped format {"statuses": ["pending", "processing"]}
      else if (key === 'conditions.cancellation_allowed_status') {
        config.conditions.cancellation_allowed_status = this.extractStatusArray(value)
      }
      else if (key === 'conditions.return_allowed_status') {
        config.conditions.return_allowed_status = this.extractStatusArray(value)
      }
      // Parse rules config
      else if (key === 'rules.deduct_shipping_cost') {
        config.rules.deduct_shipping_cost = Boolean(value)
      }
      else if (key === 'rules.deduct_gateway_commission') {
        config.rules.deduct_gateway_commission = Boolean(value)
      }
      else if (key === 'rules.allow_partial_refund') {
        config.rules.allow_partial_refund = Boolean(value)
      }
      else if (key === 'rules.allow_store_credit') {
        config.rules.allow_store_credit = Boolean(value)
      }
      // Parse gateway config
      else if (key === 'gateways.sslcommerz.enabled') {
        config.gateways.sslcommerz.enabled = Boolean(value)
      }
      else if (key === 'gateways.sslcommerz.refund_window_days') {
        config.gateways.sslcommerz.refund_window_days = Number(value)
      }
      else if (key === 'gateways.bkash.enabled') {
        config.gateways.bkash.enabled = Boolean(value)
      }
    }

    return config as RefundConfig
  }

  /**
   * Extract status array from value - handles both direct array and wrapped format
   * Database stores: {"statuses": ["pending", "processing"]}
   * But also accepts: ["pending", "processing"]
   */
  private static extractStatusArray(value: any): string[] {
    // If it's already an array, use it
    if (Array.isArray(value)) {
      return value.filter((v): v is string => typeof v === 'string')
    }

    // If it's an object with 'statuses' property (from database)
    if (value && typeof value === 'object' && 'statuses' in value) {
      const statuses = value.statuses
      if (Array.isArray(statuses)) {
        return statuses.filter((v): v is string => typeof v === 'string')
      }
    }

    // Default fallback
    return []
  }
}

// ========================================================
// Export for easy use
// ========================================================

export default RefundConfig
