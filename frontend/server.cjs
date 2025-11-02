const express = require('express')
const path = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()
const DIST_DIR = path.join(__dirname, 'dist')
const PORT = process.env.PORT || 8080
const BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

// Proxy API paths to backend (support both /api/* and direct endpoints like /register/)
// Direct API namespace: preserve '/api' in forwarded path
app.use('/api', createProxyMiddleware({
  target: BACKEND,
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  pathRewrite: (path) => {
    const newPath = path.startsWith('/api') ? path : `/api${path}`
    console.log('[proxy] /api:', path, '->', newPath)
    return newPath
  },
  onProxyReq: (proxyReq, req) => {
    console.log('[proxyReq]', req.method, proxyReq.path)
  }
}))

// Convenience rewrites: map app's top-level endpoints to Django's /api/* endpoints
app.use(['/register', '/login'], createProxyMiddleware({
  target: BACKEND,
  changeOrigin: true,
  secure: false,
  logLevel: 'warn',
  pathRewrite: {
    '^/register': '/api/register',
    '^/login': '/api/login',
  },
}))

// Other non-api-prefixed backend endpoints
app.use(['/customer', '/merchant'], createProxyMiddleware({
  target: BACKEND,
  changeOrigin: true,
  secure: false,
  logLevel: 'warn',
}))

app.use(express.static(DIST_DIR, {
  maxAge: '1y',
  index: false,
}))

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT} (proxying /api -> ${BACKEND})`)
})


