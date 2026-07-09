declare module '*.geojson' {
  const value: {
    type: string
    features: Array<{
      type: string
      properties: Record<string, string>
      geometry: {
        type: string
        coordinates: number[][][][]
      }
    }>
  }
  export default value
}

declare module 'bangladesh-geojson/boundary' {
  const value: {
    type: string
    crs: Record<string, unknown>
    features: Array<{
      type: string
      properties: Record<string, string>
      geometry: {
        type: string
        coordinates: number[][][][]
      }
    }>
  }
  export default value
}
