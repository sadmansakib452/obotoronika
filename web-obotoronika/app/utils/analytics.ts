type RoleData = {
  day: string
  role: 'customer' | 'seller' | string
  count: number
}

type FormattedData = {
  total: {
    charts: { day: string, total: number }[]
    increased: boolean
    count: number
  }
  customer: {
    charts: { day: string, total: number }[]
    increased: boolean
    count: number
  }
  seller: {
    charts: { day: string, total: number }[]
    increased: boolean
    count: number
  }
}

export const getGreetingMessage = (): string => {
  const now = new Date()
  const hours = now.getHours()

  if (hours < 12) {
    return 'Good morning'
  }
  else if (hours < 18) {
    return 'Good afternoon'
  }
  else {
    return 'Good evening'
  }
}

export const groupAndAggregateRoleDataByDay = async (
  data: RoleData[],
): Promise<FormattedData> => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const totalData: { day: string, total: number }[] = []
  const customerData: { day: string, total: number }[] = []
  const sellerData: { day: string, total: number }[] = []
  days.forEach((day) => {
    const dayData = data.filter(d => d.day.trim() === day)
    const totalUsers = dayData.reduce((sum, d) => sum + d.count, 0)
    const customerUsers = dayData
      .filter(d => d.role === 'customer')
      .reduce((sum, d) => sum + d.count, 0)
    const sellerUsers = dayData
      .filter(d => d.role === 'seller')
      .reduce((sum, d) => sum + d.count, 0)
    totalData.push({ day, total: totalUsers })
    customerData.push({ day, total: customerUsers })
    sellerData.push({ day, total: sellerUsers })
  })
  return {
    total: {
      charts: totalData,
      increased: true,
      count: totalData.reduce((sum, d) => sum + d.total, 0),
    },
    customer: {
      charts: customerData,
      increased: true,
      count: customerData.reduce((sum, d) => sum + d.total, 0),
    },
    seller: {
      charts: sellerData,
      increased: true,
      count: sellerData.reduce((sum, d) => sum + d.total, 0),
    },
  }
}
