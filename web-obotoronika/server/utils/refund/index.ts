/**
 * Refund Utilities Index - Export all refund-related utilities
 * Location: server/utils/refund/index.ts
 *
 * This module exports:
 * - RefundConfig: Configuration management
 * - RefundManager: Core refund processing logic (Chapter 4)
 * - Types: All TypeScript interfaces
 */

export { RefundConfig } from './RefundConfig'
export type {
  RefundConfigValue,
  RefundConfigRow,
  TimingConfig,
  ConditionConfig,
  RulesConfig,
  GatewayConfig,
  RefundConfig as IRefundConfig,
} from './RefundConfig'

// Export all types
export type {
  ReturnType,
  ReturnStatus,
  RefundMethod,
  CreateReturnDTO,
  UpdateReturnDTO,
  ReturnRequest,
  RefundProcessDTO,
  RefundResult,
  RefundStatusCheck,
  ValidationResult,
  ReturnRequestListResponse,
  ReturnStats,
} from './types'
