export const useSettingsStore = defineStore('settings', {
  state: () => ({
    isPageLoading: false,
    isError: false,
    errorMessage: '',
    menu: [],
  }),
  actions: {
    setIsPageLoading(value: boolean) {
      this.isPageLoading = value
    },
    setIsError(isError: boolean, msg: string) {
      this.isError = isError
      this.errorMessage = msg
    },
    async getMenu() {
      const response: any = await $fetch('/api/menus')
      this.menu = response?.data ?? []
      return this.menu
    },
  },
})
