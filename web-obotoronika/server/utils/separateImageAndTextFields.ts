export default function separateImageAndTextFields<T extends Record<string, any>>(data: T) {
  const images: Record<string, any> = {}
  const text: Record<string, any> = {}

  const imageRegex = /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i
  const base64Regex = /^data:image\/(png|jpg|jpeg|gif|svg\+xml|webp);base64,/

  Object.entries(data).forEach(([key, value]) => {
    const val = String(value || '')

    const isImage
      = base64Regex.test(val)
        || imageRegex.test(val)
        || key.toLowerCase().includes('image')
        || key.toLowerCase().includes('logo')
        || key.toLowerCase().includes('favicon')
        || key.toLowerCase().includes('banner')

    if (isImage) {
      images[key] = value
    }
    else {
      text[key] = value
    }
  })

  return { images, text }
}
