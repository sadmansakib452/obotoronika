export const base64ToFile = (base64String: string) => {
  const [, base64Data] = base64String.split(';base64,')
  const mimeType = 'image/jpg'
  const byteCharacters = atob(base64Data)
  const byteArrays = []
  for (let offset = 0; offset < byteCharacters.length; offset++) {
    const byte = byteCharacters.charCodeAt(offset)
    byteArrays.push(byte)
  }
  const blob = new Blob([new Uint8Array(byteArrays)], { type: mimeType })
  const fileName = `file.${mimeType.split('/')[1]}`
  const file = new File([blob], fileName, { type: mimeType })
  return file
}

export const isValidBase64File = (
  base64String: string,
  supportedExtensions: string[],
): boolean => {
  const mimeTypeMatch = base64String.match(/^data:(.+);base64,/)
  if (!mimeTypeMatch) {
    return false
  }

  const mimeType = mimeTypeMatch[1]
  const extension = mimeType.split('/')[1]?.toLowerCase()
  return supportedExtensions.includes(extension || '')
}

export const generateUniqueFileName = (
  prefix: string,
  extension: string,
): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  return `${prefix}-${timestamp}-${randomString}.${extension}`
}
