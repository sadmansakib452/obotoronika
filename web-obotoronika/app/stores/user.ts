type Address = {
  id: number
  fullname: string
  phone: string
  address_type: string
  address: string
  city: string
  region: string
  is_default: boolean
  is_saved: boolean
}

export const useUserStore = defineStore('user', {
  state: () => ({
    addresses: [] as Address[],
    address: {
      id: 0,
      name: '',
      phone: '',
      type: '',
      address: '',
      city: '',
      region: '',
    },
    isLoading: false,
  }),
  actions: {
    async getAddresses() {
      this.isLoading = true
      const { data }: any = await useFetch('/api/profiles/addresses')
      this.addresses = data.value.data
      this.isLoading = false
    },
    async getAddress() {
      const { data }: any = await useFetch('/api/profiles/addresses/default', {
        method: 'get',
      })
      if (data.value?.data) {
        const address = data.value.data
        this.address.id = address.id
        this.address.name = address.fullname
        this.address.phone = address.phone
        this.address.type = address.address_type
        this.address.address = address.address
        this.address.region = address.region
        this.address.city = address.city
        console.log(data.value.data)
      }
    },
  },
})
