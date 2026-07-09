export function useCustomBodyScrollLock(locked: Ref<boolean>, className = 'no-scroll') {
  let body: HTMLElement | null = null

  const update = (isLocked: boolean) => {
    if (!body) return
    if (isLocked) {
      body.classList.add(className)
    }
    else {
      body.classList.remove(className)
    }
  }

  onMounted(() => {
    body = document.body
    update(locked.value) // Apply initial state

    watch(locked, (isLocked) => {
      update(isLocked)
    })
  })

  onUnmounted(() => {
    if (body?.classList.contains(className)) {
      body.classList.remove(className)
    }
  })
}
