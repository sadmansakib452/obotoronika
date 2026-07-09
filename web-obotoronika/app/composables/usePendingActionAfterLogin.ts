const PENDING_ACTION_KEY = 'pendingActionAfterLogin'

export type PendingActionPayload
  = | { type: 'wishlist', productId: string }
    | { type: 'cart', productId: string, quantity: number, variants?: object }

export function usePendingActionAfterLogin() {
  // Global state: which productId is currently being processed (if any)
  const runningProductId = useState<string | null>('pendingActionRunningProductId', () => null)

  function setPendingAction(payload: PendingActionPayload) {
    if (import.meta.client) {
      try {
        sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(payload))
      }
      catch {
        // ignore
      }
    }
  }

  function consumePendingAction(): PendingActionPayload | null {
    if (import.meta.client) {
      try {
        const raw = sessionStorage.getItem(PENDING_ACTION_KEY)
        if (raw) {
          sessionStorage.removeItem(PENDING_ACTION_KEY)
          return JSON.parse(raw) as PendingActionPayload
        }
      }
      catch {
        sessionStorage.removeItem(PENDING_ACTION_KEY)
      }
    }
    return null
  }

  function setRunningProductId(productId: string | null) {
    runningProductId.value = productId
  }

  return {
    setPendingAction,
    consumePendingAction,
    runningProductId,
    setRunningProductId,
  }
}
