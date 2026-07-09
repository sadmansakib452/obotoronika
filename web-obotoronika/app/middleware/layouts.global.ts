export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path.startsWith('/dashboard')) {
    setPageLayout('dashboard')
  }
  else {
    setPageLayout('default')
  }
})
