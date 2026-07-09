export default function transformFormData(
  body: Record<string, any>,
  schema: any,
  arrayFields: string[] = [], // Define which fields should be treated as arrays of strings
): Record<string, any> {
  const transformed: Record<string, any> = {}

  for (const key in body) {
    // Resolve the actual type, even if it's wrapped in ZodOptional or other wrappers
    let expectedType = schema.shape[key]?._def?.typeName

    // Handle ZodOptional or nested types
    if (expectedType === 'ZodOptional') {
      expectedType = schema.shape[key]?._def?.innerType?._def?.typeName
    }

    // Check if the key is in the arrayFields list
    if (arrayFields.includes(key)) {
      transformed[key] = typeof body[key] === 'string'
        ? body[key].split(',').map((item: string) => item.trim()) // Split comma-separated strings into arrays
        : Array.isArray(body[key])
          ? body[key]
          : []
      continue
    }

    switch (expectedType) {
      case 'ZodNumber':
        transformed[key]
          = body[key] !== undefined && body[key] !== ''
            ? Number(body[key])
            : undefined
        break
      case 'ZodBoolean':
        transformed[key] = body[key] === 'true'
        break
      case 'ZodArray':
        try {
          transformed[key] = JSON.parse(body[key])
        }
        catch {
          transformed[key] = []
        }
        break
      default:
        transformed[key] = body[key]
    }
  }

  return transformed
}
