export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // Upload
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      const formData = await request.formData()
      const file = formData.get('file')

      if (!file) {
        return Response.json({ success: false, message: 'No file' }, { status: 400 })
      }

      const ext = String(file.name).split('.').pop() || 'jpg'
      const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
      const key = `uploads/${fileName}`

      await env.MEDIA_BUCKET.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || 'image/jpeg' },
      })

      return Response.json(
        { success: true, url: `/${key}`, fileName },
        { headers: { 'Access-Control-Allow-Origin': '*' } },
      )
    }

    // Serve file
    const key = url.pathname.slice(1)
    if (key) {
      const object = await env.MEDIA_BUCKET.get(key)
      if (object) {
        return new Response(object.body, {
          headers: {
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      return new Response('Not Found', { status: 404 })
    }

    return new Response('Obotoronika Media API', {
      headers: { 'Content-Type': 'text/plain' },
    })
  },
}
