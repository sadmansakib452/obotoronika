import { errorResponse } from '../../utils/response'

export default defineEventHandler((event) => {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse(event, 404, 'Not Found')
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Obotoronika API Docs (Dev)</title>
    <style>
      body { margin: 0; padding: 0; }
      .docsBanner {
        position: sticky;
        top: 0;
        z-index: 50;
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        font: 13px/1.4 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        background: #0b1220;
        color: #e5e7eb;
        border-bottom: 1px solid rgba(255,255,255,0.12);
      }
      .docsBanner a { color: #93c5fd; text-decoration: none; }
      .docsBanner a:hover { text-decoration: underline; }
      .docsBanner code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        background: rgba(255,255,255,0.08);
        padding: 2px 6px;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <div class="docsBanner">
      <div>
        <strong>Dev-only API docs</strong>
        <span>· OpenAPI:</span>
        <a href="/api/docs/openapi" target="_blank" rel="noopener"><code>/api/docs/openapi</code></a>
      </div>
      <div>
        Redoc UI at <code>/docs</code>
      </div>
    </div>
    <div id="redoc"></div>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script>
      Redoc.init('/api/docs/openapi', { scrollYOffset: 60 }, document.getElementById('redoc'));
    </script>
  </body>
</html>`

  event.node.res.setHeader('content-type', 'text/html; charset=utf-8')
  return html
})
