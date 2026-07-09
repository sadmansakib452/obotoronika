export function useIsSticky(threshold = 150) {
  const isSticky = ref(false)

  const handleScroll = () => {
    isSticky.value = window.pageYOffset > threshold
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isSticky,
  }
}
