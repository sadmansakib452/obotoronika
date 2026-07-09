<template>
  <div :class="['progress-wrap', { 'active-progress': isVisible }]" @click="scrollToTop">
    <svg
      class="progress-circle svg-content"
      width="100%"
      height="100%"
      viewBox="-1 -1 102 102"
    >
      <path ref="progressPath" d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const isVisible = ref(false)
const progressPath = ref(null)

const handleScroll = () => {
  if (progressPath.value) {
    const pathLength = progressPath.value.getTotalLength()
    const scroll = window.scrollY || document.documentElement.scrollTop
    const height = document.documentElement.scrollHeight - window.innerHeight
    const progress = pathLength - (scroll * pathLength) / height
    progressPath.value.style.strokeDashoffset = `${progress}`
  }

  // Make the button visible after scrolling 300px
  isVisible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  nextTick(() => {
    if (progressPath.value) {
      const pathLength = progressPath.value.getTotalLength()
      progressPath.value.style.transition = 'none'
      progressPath.value.style.strokeDasharray = `${pathLength} ${pathLength}`
      progressPath.value.style.strokeDashoffset = `${pathLength}`
    }
    window.addEventListener('scroll', handleScroll)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.progress-wrap {
  @apply fixed right-6 bottom-16 h-11 w-11 cursor-pointer rounded-full shadow-[inset_0_0_0_2px_#cdcdcd] z-[999] opacity-0 invisible translate-y-[15px] transition-all duration-200;
}

.progress-wrap::after{
  content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z" fill="%23ff9c01"/></svg>');
  @apply absolute left-3.5 top-1.5 -rotate-90 text-primary;
}

.progress-wrap.active-progress {
  @apply opacity-100 visible translate-y-0;
}

svg path {
  @apply transition-all duration-200 fill-none stroke-primary box-border;
  stroke-width: 4;
}
</style>
