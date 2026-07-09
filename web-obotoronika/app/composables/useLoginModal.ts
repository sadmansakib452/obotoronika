/**
 * Global login modal state. Use from any component (e.g. product cards)
 * to open the login modal when the user is not authenticated.
 */
export function useLoginModal() {
  const isOpen = useState('loginModalOpen', () => false)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    isOpen,
    open,
    close,
  }
}
