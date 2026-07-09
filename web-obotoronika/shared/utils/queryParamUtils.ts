export function parseNestedQuery(raw: string): Record<string, string>[] | false {
  // Decode once in case it's been double-encoded
  const decoded = decodeURIComponent(raw)
  const params = new URLSearchParams(decoded)
  const result: Record<number, Record<string, string>> = {}
  let validFormat = false

  for (const [key, value] of params.entries()) {
    const match = key.match(/^items\[(\d+)]\[(\w+)]$/)

    if (!match || match[1] === undefined || match[2] === undefined) {
      return false
    }

    validFormat = true

    const index = parseInt(match[1], 10)
    const field = match[2]

    if (!result[index]) {
      result[index] = {}
    }

    result[index][field] = value
  }

  if (!validFormat || Object.keys(result).length === 0) {
    return false
  }

  return Object.keys(result)
    .map(Number)
    .sort((a, b) => a - b)
    .map(index => result[index]!)
}

export function buildNestedQueryValue(items: Record<string, any>[]): string {
  return items
    .map((item, index) =>
      Object.entries(item)
        .map(
          ([fieldKey, value]) =>
            `items[${index}][${fieldKey}]=${encodeURIComponent(String(value))}`,
        )
        .join('%26'),
    )
    .join('%26')
}
