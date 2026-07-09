const config = useRuntimeConfig()

export const fileUploader = async (file: File, fileName: string, query?: string) => {
  const formData = new FormData()
  formData.append('file', file, fileName)

  return await fetch(`${config.public.mediaUrl}/api/upload?${query}`, {
    method: 'POST',
    body: formData,
  })
}
