function sanitizeArrayOfObjects(array: any[]) {
  const sanitized = array.filter(item => item.name && item.value)
  return sanitized.length > 0 ? sanitized : []
}

export default function sanitizeState(state: any) {
  const arrayProperties = [
    'customFields',
    'locationBasedShippingPrice',
    'variants',
  ]

  for (const key in state) {
    if (Array.isArray(state[key])) {
      if (arrayProperties.includes(key)) {
        state[key] = sanitizeArrayOfObjects(state[key])
      }
    }
    else {
      if (!state[key]) {
        if (typeof state[key] === 'boolean') {
          state[key] = false
        }
        else if (typeof state[key] === 'number') {
          state[key] = 0
        }
        else if (typeof state[key] === 'string') {
          state[key] = ''
        }
        else {
          state[key] = undefined
        }
      }
    }
  }
  return state
}
