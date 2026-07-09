export default defineEventHandler(async (event) => {
  // GeoJSON is a static file served by Cloudflare CDN at /geo/bangladesh.geojson
  // No build-time import — avoids 3.6MB Worker bundle bloat
  return sendRedirect(event, '/geo/bangladesh.geojson', 301)
})
