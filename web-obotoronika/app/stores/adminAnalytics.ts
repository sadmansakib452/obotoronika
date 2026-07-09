type Count = {
  role: string
  count: number
}

type UserAnalytics = {
  countByRole: Count[]
  roleLast7Days: any[]
}

type UserStatsData = { day: string, total: number }

type UserStats = {
  customer: {
    charts: UserStatsData[]
    increased: boolean
    count: number
  }
  seller: {
    charts: UserStatsData[]
    increased: boolean
    count: number
  }
  total: {
    charts: UserStatsData[]
    increased: boolean
    count: number
  }
}

type CloudFlareStatsData = {
  dimensions: {
    date: string
  }
  sum: {
    requests: number
    bytes: number
    cachedBytes: number
    cachedRequests: number
    threats: number
    pageViews: number
  }
}

type CloudFlareStats = CloudFlareStatsData[]

type StatData = {
  total: number
  data: number[]
  categories: string[]
}

type ProcessedStats = {
  visitor: StatData
  request: StatData
  cached: StatData
  totalData: StatData
  cachedData: StatData
}

const processStats = (data: any[]): ProcessedStats => {
  // Extract categories (dates) and sort them
  const categories = data.map(item => item.dimensions.date).sort()

  return data.reduce(
    (acc, item) => {
      acc.visitor.total += item.sum.pageViews
      acc.request.total += item.sum.requests
      acc.cached.total += item.sum.cachedRequests
      acc.totalData.total += item.sum.bytes
      acc.cachedData.total += item.sum.cachedBytes

      acc.visitor.data.push(item.sum.pageViews)
      acc.request.data.push(item.sum.requests)
      acc.cached.data.push(item.sum.cachedRequests)
      acc.totalData.data.push(item.sum.bytes)
      acc.cachedData.data.push(item.sum.cachedBytes)

      return acc
    },
    {
      visitor: { total: 0, data: [], categories },
      request: { total: 0, data: [], categories },
      cached: { total: 0, data: [], categories },
      totalData: { total: 0, data: [], categories },
      cachedData: { total: 0, data: [], categories },
    },
  )
}

export const useAnalyticsStore = defineStore('adminAnalytics', {
  state: () => ({
    isLoading: false,
    userStats: {
      customer: {
        charts: [],
        increased: false,
        count: 0,
      },
      seller: {
        charts: [],
        increased: false,
        coutn: 0,
      },
      total: {
        charts: [],
        increased: false,
        count: 0,
      },
    } as unknown as UserStats,
    cloudFlareStats: {
      visitor: {
        total: 0,
        data: [] as number[],
        categories: [] as string[],
      },
      request: {
        total: 0,
        data: [] as number[],
        categories: [] as string[],
      },
      cached: {
        total: 0,
        data: [] as number[],
        categories: [] as string[],
      },
    },
    visitor: {
      last: 7,
      data: {},
    },
  }),
  actions: {
    async fetchUserAnalytics() {
      this.isLoading = true
      const { data, error } = await useFetch<SuccessResponse<UserAnalytics>>(
        '/api/dashboard/analytics/admin',
      )
      if (error.value) throw error

      this.userStats = await groupAndAggregateRoleDataByDay(
        data.value?.data.roleLast7Days || [],
      )
      this.isLoading = false
    },
    async fetchCloudFlareStats() {
      this.isLoading = true
      const { data, error } = await useFetch<SuccessResponse<CloudFlareStats>>(
        '/api/dashboard/analytics/cloudflare?last=7',
      )
      if (error.value) throw error
      const raw = data.value?.data
      const stats = processStats(Array.isArray(raw) ? raw : [])
      this.cloudFlareStats = stats
      this.isLoading = false
    },
    async fetchUserVisitorStats() {
      this.isLoading = true
      const { data, error }: any = await useFetch(
        `/api/dashboard/analytics/user-location-summary?last=${this.visitor.last}`,
      )
      if (error.value) throw error
      this.visitor.data = data.value.data
    },
    async fetchDashboardStats() {
      const auth = useAuth()
      const role = auth?.role.value

      this.isLoading = true

      try {
        const tasks = []

        // Only fetch stats if user is admin or supe_admin
        if (role === 'super_admin' || role === 'admin') {
          tasks.push(this.fetchCloudFlareStats())
          tasks.push(this.fetchUserAnalytics())
          tasks.push(this.fetchUserVisitorStats())
        }

        await Promise.all(tasks)
      }
      catch (err) {
        console.error('Error fetching dashboard stats:', err)
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
