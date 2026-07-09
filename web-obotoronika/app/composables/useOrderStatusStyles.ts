/**
 * Shared order status badge styles with light and dark mode support.
 * Use getOrderStatusClasses(status) for a single class string, or orderStatusStyles for custom use.
 */
export const orderStatusStyles: Record<string, { bg: string, text: string }> = {
  pending: {
    bg: 'bg-gray-100 dark:bg-gray-700/60',
    text: 'text-gray-700 dark:text-gray-300',
  },
  processing: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-400',
  },
  shipped: {
    bg: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-700 dark:text-sky-400',
  },
  delivered: {
    bg: 'bg-lime-100 dark:bg-lime-900/40',
    text: 'text-lime-700 dark:text-lime-400',
  },
  completed: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  canceled: {
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    text: 'text-rose-700 dark:text-rose-400',
  },
  cancelled: {
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    text: 'text-rose-700 dark:text-rose-400',
  },
  returned: {
    bg: 'bg-zinc-200 dark:bg-zinc-700/60',
    text: 'text-zinc-700 dark:text-zinc-300',
  },
  refunded: {
    bg: 'bg-violet-100 dark:bg-violet-900/40',
    text: 'text-violet-700 dark:text-violet-400',
  },
  failed: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-400',
  },
}

const defaultStatusStyles = {
  bg: 'bg-gray-100 dark:bg-gray-700/60',
  text: 'text-gray-600 dark:text-gray-400',
}

/**
 * Returns the combined class string for an order status badge (bg + text).
 * Handles unknown statuses and normalizes status key (e.g. lowercase).
 */
function getOrderStatusClasses(status: string | undefined | null): string {
  if (!status || typeof status !== 'string') return `${defaultStatusStyles.bg} ${defaultStatusStyles.text}`
  const key = status.toLowerCase().trim()
  const styles = orderStatusStyles[key] ?? defaultStatusStyles
  return `${styles.bg} ${styles.text}`
}

export function useOrderStatusStyles() {
  return { orderStatusStyles, getOrderStatusClasses }
}
