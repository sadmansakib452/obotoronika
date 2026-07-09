export const httpCall = async ({ url, method = 'POST', data = {} }: any) => {
  try {
    const m = String(method || 'POST').toUpperCase()
    const params = new URLSearchParams(data)

    // GET/HEAD cannot have a request body (undici/fetch will throw).
    const requestUrl = (m === 'GET' || m === 'HEAD')
      ? `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`
      : url

    const response = await fetch(requestUrl, {
      method: m,
      headers: m === 'GET' || m === 'HEAD'
        ? undefined
        : { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: m === 'GET' || m === 'HEAD' ? undefined : params.toString(),
    })

    const res = await response.json()
    return res
  }
  catch (error: any) {
    throw new Error(error.message)
  }
}
